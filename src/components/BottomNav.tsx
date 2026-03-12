import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, ArrowLeftRight, Truck, Users, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, labelKey: 'home' },
  { path: '/transactions', icon: ArrowLeftRight, labelKey: 'transactions' },
  { path: '/suppliers', icon: Truck, labelKey: 'suppliers' },
  { path: '/resellers', icon: Users, labelKey: 'resellers' },
  { path: '/reports', icon: BarChart3, labelKey: 'reports' },
];

const BottomNav = () => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const items = isRTL ? [...navItems].reverse() : navItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'gradient-card-primary shadow-gradient' : ''}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : ''}`} />
              </div>
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
