import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-card-primary flex items-center justify-center shadow-gradient mx-auto mb-4">
            <Wallet className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('createAccount')}</h1>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('name')}</label>
            <input className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('businessName')}</label>
            <input className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('phone')}</label>
            <input className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('password')}</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 pe-11 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Link to="/" className="block w-full py-3 rounded-xl gradient-card-primary text-primary-foreground font-semibold text-center shadow-gradient hover:opacity-90 transition-opacity">
            {t('createAccount')}
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')} <Link to="/login" className="text-primary font-medium">{t('signIn')}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
