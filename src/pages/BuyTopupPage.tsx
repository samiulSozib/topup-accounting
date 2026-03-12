// pages/BuyTopupPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchSuppliers, selectAllSuppliers } from '@/redux/slices/supplierSlice';
import { buyTopupFromSupplier, selectTransactionsLoading } from '@/redux/slices/topUpTransactionSlice';
import { successAlert, errorAlert } from '@/util/alert';

const BuyTopupPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const suppliers = useAppSelector(selectAllSuppliers);
  const isLoading = useAppSelector(selectTransactionsLoading);
  
  const [supplierId, setSupplierId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    dispatch(fetchSuppliers({ item_per_page: 100 }));
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const amount = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const bonusAmount = selectedSupplier ? amount * (selectedSupplier.bonus_percentage / 100) : 0;
  const totalTopup = amount + bonusAmount; // This is what I receive from supplier
  const dueAmount = amount - paid; // What I still owe to supplier

  const validateForm = () => {
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
    if (paid > totalTopup) {
      errorAlert(t('paidExceedsTotal'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(buyTopupFromSupplier({
        supplier_id: parseInt(supplierId),
        base_amount: amount,
        paid_amount: paid || 0,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (buyTopupFromSupplier.fulfilled.match(result)) {
        successAlert(t('topupPurchased'));
        // Reset form
        setSupplierId('');
        setBaseAmount('');
        setPaidAmount('');
        setReference('');
        setNotes('');
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-card rounded-2xl border p-6 space-y-5"
      >
        <h1 className="text-xl font-bold text-foreground">{t('buyTopup')}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('selectSupplier')} <span className="text-destructive">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">{t('selectSupplier')}</option>
              {suppliers
                .filter(s => s.status === 1)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.company} ({s.bonus_percentage}% {t('bonus')})
                  </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('baseAmount')} <span className="text-destructive">*</span>
            </label>
            <input 
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={baseAmount}
              onChange={e => setBaseAmount(e.target.value)}
              disabled={isLoading}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('baseAmountHint')}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('paidAmount')}
            </label>
            <input 
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              disabled={isLoading}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('paidAmountHint')}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <input 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={reference}
              onChange={e => setReference(e.target.value)}
              disabled={isLoading}
              placeholder={t('referencePlaceholder')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('notes')}
            </label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20 disabled:opacity-50"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isLoading}
              placeholder={t('notesPlaceholder')}
            />
          </div>
        </div>
      </motion.div>

      {amount > 0 && selectedSupplier && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="gradient-card-primary rounded-2xl p-5 text-primary-foreground shadow-gradient"
        >
          <h3 className="text-sm font-medium opacity-80 mb-3">{t('liveCalculation')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('baseAmount')} (I pay)</span>
              <span>{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('bonus')} ({selectedSupplier.bonus_percentage}%)</span>
              <span className="text-emerald-300">+{bonusAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="h-px bg-primary-foreground/20 my-1" />
            <div className="flex justify-between font-bold text-lg">
              <span>{t('totalTopup')} (I receive)</span>
              <span>{totalTopup.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {paid > 0 && (
              <>
                <div className="flex justify-between text-sm text-emerald-300">
                  <span>{t('paidNow')}</span>
                  <span>-{paid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>{t('dueToSupplier')}</span>
                  <span>{dueAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl gradient-card-primary text-primary-foreground font-semibold shadow-gradient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t('processing')}
          </>
        ) : (
          t('confirmPurchase')
        )}
      </button>
    </div>
  );
};

export default BuyTopupPage;