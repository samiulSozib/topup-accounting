// pages/LoginPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { loginBusinessOwner, selectAuthLoading, selectAuthError, clearError } from '../redux/slices/businessOwnerSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { errorAlert, successAlert } from '@/util/alert';

const LoginPage = () => {
  const { t } = useLanguage();
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
        // Navigate to dashboard or home page
        navigate('/');
      }
    } catch (error) {
      // This will be caught by the rejected case in the slice
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-card-primary flex items-center justify-center shadow-gradient mx-auto mb-4">
            <Wallet className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('welcomeBack')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('manageYourBusiness')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('phoneOrEmail')}
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="01798778977"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 pe-11 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-end">
            <Link 
              to="/forgot-password" 
              className="text-xs text-primary font-medium hover:underline"
            >
              {t('forgotPasswordQ')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="block w-full py-3 rounded-xl gradient-card-primary text-primary-foreground font-semibold text-center shadow-gradient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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