// components/models/BuyPackageModal.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  submitPackageRequest,
  selectPackageRequestSubmitting,
  selectPackageRequestSuccess,
  selectPackageRequestError,
  selectPackageRequestStatusCode,
  resetSuccess,
  clearPackageRequestError
} from '@/redux/slices/packageRequestSlice';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';
import { errorAlert, successAlert } from '@/util/alert';
import { SubscriptionPackage } from '@/type/subscriptionPackage';

interface BuyPackageModalProps {
  package: SubscriptionPackage;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyPackageModal = ({ package: pkg, onClose, onSuccess }: BuyPackageModalProps) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const isSubmitting = useAppSelector(selectPackageRequestSubmitting);
  const success = useAppSelector(selectPackageRequestSuccess);
  const error = useAppSelector(selectPackageRequestError);
  const statusCode = useAppSelector(selectPackageRequestStatusCode);

  const [step, setStep] = useState<'info' | 'success'>('info');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: ''
  });

  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: ''
  });

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle success
  useEffect(() => {
    if (success) {
      setStep('success');
      dispatch(resetSuccess());
    }
  }, [success, dispatch]);

  // Handle error - show specific message from API
  useEffect(() => {
    if (error) {
      errorAlert(error);
      dispatch(clearPackageRequestError());
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors = {
      full_name: '',
      email: '',
      phone_number: '',
      address: ''
    };
    let isValid = true;

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('fullNameRequired');
      isValid = false;
    }

   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
      isValid = false;
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t('phoneRequired');
      isValid = false;
    } else if (!/^[+]?[\d\s-]+$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = t('invalidPhone');
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = t('addressRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    dispatch(submitPackageRequest({
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.trim(),
      address: formData.address.trim(),
      date_of_birth: formData.date_of_birth || undefined,
      package_id: pkg.id
    }));
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    onClose();
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount)).replace('BDT', '');
  };

  const getDurationLabel = () => {
    if (pkg.duration_type === 'months') return `${pkg.duration_value} Month${pkg.duration_value > 1 ? 's' : ''}`;
    if (pkg.duration_type === 'yearly') return `Yearly (${pkg.duration_value} Months)`;
    if (pkg.duration_type === 'custom') return `${pkg.duration_value} Months`;
    return `${pkg.duration_value} ${pkg.duration_type}`;
  };

  const getPlatformIcon = () => {
    if (pkg.web_access && pkg.mobile_access) {
      return (
        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
          <Laptop className="w-4 h-4" />
          <Smartphone className="w-4 h-4" />
        </div>
      );
    }
    if (pkg.web_access) return <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    if (pkg.mobile_access) return <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />;
    return null;
  };

  // Success Step
  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md"
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('requestSubmitted')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('requestSuccessMessage')}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('requestDetails')}</p>
              <p className="text-sm text-gray-900 dark:text-white mb-1">
                <span className="font-medium">{t('name')}:</span> {formData.full_name}
              </p>
              <p className="text-sm text-gray-900 dark:text-white mb-1">
                <span className="font-medium">{t('email')}:</span> {formData.email}
              </p>
              <p className="text-sm text-gray-900 dark:text-white mb-1">
                <span className="font-medium">{t('phone')}:</span> {formData.phone_number}
              </p>
              <p className="text-sm text-gray-900 dark:text-white mb-1">
                <span className="font-medium">{t('package')}:</span> {pkg.name}
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{t('status')}:</span> 
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {t('pending')}
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              {t('done')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('requestPackage')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('fillYourDetails')}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Package Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{pkg.name}</h4>
                  {getPlatformIcon()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {getDurationLabel()}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-primary">{formatCurrency(pkg.price)}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{pkg.currency}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('fullName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                  placeholder={t('enterFullName')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('email')} 
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                  placeholder={t('enterEmail')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.phone_number ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                  placeholder={t('enterPhoneNumber')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone_number && (
                <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('address')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.address ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                  placeholder={t('enterAddress')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t('dateOfBirth')} <span className="text-gray-400 text-xs">({t('optional')})</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t('requestInfoMessage')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
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
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                t('submitRequest')
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BuyPackageModal;