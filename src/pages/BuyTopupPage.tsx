// pages/BuyTopupPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import { buyTopup } from '@/redux/slices/transactionSlice';
import { BuyTopupRequest } from '@/type/topUpTransaction';
import { successAlert, errorAlert } from '@/util/alert';
import { ArrowLeft, ShoppingCart, Percent, DollarSign, FileText, Calendar } from 'lucide-react';

const BuyTopupPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const suppliers = useAppSelector((state: RootState) => state.suppliers.suppliers);
  const isLoading = useAppSelector((state: RootState) => state.transactions.loading);
  
  const [supplierId, setSupplierId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    dispatch(fetchSuppliers({ 
      page: 1, 
      item_per_page: 100,
    }));
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const amount = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const bonusAmount = selectedSupplier ? amount * (selectedSupplier.bonus_percentage / 100) : 0;
  const totalTopup = amount + bonusAmount;
  const dueAmount = Math.max(0, amount - paid);

  const validateForm = (): boolean => {
    if (!supplierId) {
      errorAlert(t('selectSupplierRequired'));
      return false;
    }
    if (!baseAmount || amount <= 0) {
      errorAlert(t('validAmountRequired'));
      return false;
    }
    if (paid < 0) {
      errorAlert(t('validPaidAmountRequired'));
      return false;
    }
    if (paid > amount) {
      errorAlert(t('paidExceedsTotal'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const requestData: BuyTopupRequest = {
      supplier_id: parseInt(supplierId),
      base_amount: amount,
      paid_amount: paid || 0,
      reference_no: reference || undefined,
      notes: notes || undefined
    };

    try {
      const result = await dispatch(buyTopup(requestData));

      if (buyTopup.fulfilled.match(result)) {
        successAlert(t('topupPurchased'));
        // Navigate to transactions page after successful purchase
        navigate('/transactions');
      } else {
        errorAlert(result.payload as string || t('operationFailed'));
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    }
  };

  const handleCancel = () => {
    navigate('/suppliers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('buyTopup')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('purchaseFromSupplier')}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Supplier Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('selectSupplier')} <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">{t('selectSupplierPlaceholder')}</option>
                {suppliers
                  .filter(s => s.status === 1)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.company} ({s.bonus_percentage}% {t('bonus')})
                    </option>
                ))}
              </select>
            </div>

            {/* Base Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('baseAmount')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
                  value={baseAmount}
                  onChange={e => setBaseAmount(e.target.value)}
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('baseAmountHint')}</p>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('paidAmount')}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('paidAmountHint')}</p>
            </div>

            {/* Reference Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('referenceNumber')}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  disabled={isLoading}
                  placeholder={t('referencePlaceholder')}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('notes')}
              </label>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20 disabled:opacity-50"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={isLoading}
                placeholder={t('notesPlaceholder')}
              />
            </div>
          </div>
        </motion.div>

        {/* Live Calculation Card */}
        {amount > 0 && selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="mt-4 bg-gradient-to-br from-primary to-primary/70 rounded-xl p-5 text-white shadow-lg"
          >
            <h3 className="text-sm font-medium opacity-80 mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              {t('liveCalculation')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('baseAmount')}</span>
                <span className="font-medium">
                  {amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('bonus')} ({selectedSupplier.bonus_percentage}%)</span>
                <span className="text-emerald-300 font-medium">
                  +{bonusAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="h-px bg-white/20 my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('totalTopup')}</span>
                <span>{totalTopup.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              {paid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-emerald-300">
                    <span>{t('paidNow')}</span>
                    <span>-{paid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium bg-white/10 p-2 rounded-lg">
                    <span>{t('dueToSupplier')}</span>
                    <span className={dueAmount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                      {dueAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !supplierId || !baseAmount}
          className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('processing')}
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {t('confirmPurchase')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BuyTopupPage;