// components/models/buyTopupModal.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hook';
import { buyTopup } from '@/redux/slices/transactionSlice';
import { Supplier } from '@/type/supplier';
import { BuyTopupRequest } from '@/type/topUpTransaction';
import { successAlert, errorAlert } from '@/util/alert';
import { X, ShoppingCart, DollarSign, Percent, FileText, Loader2 } from 'lucide-react';

interface BuyTopupModalProps {
  supplier: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyTopupModal = ({ supplier, onClose, onSuccess }: BuyTopupModalProps) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const [baseAmount, setBaseAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const bonusAmount = amount * (supplier.bonus_percentage / 100);
  const totalTopup = amount + bonusAmount;
  const dueAmount = Math.max(0, amount - paid);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateForm = (): boolean => {
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
      supplier_id: supplier.id,
      base_amount: amount,
      paid_amount: paid || 0,
      reference_no: reference || undefined,
      notes: notes || undefined
    };

    setIsSubmitting(true);
    try {
      const result = await dispatch(buyTopup(requestData));

      if (buyTopup.fulfilled.match(result)) {
        successAlert(t('topupPurchased'));
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
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('buyTopup')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {supplier.name} · {supplier.company} ({supplier.bonus_percentage}% {t('bonus')})
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
                onChange={(e) => setBaseAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="0.00"
                disabled={isSubmitting}
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
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="0.00"
                disabled={isSubmitting}
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
          {amount > 0 && (
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <h4 className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
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
                  <span className="text-gray-500 dark:text-gray-400">{t('bonus')} ({supplier.bonus_percentage}%)</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    +{bonusAmount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700 dark:text-gray-300">{t('totalTopup')}</span>
                  <span className="text-primary">{totalTopup.toLocaleString()}</span>
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
                      <span className="text-gray-600 dark:text-gray-400">{t('dueToSupplier')}</span>
                      <span className={dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
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
              disabled={isSubmitting || !baseAmount}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {t('confirmPurchase')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BuyTopupModal;