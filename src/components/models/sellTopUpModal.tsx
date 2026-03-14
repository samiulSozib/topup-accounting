// components/models/sellTopupModal.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hook';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import { sellTopup } from '@/redux/slices/transactionSlice';
import { Reseller } from '@/type/reseller';
import { Supplier } from '@/type/supplier';
import { SellTopupRequest } from '@/type/topUpTransaction';
import { successAlert, errorAlert } from '@/util/alert';
import { 
  X, ShoppingCart, DollarSign, Percent, FileText, Loader2, 
  Building2, Package, AlertCircle 
} from 'lucide-react';

interface SellTopupModalProps {
  reseller: Reseller;
  onClose: () => void;
  onSuccess: () => void;
}

const SellTopupModal = ({ reseller, onClose, onSuccess }: SellTopupModalProps) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  
  const [supplierId, setSupplierId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    loadSuppliers();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const result = await dispatch(fetchSuppliers({ 
        page: 1, 
        item_per_page: 100,
        // status: 'active'
      }));
      
      if (fetchSuppliers.fulfilled.match(result)) {
        // Access suppliers from the result
        const suppliersData = result.payload?.suppliers || [];
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Check stock when supplier changes
  useEffect(() => {
    if (supplierId) {
      checkStock();
    } else {
      setAvailableStock(null);
    }
  }, [supplierId]);

  const checkStock = async () => {
    if (!supplierId) return;
    
    setCheckingStock(true);
    try {
      // Get supplier from state
      const supplier = suppliers.find(s => s.id === parseInt(supplierId));
      if (supplier) {
        setAvailableStock(supplier.current_stock || 0);
      }
    } catch (error) {
      errorAlert(t('stockCheckFailed'));
    } finally {
      setCheckingStock(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const amount = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const bonusAmount = amount * (reseller.bonus_percentage / 100);
  const totalTopup = amount + bonusAmount;
  const dueAmount = Math.max(0, amount - paid);
  const isStockExceeded = availableStock !== null && totalTopup > availableStock;

  const handleBaseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value) || 0;
    const calculatedTotal = numValue + (numValue * (reseller.bonus_percentage / 100));
    
    if (availableStock !== null && calculatedTotal > availableStock) {
      const maxBase = availableStock / (1 + reseller.bonus_percentage / 100);
      setBaseAmount(maxBase.toFixed(2));
      errorAlert(t('amountExceedsStock').replace('{stock}', availableStock.toLocaleString()));
    } else {
      setBaseAmount(value);
    }
  };

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
    if (availableStock !== null && totalTopup > availableStock) {
      errorAlert(t('insufficientStock').replace('{stock}', availableStock.toLocaleString()));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const requestData: SellTopupRequest = {
      reseller_id: reseller.id,
      supplier_id: parseInt(supplierId),
      base_amount: amount,
      paid_amount: paid || 0,
      reference_no: reference || undefined,
      notes: notes || undefined
    };

    setIsSubmitting(true);
    try {
      const result = await dispatch(sellTopup(requestData));

      if (sellTopup.fulfilled.match(result)) {
        successAlert(t('topupSold'));
        onSuccess();
        onClose();
      } else {
        errorAlert(result.payload as string || t('operationFailed'));
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header - Fixed */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('sellTopup')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {reseller.name} · {reseller.city} ({reseller.bonus_percentage}% {t('bonus')})
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Supplier Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('selectSupplier')} <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              disabled={isSubmitting || loadingSuppliers}
            >
              <option value="">{t('selectSupplierPlaceholder')}</option>
              {suppliers
                .filter(s => s.status === 1)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.company} ({s.bonus_percentage}% {t('bonus')}) · {t('stock')}: {s.current_stock || 0}
                  </option>
              ))}
            </select>
            {loadingSuppliers && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('loading')}
              </p>
            )}
            {checkingStock && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('checkingStock')}
              </p>
            )}
            {availableStock !== null && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {t('availableStock')}: <span className="font-bold">{availableStock.toLocaleString()}</span>
                </span>
              </div>
            )}
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
                value={baseAmount}
                onChange={handleBaseAmountChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isStockExceeded 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-primary/30'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-primary outline-none transition-all`}
                placeholder="0.00"
                disabled={isSubmitting || !supplierId}
              />
            </div>
            {isStockExceeded && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('exceedsStock')}
              </p>
            )}
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
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="0.00"
                disabled={isSubmitting || !baseAmount}
              />
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder={t('referencePlaceholder')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20"
              placeholder={t('notesPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Live Calculation */}
          {amount > 0 && selectedSupplier && (
            <div className={`p-4 rounded-lg ${
              isStockExceeded 
                ? 'bg-red-50 dark:bg-red-500/10' 
                : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-600/10'
            }`}>
              <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {t('liveCalculation')}
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('baseAmount')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('bonus')} ({reseller.bonus_percentage}%)</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    +{bonusAmount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700 dark:text-gray-300">{t('totalTopup')}</span>
                  <span className={isStockExceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {totalTopup.toLocaleString()}
                  </span>
                </div>
                {paid > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('paidNow')}</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        -{paid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium bg-gray-100 dark:bg-gray-700 p-1.5 rounded">
                      <span className="text-gray-600 dark:text-gray-400">{t('dueFromReseller')}</span>
                      <span className={dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                {availableStock !== null && (
                  <div className={`text-xs mt-2 p-2 rounded-lg ${
                    isStockExceeded 
                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' 
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {isStockExceeded 
                      ? `⚠️ ${t('insufficientStockWarning')}`
                      : `✅ ${t('stockAfterSale')}: ${(availableStock - totalTopup).toLocaleString()}`
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !supplierId || !baseAmount || isStockExceeded}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium text-sm shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {t('confirmSale')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellTopupModal;