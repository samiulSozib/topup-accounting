// pages/ViewResellerPage.tsx

import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, MapPin, Percent, DollarSign, Calendar,
  ShoppingCart, CreditCard, Eye, Pencil, Ban, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Package, AlertCircle, Clock,
  Wallet, Users, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw,
  ChevronDown, ChevronUp, Download, Printer, Share2, Star,
  Award, Gift, PieChart, BarChart3, Activity, Target,
  LucideIcon
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import {
  fetchResellerById,
  fetchResellerStatistics,
} from '@/redux/slices/resellerSlice';
import { fetchTransactions } from '@/redux/slices/transactionSlice';
import { Reseller } from '@/type/reseller';
import { TopUpTransaction } from '@/type/topUpTransaction';
import { successAlert, errorAlert } from '@/util/alert';
import UpdateResellerPercentageModal from '@/components/models/updateResellerPercentage';
import CollectionModal from '@/components/models/collectionModal';
import SellTopupModal from '@/components/models/sellTopUpModal';

// Statistics Card Component - Smaller Size
const StatCard = ({
  label,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subValue
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'rose' | 'purple' | 'emerald';
  trend?: { value: number; label: string };
  subValue?: string;
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500 to-rose-600 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-3 sm:p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color].split(' ')[2]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${
            trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {trend.value >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">{label}</p>
      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
      {subValue && (
        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 truncate">{subValue}</p>
      )}
    </motion.div>
  );
};

// Transaction Row Component - Compact for Mobile
const TransactionRow = ({
  transaction,
  type,
  currencyCode = 'AFG'
}: {
  transaction: TopUpTransaction;
  type: 'purchase' | 'sale' | 'payment' | 'collection';
  currencyCode?: string;
}) => {
  const { t } = useLanguage();

  const getTransactionIcon = () => {
    switch (type) {
      case 'purchase': return <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'sale': return <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'payment': return <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'collection': return <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getTransactionColor = () => {
    switch (type) {
      case 'purchase': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      case 'sale': return 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      case 'payment': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      case 'collection': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins}${t('m')}`;
    if (diffHours < 24) return `${diffHours}${t('h')}`;
    if (diffDays < 7) return `${diffDays}${t('d')}`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${formattedAmount} ${currencyCode}`;
  };

  return (
    <div className="flex items-center justify-between py-2 sm:py-3 px-2 sm:px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${getTransactionColor()}`}>
          {getTransactionIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {transaction.supplier?.name || '—'}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className={`text-xs sm:text-sm font-semibold ${
          type === 'sale' || type === 'collection'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}>
          {type === 'sale' || type === 'collection' ? '+' : '-'}
          {formatCurrency(transaction.base_amount || 0)}
        </p>
        {transaction.paid_amount ? (
          <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400">
            {t('paid')}: {formatCurrency(transaction.paid_amount)}
          </p>
        ) : (
          <p className="text-[8px] sm:text-xs text-amber-600 dark:text-amber-400">
            {t('due')}
          </p>
        )}
      </div>
    </div>
  );
};

const ViewResellerPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const reseller = useAppSelector((state: RootState) => state.resellers.selectedReseller);
  const statistics = useAppSelector((state: RootState) => state.resellers.resellerStatistics);
  const isLoading = useAppSelector((state: RootState) => state.resellers.loading);
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions);
  const authState = useAppSelector((state: RootState) => state.businessOwner);

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedResellerForPercentage, setSelectedResellerForPercentage] = useState<Reseller | null>(null);
  const [selectedResellerForCollection, setSelectedResellerForCollection] = useState<Reseller | null>(null);
  const [selectedResellerForSell, setSelectedResellerForSell] = useState<Reseller | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get currency code from auth state
  const currencyCode = authState?.businessOwner?.currency?.code || 'AFG';

  // Format currency with currency code at the end
  const formatCurrency = (amount: number): string => {
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${formattedAmount} ${currencyCode}`;
  };

  useEffect(() => {
    if (id) {
      loadResellerData();
    }
  }, [id]);

  const loadResellerData = async () => {
    if (!id) return;

    setRefreshing(true);
    await Promise.all([
      dispatch(fetchResellerById(parseInt(id))),
      dispatch(fetchResellerStatistics({ id: parseInt(id) })),
      dispatch(fetchTransactions({
        reseller_id: parseInt(id),
        limit: 50
      }))
    ]);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    loadResellerData();
  };

  const handleBack = () => {
    navigate('/resellers');
  };

  const handleEdit = () => {
    if (reseller) {
      navigate('/add-reseller', { state: { reseller } });
    }
  };

  const handleUpdatePercentage = () => {
    if (reseller) {
      setSelectedResellerForPercentage(reseller);
    }
  };

  const handleSell = () => {
    if (reseller) {
      setSelectedResellerForSell(reseller);
    }
  };

  const handleCollection = () => {
    if (reseller) {
      setSelectedResellerForCollection(reseller);
    }
  };

  const handleCloseModal = () => {
    setSelectedResellerForPercentage(null);
    setSelectedResellerForCollection(null);
    setSelectedResellerForSell(null);
  };

  const handleSuccess = () => {
    loadResellerData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {t('active')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
          <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {t('inactive')}
        </span>
      );
    }
  };

  // Filter transactions for this reseller
  const resellerTransactions = transactions.filter(tx =>
    tx.reseller_id === reseller?.id
  );

  const saleTransactions = resellerTransactions.filter(tx => tx.transaction_type === 'sale');
  const paymentTransactions = resellerTransactions.filter(tx => tx.transaction_type === 'reseller_payment');

  // Use data from reseller API directly
  const totalSales = reseller?.total_sell_amount || 0;
  const totalBonus = (reseller?.total_sell_topup_with_bonus || 0) - (reseller?.total_sell_amount || 0);
  const totalCollected = reseller?.total_received_amount || 0;
  const totalDue = reseller?.total_due_amount || 0;

  const collectionRate = totalSales > 0 ? ((totalCollected / totalSales) * 100).toFixed(1) : '0';

  if (isLoading && !reseller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{t('resellerNotFound')}</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">{t('resellerNotFoundDesc')}</p>
          <button
            onClick={handleBack}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors"
          >
            {t('backToResellers')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                  {reseller.name}
                </h1>
                {getStatusBadge(reseller.status)}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 sm:gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{reseller.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={handleRefresh}
              className="p-1.5 sm:p-2.5 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden xs:inline">{t('edit')}</span>
            </button>
            <button
              onClick={handleSell}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-primary to-primary/70 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t('sell')}</span>
            </button>
            {totalDue > 0 && (
              <button
                onClick={handleCollection}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t('collect')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Cards - Smaller Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label={t('totalSales')}
            value={formatCurrency(totalSales)}
            icon={TrendingUp}
            color="green"
            subValue={`${saleTransactions.length} ${t('transactions')}`}
          />
          <StatCard
            label={t('totalDue')}
            value={formatCurrency(totalDue)}
            icon={AlertCircle}
            color="rose"
            subValue={`${saleTransactions.filter(tx => (tx.base_amount - (tx.paid_amount || 0) > 0)).length} ${t('pending')}`}
          />
          <StatCard
            label={t('totalReceived')}
            value={formatCurrency(totalCollected)}
            icon={Wallet}
            color="emerald"
            subValue={`${collectionRate}% ${t('collectionRate')}`}
          />
          <StatCard
            label={t('totalBonus')}
            value={formatCurrency(totalBonus)}
            icon={Gift}
            color="purple"
            subValue={`${reseller.bonus_percentage}% ${t('bonus')}`}
          />
        </div>

        {/* Tabs - Scrollable on Mobile */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-4 sm:gap-6 min-w-max sm:min-w-0 px-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 sm:pb-4 px-1 text-xs sm:text-sm font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('overview')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-3 sm:pb-4 px-1 text-xs sm:text-sm font-medium transition-colors relative ${
                activeTab === 'transactions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('transactions')}
              {resellerTransactions.length > 0 && (
                <span className="ml-1.5 sm:ml-2 px-1.5 py-0.5 text-[9px] sm:text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                  {resellerTransactions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 sm:pb-4 px-1 text-xs sm:text-sm font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('analytics')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Contact & Info - Compact */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('contactInformation')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <Phone className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('phone')}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{reseller.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('city')}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{reseller.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('memberSince')}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(reseller.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <Percent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('bonusPercentage')}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{reseller.bonus_percentage}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary - Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('salesSummary')}</h2>
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalSales')}</span>
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatCurrency(totalSales)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalBonus')}</span>
                      <span className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalBonus)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalWithBonus')}</span>
                      <span className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(reseller.total_sell_topup_with_bonus || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('paymentSummary')}</h2>
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalReceived')}</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCollected)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalDue')}</span>
                      <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalDue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('collectionRate')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            style={{ width: `${collectionRate}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{collectionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Scrollable on Mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('quickActions')}</h2>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 overflow-x-auto pb-1">
                  <button
                    onClick={handleSell}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-colors group min-w-[70px] sm:min-w-0"
                  >
                    <div className="p-1.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('sellTopup')}</span>
                  </button>
                  {totalDue > 0 && (
                    <button
                      onClick={handleCollection}
                      className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 transition-colors group min-w-[70px] sm:min-w-0"
                    >
                      <div className="p-1.5 sm:p-3 bg-emerald-500/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                        <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" />
                      </div>
                      <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('collectDue')}</span>
                    </button>
                  )}
                  <button
                    onClick={handleUpdatePercentage}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 transition-colors group min-w-[70px] sm:min-w-0"
                  >
                    <div className="p-1.5 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                      <Percent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('updateBonus')}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 hover:from-gray-500/20 hover:to-gray-500/10 transition-colors group min-w-[70px] sm:min-w-0"
                  >
                    <div className="p-1.5 sm:p-3 bg-gray-500/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                      <Printer className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('printReport')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('transactionHistory')}</h2>
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    {showAllTransactions ? t('showLess') : t('viewAll')}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {resellerTransactions.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('noTransactions')}</p>
                  </div>
                ) : (
                  (showAllTransactions ? resellerTransactions : resellerTransactions.slice(0, 10)).map((tx, index) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      type={tx.transaction_type === 'sale' ? 'sale' : 'collection'}
                      currencyCode={currencyCode}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {statistics && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">{t('summary')}</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('totalSales')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(statistics.summary?.total_sale_amount || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('totalReceived')}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(statistics.summary?.total_received || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('totalDue')}</span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">
                            {formatCurrency(statistics.summary?.total_due || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('collectionRatio')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {statistics.summary?.collection_ratio || '0'}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 sm:col-span-2">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">{t('supplierBreakdown')}</h3>
                      <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {statistics.supplier_breakdown?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{item.supplier?.name}</p>
                              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">{item.transaction_count} {t('transactions')}</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total_purchases)}</p>
                              <p className="text-[9px] sm:text-xs text-purple-600 dark:text-purple-400">{t('bonus')}: {formatCurrency(item.total_with_bonus)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {selectedResellerForPercentage && (
            <UpdateResellerPercentageModal
              reseller={selectedResellerForPercentage}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          )}

          {selectedResellerForCollection && (
            <CollectionModal
              reseller={selectedResellerForCollection}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          )}

          {selectedResellerForSell && (
            <SellTopupModal
              reseller={selectedResellerForSell}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewResellerPage;
