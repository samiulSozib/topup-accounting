// components/Header.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Bell, Wallet, LogOut, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { logoutBusinessOwner, selectBusinessOwner } from '@/redux/slices/businessOwnerSlice';
import { successAlert } from '@/util/alert';

const Header = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const businessOwner = useAppSelector(selectBusinessOwner);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initials from name
  const getInitials = () => {
    if (businessOwner?.name) {
      return businessOwner.name.charAt(0).toUpperCase();
    }
    return 'A';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutBusinessOwner());
      successAlert(t('logoutSuccess'));
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-xl gradient-card-primary flex items-center justify-center shadow-gradient">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">{t('appName')}</span>
        </div>
        <div className="hidden md:block" />
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full gradient-card-accent" />
          </button>
          
          <LanguageSwitcher />
          
          {/* User menu with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full gradient-card-purple flex items-center justify-center text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              {getInitials()}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute end-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-foreground truncate">
                    {businessOwner?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {businessOwner?.phone_number || ''}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('profile')}
                </button>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors border-t"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;