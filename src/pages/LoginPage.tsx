// pages/LoginPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff, Package, Sparkles } from 'lucide-react';
import { loginBusinessOwner, selectAuthLoading, selectAuthError, clearError } from '../redux/slices/businessOwnerSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { errorAlert, successAlert } from '@/util/alert';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LoginPage = () => {
  const { t, language, isRTL } = useLanguage(); // Get language and RTL state
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Show error alert when auth error changes
  useEffect(() => {
    if (authError) {
      errorAlert(authError);
    }
  }, [authError]);

  const validateForm = (): boolean => {
    if (!phoneNumber.trim()) {
      setLocalError(t('phoneRequired'));
      errorAlert(t('phoneRequired'));
      return false;
    }
    if (!password.trim()) {
      setLocalError(t('passwordRequired'));
      errorAlert(t('passwordRequired'));
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await dispatch(loginBusinessOwner({
        phone_number: phoneNumber,
        password: password
      }));

      if (loginBusinessOwner.fulfilled.match(result)) {
        successAlert(t('loginSuccess'));
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 relative">
      {/* Language Switcher - Properly positioned for both RTL and LTR */}
      <div className={`absolute top-4 sm:top-6 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}`}>
        <LanguageSwitcher />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm space-y-6"
        dir={isRTL ? 'rtl' : 'ltr'} // Set direction for the card
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('welcomeBack')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('manageYourBusiness')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('phoneOrEmail')}
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="01798778977"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 pe-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 end-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              to="/subscription-packages" 
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              {t('viewPackages')}
            </Link>
            <Link 
              to="/forgot-password" 
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('forgotPasswordQ')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-white font-semibold text-center shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('signingIn')}
              </span>
            ) : (
              t('signIn')
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;