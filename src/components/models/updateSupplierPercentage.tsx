// components/UpdatePercentageModal.tsx
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppDispatch } from '@/redux/hook';
import { updateSupplierPercentage } from '@/redux/slices/supplierSlice';
import { successAlert, errorAlert } from '@/util/alert';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ISupplier } from '@/type/supplier';

interface Props {
  supplier: ISupplier;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdatePercentageModal = ({ supplier, onClose, onSuccess }: Props) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const [percentage, setPercentage] = useState(supplier.bonus_percentage?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!percentage.trim()) {
      errorAlert(t('bonusRequired'));
      return;
    }

    const bonus = parseFloat(percentage);
    if (isNaN(bonus) || bonus < 0) {
      errorAlert(t('invalidBonus'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(updateSupplierPercentage({
        supplier_id: supplier.id,
        data: { bonus_percentage: bonus }
      }));

      if (updateSupplierPercentage.fulfilled.match(result)) {
        successAlert(t('percentageUpdated'));
        onSuccess();
        onClose();
      }
    } catch (error) {
      errorAlert(t('updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {t('updateBonusPercentage')} - {supplier.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('bonusPercentage')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl gradient-card-primary text-primary-foreground font-medium text-sm shadow-gradient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('updating')}
                </>
              ) : (
                t('update')
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdatePercentageModal;