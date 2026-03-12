// pages/AddSupplierPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  createSupplier,
  updateSupplier,
  selectSupplierLoading,
  selectSelectedSupplier,
} from '@/redux/slices/supplierSlice';
import { successAlert, errorAlert } from '@/util/alert';

const AddSupplierPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectSupplierLoading);
  const selectedSupplier = useAppSelector(selectSelectedSupplier);
  
  const editingSupplier = location.state?.supplier || selectedSupplier;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    bonus_percentage: '',
  });

  useEffect(() => {
    if (editingSupplier) {
      setForm({
        name: editingSupplier.name || '',
        phone: editingSupplier.phone || '',
        company: editingSupplier.company || '',
        bonus_percentage: editingSupplier.bonus_percentage?.toString() || '',
      });
    }
  }, [editingSupplier]);

  const validateForm = () => {
    if (!form.name.trim()) {
      errorAlert(t('nameRequired'));
      return false;
    }
    if (!form.phone.trim()) {
      errorAlert(t('supplierPhoneRequired'));
      return false;
    }
    if (!form.company.trim()) {
      errorAlert(t('companyRequired'));
      return false;
    }
    if (!form.bonus_percentage.trim()) {
      errorAlert(t('bonusRequired'));
      return false;
    }
    const bonus = parseFloat(form.bonus_percentage);
    if (isNaN(bonus) || bonus < 0) {
      errorAlert(t('invalidBonus'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const supplierData = {
        name: form.name,
        phone: form.phone,
        company: form.company,
        bonus_percentage: parseFloat(form.bonus_percentage),
      };

      let result;
      if (editingSupplier) {
        result = await dispatch(updateSupplier({
          supplier_id: editingSupplier.id,
          data: supplierData
        }));
      } else {
        result = await dispatch(createSupplier(supplierData));
      }

      if (createSupplier.fulfilled.match(result) || updateSupplier.fulfilled.match(result)) {
        successAlert(t(editingSupplier ? 'supplierUpdated' : 'supplierCreated'));
        navigate('/suppliers');
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border p-6 space-y-5">
        <h1 className="text-xl font-bold text-foreground">
          {editingSupplier ? t('editSupplier') : t('addSupplier')}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('supplierName')} <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('phone')} <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('phoneHint')}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('companyName')} <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('bonusPercentage')} <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              value={form.bonus_percentage}
              onChange={e => setForm({ ...form, bonus_percentage: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('bonusHint')}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/suppliers')}
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
                {t('saving')}
              </>
            ) : (
              t('submit')
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddSupplierPage;