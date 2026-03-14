// pages/AddResellerPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import {
  createReseller,
  updateReseller,
} from '@/redux/slices/resellerSlice';
import { CreateResellerRequest, UpdateResellerRequest } from '@/type/reseller';
import { successAlert, errorAlert } from '@/util/alert';
import { ArrowLeft, Users, Phone, MapPin, Percent, Save, X } from 'lucide-react';

const AddResellerPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector((state: RootState) => state.resellers.loading);
  
  const editingReseller = location.state?.reseller;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    bonus_percentage: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    city: '',
    bonus_percentage: '',
  });

  useEffect(() => {
    if (editingReseller) {
      setForm({
        name: editingReseller.name || '',
        phone: editingReseller.phone || '',
        city: editingReseller.city || '',
        bonus_percentage: editingReseller.bonus_percentage?.toString() || '',
      });
    }
  }, [editingReseller]);

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      city: '',
      bonus_percentage: '',
    };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = t('nameRequired');
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = t('phoneRequired');
      isValid = false;
    } else if (!/^[+]?[\d\s-]+$/.test(form.phone.trim())) {
      newErrors.phone = t('invalidPhone');
      isValid = false;
    }

    if (!form.city.trim()) {
      newErrors.city = t('cityRequired');
      isValid = false;
    }

    if (!form.bonus_percentage.trim()) {
      newErrors.bonus_percentage = t('bonusRequired');
      isValid = false;
    } else {
      const bonus = parseFloat(form.bonus_percentage);
      if (isNaN(bonus) || bonus < 0) {
        newErrors.bonus_percentage = t('invalidBonus');
        isValid = false;
      } else if (bonus > 100) {
        newErrors.bonus_percentage = t('bonusMaxExceeded');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const bonusPercentage = parseFloat(form.bonus_percentage);
      
      if (editingReseller) {
        const updateData: UpdateResellerRequest = {
          name: form.name,
          phone: form.phone,
          city: form.city,
          bonus_percentage: bonusPercentage,
        };

        const result = await dispatch(updateReseller({
          id: editingReseller.id,
          data: updateData
        }));

        if (updateReseller.fulfilled.match(result)) {
          successAlert(t('resellerUpdated'));
          navigate('/resellers');
        } else {
          errorAlert(result.payload as string || t('operationFailed'));
        }
      } else {
        const createData: CreateResellerRequest = {
          name: form.name,
          phone: form.phone,
          city: form.city,
          bonus_percentage: bonusPercentage,
        };

        const result = await dispatch(createReseller(createData));

        if (createReseller.fulfilled.match(result)) {
          successAlert(t('resellerCreated'));
          navigate('/resellers');
        } else {
          errorAlert(result.payload as string || t('operationFailed'));
        }
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    }
  };

  const handleCancel = () => {
    navigate('/resellers');
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingReseller ? t('editReseller') : t('addReseller')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingReseller 
                    ? t('editResellerDescription') 
                    : t('addResellerDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Reseller Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('resellerName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/30'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-primary outline-none transition-all`}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  disabled={isLoading}
                  placeholder={t('resellerNamePlaceholder')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/30'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-primary outline-none transition-all`}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  disabled={isLoading}
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('phoneHint')}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('city')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.city 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/30'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-primary outline-none transition-all`}
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  disabled={isLoading}
                  placeholder={t('cityPlaceholder')}
                />
              </div>
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            {/* Bonus Percentage */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('bonusPercentage')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.bonus_percentage 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-primary/30'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-primary outline-none transition-all`}
                  value={form.bonus_percentage}
                  onChange={e => setForm({ ...form, bonus_percentage: e.target.value })}
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>
              {errors.bonus_percentage ? (
                <p className="text-xs text-red-500 mt-1">{errors.bonus_percentage}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('bonusHint')}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingReseller ? t('update') : t('submit')}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddResellerPage;