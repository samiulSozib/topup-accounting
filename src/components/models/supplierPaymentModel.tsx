// components/models/supplierPaymentModal.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hook';
import { makeSupplierPayment } from '@/redux/slices/transactionSlice';
import { Supplier } from '@/type/supplier';
import { successAlert, errorAlert } from '@/util/alert';
import { DollarSign, X, Loader2, FileText } from 'lucide-react';

interface PaymentModalProps {
  supplier: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal = ({ supplier, onClose, onSuccess }: PaymentModalProps) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const dueAmount = supplier.total_due_amount || 0;

  const [amount, setAmount] = useState<string>(dueAmount.toString());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value) || 0;
    
    if (numValue > dueAmount) {
      setAmount(dueAmount.toString());
      errorAlert(t('paymentExceedsDue').replace('{due}', dueAmount.toLocaleString()));
    } else {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount <= 0) {
      errorAlert(t('validAmountRequired'));
      return;
    }

    if (numAmount > dueAmount) {
      errorAlert(t('paymentExceedsDue').replace('{due}', dueAmount.toLocaleString()));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(makeSupplierPayment({
        supplier_id: supplier.id,
        amount: numAmount,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (makeSupplierPayment.fulfilled.match(result)) {
        successAlert(t('paymentSuccessful'));
        onSuccess();
        onClose();
      } else {
        errorAlert(result.payload as string || t('paymentFailed'));
      }
    } catch (error) {
      errorAlert(t('paymentFailed'));
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('payDue')}
            </h3>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {supplier.name} · {supplier.company}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Due Amount Display */}
          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t('totalDue')}</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('paymentAmount')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0"
                max={dueAmount}
                step="0.01"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder={`${t('maxAmount')}: ${dueAmount.toLocaleString()}`}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('maxAmount')}: {dueAmount.toLocaleString()}
            </p>
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
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {t('confirmPayment')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;