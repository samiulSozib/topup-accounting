// pages/SubscriptionPackagesPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  fetchSubscriptionPackages,
  selectAllPackages,
  selectSubscriptionPackagesLoading,
  selectFeaturedPackages,
  selectWebPackages,
  selectMobilePackages,
  selectBothPlatformPackages
} from '@/redux/slices/subscriptionPackage';
import { 
  Package, 
  Globe, 
  Smartphone, 
  Laptop, 
  Clock, 
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  LucideIcon
} from 'lucide-react';
import BuyPackageModal from '@/components/models/buyPackageModal';
import LanguageSwitcher from '@/components/LanguageSwitcher'; // Import the LanguageSwitcher
import { SubscriptionPackage } from '@/type/subscriptionPackage';

type FilterType = 'all' | 'web' | 'mobile' | 'both' | 'featured';

const SubscriptionPackagesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const packages = useAppSelector(selectAllPackages);
  const featuredPackages = useAppSelector(selectFeaturedPackages);
  const webPackages = useAppSelector(selectWebPackages);
  const mobilePackages = useAppSelector(selectMobilePackages);
  const bothPackages = useAppSelector(selectBothPlatformPackages);
  const isLoading = useAppSelector(selectSubscriptionPackagesLoading);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [durationFilter, setDurationFilter] = useState<string>('all');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    dispatch(fetchSubscriptionPackages({
      sort_by: 'sort_order',
      sort_order: 'asc'
    }));
  };

  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowBuyModal(true);
  };

  const handleCloseModal = () => {
    setShowBuyModal(false);
    setSelectedPackage(null);
  };

  const handleSuccess = () => {
    // Navigate to login or show success message
    navigate('/login');
  };

  const getFilteredPackages = () => {
    let filtered = packages;

    // Apply type filter
    switch (activeFilter) {
      case 'web':
        filtered = webPackages;
        break;
      case 'mobile':
        filtered = mobilePackages;
        break;
      case 'both':
        filtered = bothPackages;
        break;
      case 'featured':
        filtered = featuredPackages;
        break;
      default:
        filtered = packages;
    }

    // Apply price filter
    filtered = filtered.filter(pkg => {
      const price = parseFloat(pkg.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply duration filter
    if (durationFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.duration_type === durationFilter);
    }

    return filtered;
  };

  const filteredPackages = getFilteredPackages();

  const getDurationLabel = (type: string, value: number) => {
    if (type === 'months') return `${value} ${value > 1 ? t('months_plural') : t('months')}`;
    if (type === 'yearly') return `${t('yearly')} (${value} ${t('months_plural')})`;
    if (type === 'custom') return `${value} ${t('months_plural')}`;
    return `${value} ${type}`;
  };

  const getPlatformIcon = (pkg) => {
    if (pkg.web_access && pkg.mobile_access) {
      return (
        <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs">
          <Laptop className="w-3 h-3" />
          <Smartphone className="w-3 h-3" />
        </div>
      );
    }
    if (pkg.web_access) {
      return (
        <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
          <Laptop className="w-3 h-3" />
          <span>{t('web')}</span>
        </div>
      );
    }
    if (pkg.mobile_access) {
      return (
        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
          <Smartphone className="w-3 h-3" />
          <span>{t('mobile')}</span>
        </div>
      );
    }
    return null;
  };

  const filters: { key: FilterType; label: string; icon: LucideIcon; count: number }[] = [
    { key: 'all', label: t('allPackages'), icon: Package, count: packages.length },
    { key: 'featured', label: t('featured'), icon: Star, count: featuredPackages.length },
    { key: 'web', label: t('webOnly'), icon: Laptop, count: webPackages.length },
    { key: 'mobile', label: t('mobileOnly'), icon: Smartphone, count: mobilePackages.length },
    { key: 'both', label: t('bothPlatforms'), icon: Globe, count: bothPackages.length },
  ];

  // Stats for hero section
  const stats = [
    { label: t('totalPackages'), value: packages.length, icon: Package },
    { label: t('webPackages'), value: webPackages.length, icon: Laptop },
    { label: t('mobilePackages'), value: mobilePackages.length, icon: Smartphone },
    { label: t('featuredPackages'), value: featuredPackages.length, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20">
          {/* Add Language Switcher in the top right corner */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <LanguageSwitcher />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {t('subscriptionPackages')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              {t('choosePackageDescription')}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                  >
                    <Icon className="w-5 h-5 mx-auto mb-2 text-white/80" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-white/80">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Filters Section */}
        <div className="mb-8">
          {/* Filter Tabs - Scrollable on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.key
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === filter.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <Filter className="w-4 h-4" />
            {t('advancedFilters')}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('priceRange')} (AFG)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder={t('min')}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 500])}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder={t('max')}
                      />
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('duration')}
                    </label>
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">{t('allDurations')}</option>
                      <option value="months">{t('months')}</option>
                      <option value="yearly">{t('yearly')}</option>
                      <option value="custom">{t('custom')}</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                  pkg.is_featured 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Featured Badge */}
                {pkg.is_featured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      {t('featured')}
                    </div>
                  </div>
                )}

                {/* Header with Platform Icons */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>
                    {getPlatformIcon(pkg)}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {parseFloat(pkg.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{pkg.currency}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{getDurationLabel(pkg.duration_type, pkg.duration_value)}</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {pkg.web_access && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{t('webAccess')}</span>
                      </div>
                    )}
                    {pkg.mobile_access && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{t('mobileAccess')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">{t('fullSupport')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">{t('updatesIncluded')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleBuyClick(pkg)}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>{t('buyNow')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noPackagesFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('noPackagesDescription')}
            </p>
          </div>
        )}
      </div>

      {/* Buy Package Modal */}
      <AnimatePresence>
        {showBuyModal && selectedPackage && (
          <BuyPackageModal
            package={selectedPackage}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionPackagesPage;