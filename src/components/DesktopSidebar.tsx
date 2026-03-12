import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, ArrowLeftRight, Truck, Users, BarChart3, Wallet, ShoppingCart, CreditCard, BookOpen } from 'lucide-react';

const navGroups = [
  {
    items: [
      { path: '/', icon: Home, labelKey: 'home' },
      { path: '/transactions', icon: ArrowLeftRight, labelKey: 'transactions' },
    ],
  },
  {
    items: [
      { path: '/suppliers', icon: Truck, labelKey: 'suppliers' },
      { path: '/resellers', icon: Users, labelKey: 'resellers' },
    ],
  },
  {
    items: [
      { path: '/buy-topup', icon: ShoppingCart, labelKey: 'buyTopup' },
      { path: '/sell-topup', icon: CreditCard, labelKey: 'sellTopup' },
    ],
  },
  {
    items: [
      { path: '/supplier-ledger', icon: BookOpen, labelKey: 'supplierLedger' },
      { path: '/reseller-ledger', icon: Wallet, labelKey: 'resellerLedger' },
    ],
  },
  {
    items: [
      { path: '/reports', icon: BarChart3, labelKey: 'reports' },
    ],
  },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex flex-col w-[220px] bg-card border-e h-screen sticky top-0 py-6 px-3">
      <Link to="/" className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 rounded-xl gradient-card-primary flex items-center justify-center shadow-gradient">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground">{t('appName')}</span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="h-px bg-border my-2" />}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'gradient-card-primary text-primary-foreground shadow-gradient'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
