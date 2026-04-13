// pages/HomePage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, CreditCard, Truck, Users, Plus, 
  ArrowUpRight, ArrowDownLeft, Loader2, Calendar,
  PieChart, Package, AlertCircle, CheckCircle,
  Clock, BarChart3, ArrowRight, Sparkles, RefreshCw,
  LayoutGrid, Layers, Target, Award, Zap, Gift,
  TrendingUp as TrendingIcon, Menu, X, Eye, EyeOff,
  ChevronRight, Star, Shield, Globe, Bell, Settings,
  Moon, Sun, Download, Share2, Filter, Search,
  Grid, List, Heart, Bookmark, Flag, Home,
  LucideIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { 
  fetchTransactions, 
  fetchProfitStatistics,
  fetchDashboardSummary,
} from '@/redux/slices/transactionSlice';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import { fetchResellers } from '@/redux/slices/resellerSlice';
import { RootState } from '@/redux/store';

// Types
import { TopUpTransaction } from '@/type/topUpTransaction';
import { Supplier } from '@/type/supplier';
import { Reseller } from '@/type/reseller';

interface DashboardStats {
  totalStock: number;
  totalStockValue: number;
  supplierDue: number;
  resellerDue: number;
  todayProfit: number;
  monthlyProfit: number;
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  todayPurchaseAmount: number;
  todaySaleAmount: number;
  monthlyPurchaseAmount: number;
  monthlySaleAmount: number;
  pendingSupplierPayments: number;
  pendingResellerCollections: number;
  averageProfitMargin: number;
  totalBonusReceived: number;
  totalBonusGiven: number;
  netBonusImpact: number;
  totalPurchasedTopup: number;
  totalSoldTopup: number;
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  path: string;
  color: string;
  gradient: string;
  bgLight: string;
  textLight: string;
  description?: string;
}

const HomePage = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  
  // Selectors with proper typing
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions);
  const suppliers = useAppSelector((state: RootState) => state.suppliers.suppliers);
  const resellers = useAppSelector((state: RootState) => state.resellers.resellers);
  const profitStats = useAppSelector((state: RootState) => state.transactions.profitStatistics);
  const dashboardSummary = useAppSelector((state: RootState) => state.transactions.dashboardSummary);
  
  const transactionsLoading = useAppSelector((state: RootState) => state.transactions.loading);
  const suppliersLoading = useAppSelector((state: RootState) => state.suppliers.loading);
  const resellersLoading = useAppSelector((state: RootState) => state.resellers.loading);
  
  const isLoading = transactionsLoading || suppliersLoading || resellersLoading;
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    totalStockValue: 0,
    supplierDue: 0,
    resellerDue: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    totalPurchaseAmount: 0,
    totalSaleAmount: 0,
    todayPurchaseAmount: 0,
    todaySaleAmount: 0,
    monthlyPurchaseAmount: 0,
    monthlySaleAmount: 0,
    pendingSupplierPayments: 0,
    pendingResellerCollections: 0,
    averageProfitMargin: 0,
    totalBonusReceived: 0,
    totalBonusGiven: 0,
    netBonusImpact: 0,
    totalPurchasedTopup: 0,
    totalSoldTopup: 0
  });

  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [refreshing, setRefreshing] = useState(false);

  // Date ranges
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const tomorrow = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }, [today]);

  const weekStart = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 7);
    return date;
  }, [today]);

  const monthStart = useMemo(() => {
    const date = new Date(today.getFullYear(), today.getMonth(), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [today]);

  const monthEnd = useMemo(() => {
    const date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [today]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchTransactions({ page: 1, limit: 100 })),
      dispatch(fetchSuppliers({ page: 1, item_per_page: 100 })),
      dispatch(fetchResellers({ page: 1, item_per_page: 100 })),
      dispatch(fetchProfitStatistics()),
      dispatch(fetchDashboardSummary())
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculate dashboard stats
  useEffect(() => {
    if (transactions.length > 0) {
      calculateDashboardStats();
    }
  }, [transactions, profitStats]);

  const calculateDashboardStats = () => {
    let totalPurchasedTopup = 0;
    let totalSoldTopup = 0;
    let totalPurchaseAmount = 0;
    let totalSaleAmount = 0;
    let todayPurchaseAmount = 0;
    let todaySaleAmount = 0;
    let weeklyPurchaseAmount = 0;
    let weeklySaleAmount = 0;
    let monthlyPurchaseAmount = 0;
    let monthlySaleAmount = 0;
    let supplierDue = 0;
    let resellerDue = 0;
    let totalBonusReceived = 0;
    let totalBonusGiven = 0;
    let pendingSupplierPayments = 0;
    let pendingResellerCollections = 0;

    transactions.forEach((tx: TopUpTransaction) => {
      const txDate = new Date(tx.transaction_date);
      
      // Purchase transactions
      if (tx.transaction_type === 'purchase') {
        totalPurchasedTopup += tx.total_amount || 0;
        totalPurchaseAmount += tx.base_amount || 0;
        totalBonusReceived += tx.bonus_amount || 0;
        
        const dueForThisTx = (tx.base_amount || 0) - (tx.paid_amount || 0);
        if (dueForThisTx > 0) {
          supplierDue += dueForThisTx;
          pendingSupplierPayments++;
        }
        
        if (txDate >= today && txDate < tomorrow) {
          todayPurchaseAmount += tx.base_amount || 0;
        }
        if (txDate >= weekStart) {
          weeklyPurchaseAmount += tx.base_amount || 0;
        }
        if (txDate >= monthStart && txDate <= monthEnd) {
          monthlyPurchaseAmount += tx.base_amount || 0;
        }
      }
      
      // Sale transactions
      if (tx.transaction_type === 'sale') {
        totalSoldTopup += tx.total_amount || 0;
        totalSaleAmount += tx.base_amount || 0;
        totalBonusGiven += tx.bonus_amount || 0;
        
        const dueForThisTx = (tx.base_amount || 0) - (tx.paid_amount || 0);
        if (dueForThisTx > 0) {
          resellerDue += dueForThisTx;
          pendingResellerCollections++;
        }
        
        if (txDate >= today && txDate < tomorrow) {
          todaySaleAmount += tx.base_amount || 0;
        }
        if (txDate >= weekStart) {
          weeklySaleAmount += tx.base_amount || 0;
        }
        if (txDate >= monthStart && txDate <= monthEnd) {
          monthlySaleAmount += tx.base_amount || 0;
        }
      }
      
      // Supplier payments (reduce due)
      if (tx.transaction_type === 'supplier_payment') {
        supplierDue -= tx.paid_amount || 0;
        if (supplierDue < 0) supplierDue = 0;
      }
      
      // Reseller payments (reduce due)
      if (tx.transaction_type === 'reseller_payment') {
        resellerDue -= tx.paid_amount || 0;
        if (resellerDue < 0) resellerDue = 0;
      }
    });

    const avgPurchasePrice = totalPurchasedTopup > 0 
      ? totalPurchaseAmount / totalPurchasedTopup 
      : 0;
    
    const totalStock = Math.max(0, totalPurchasedTopup - totalSoldTopup);
    const totalStockValue = totalStock * avgPurchasePrice;

    const selectedPeriodAmount = selectedPeriod === 'today' ? todaySaleAmount :
                                 selectedPeriod === 'week' ? weeklySaleAmount :
                                 monthlySaleAmount;
    
    const selectedPeriodProfit = selectedPeriod === 'today' ? (todaySaleAmount - todayPurchaseAmount) :
                                 selectedPeriod === 'week' ? (weeklySaleAmount - weeklyPurchaseAmount) :
                                 (monthlySaleAmount - monthlyPurchaseAmount);

    const averageProfitMargin = totalSaleAmount > 0 
      ? ((totalSaleAmount - totalPurchaseAmount) / totalSaleAmount) * 100 
      : 0;

    setStats({
      totalStock,
      totalStockValue,
      supplierDue: Math.max(0, supplierDue),
      resellerDue: Math.max(0, resellerDue),
      todayProfit: todaySaleAmount - todayPurchaseAmount,
      monthlyProfit: monthlySaleAmount - monthlyPurchaseAmount,
      totalPurchaseAmount,
      totalSaleAmount,
      todayPurchaseAmount,
      todaySaleAmount,
      monthlyPurchaseAmount,
      monthlySaleAmount,
      pendingSupplierPayments,
      pendingResellerCollections,
      averageProfitMargin,
      totalBonusReceived,
      totalBonusGiven,
      netBonusImpact: totalBonusReceived - totalBonusGiven,
      totalPurchasedTopup,
      totalSoldTopup
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', 'AFG');
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProfitColor = (profit: number): string => {
    return profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  };

  const getProfitBg = (profit: number): string => {
    return profit >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10';
  };

  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 1).length;
  const activeResellers = resellers.filter((r: Reseller) => r.status === 1).length;

  // Enhanced Summary Cards - Smaller size
  const summaryCards = [
    { 
      label: t('totalStock'),
      value: formatCompactNumber(stats.totalStock),
      unit: '',
      subValue: formatCurrency(stats.totalStockValue),
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
      textLight: 'text-blue-600 dark:text-blue-400',
      trend: stats.totalStock > 0 ? ((stats.totalStock / (stats.totalPurchasedTopup || 1)) * 100).toFixed(1) + '%' : '0%',
      trendLabel: t('of total'),
      chart: true
    },
    { 
      label: t('supplierDue'),
      value: formatCurrency(stats.supplierDue),
      subValue: `${stats.pendingSupplierPayments} ${t('pending')}`,
      icon: TrendingDown,
      gradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50 dark:bg-orange-500/10',
      textLight: 'text-orange-600 dark:text-orange-400',
      alert: stats.supplierDue > 100000,
      alertMessage: t('highDue')
    },
    { 
      label: t('resellerDue'),
      value: formatCurrency(stats.resellerDue),
      subValue: `${stats.pendingResellerCollections} ${t('pending')}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50 dark:bg-green-500/10',
      textLight: 'text-green-600 dark:text-green-400',
      alert: stats.resellerDue > 100000,
      alertMessage: t('highDue')
    },
    { 
      label: t('todayProfit'),
      value: formatCurrency(Math.abs(stats.todayProfit)),
      subValue: stats.todayProfit >= 0 ? t('profit') : t('loss'),
      icon: stats.todayProfit >= 0 ? TrendingUp : TrendingDown,
      gradient: stats.todayProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600',
      bgLight: stats.todayProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10',
      textLight: stats.todayProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      prefix: stats.todayProfit >= 0 ? '+' : '-',
      sparkline: true
    },
  ];

  // Enhanced Quick Actions with more visual appeal
  const quickActions: QuickAction[] = [
    { 
      label: t('buyTopup'), 
      icon: ShoppingCart, 
      path: '/buy-topup', 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
      textLight: 'text-blue-600 dark:text-blue-400',
      description: t('purchaseFromSupplier')
    },
    { 
      label: t('sellTopup'), 
      icon: CreditCard, 
      path: '/sell-topup', 
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50 dark:bg-green-500/10',
      textLight: 'text-green-600 dark:text-green-400',
      description: t('sellToReseller')
    },
    { 
      label: t('supplierPayment'), 
      icon: Truck, 
      path: '/supplier-payment', 
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50 dark:bg-orange-500/10',
      textLight: 'text-orange-600 dark:text-orange-400',
      description: t('payToSupplier')
    },
    { 
      label: t('resellerPayment'), 
      icon: Users, 
      path: '/reseller-payment', 
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50 dark:bg-purple-500/10',
      textLight: 'text-purple-600 dark:text-purple-400',
      description: t('collectFromReseller')
    },
    { 
      label: t('addSupplier'), 
      icon: Plus, 
      path: '/suppliers/add', 
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
      textLight: 'text-emerald-600 dark:text-emerald-400',
      description: t('registerNewSupplier')
    },
    { 
      label: t('addReseller'), 
      icon: Plus, 
      path: '/resellers/add', 
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-500/10',
      textLight: 'text-amber-600 dark:text-amber-400',
      description: t('registerNewReseller')
    },
    { 
      label: t('reports'), 
      icon: BarChart3, 
      path: '/reports', 
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-500/10',
      textLight: 'text-indigo-600 dark:text-indigo-400',
      description: t('viewDetailedReports')
    },
    { 
      label: t('analytics'), 
      icon: TrendingIcon, 
      path: '/analytics', 
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-50 dark:bg-pink-500/10',
      textLight: 'text-pink-600 dark:text-pink-400',
      description: t('businessAnalytics')
    },
  ];

  const visibleActions = showAllActions ? quickActions : quickActions.slice(0, 6);

  const typeLabels: Record<string, string> = {
    purchase: t('purchase'),
    sale: t('sale'),
    supplier_payment: t('supplierPayment'),
    reseller_payment: t('resellerPayment'),
  };

  const getPartyName = (transaction: TopUpTransaction): string => {
    if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'supplier_payment') {
      return transaction.supplier?.name || '—';
    }
    if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'reseller_payment') {
      return transaction.reseller?.name || '—';
    }
    return '—';
  };

  const getTransactionAmount = (transaction: TopUpTransaction): { amount: number; type: 'in' | 'out' } => {
    switch (transaction.transaction_type) {
      case 'purchase':
        return { amount: transaction.base_amount || 0, type: 'out' };
      case 'sale':
        return { amount: transaction.base_amount || 0, type: 'in' };
      case 'supplier_payment':
        return { amount: transaction.paid_amount || 0, type: 'out' };
      case 'reseller_payment':
        return { amount: transaction.paid_amount || 0, type: 'in' };
      default:
        return { amount: 0, type: 'in' };
    }
  };

  const formatDate = (dateString: string): string => {
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

  const getTransactionStyle = (type: string) => {
    const styles: Record<string, { bg: string; text: string; icon: LucideIcon; gradient: string }> = {
      purchase: { 
        bg: 'bg-blue-50 dark:bg-blue-500/10', 
        text: 'text-blue-600 dark:text-blue-400', 
        icon: ArrowDownLeft,
        gradient: 'from-blue-500 to-blue-600'
      },
      sale: { 
        bg: 'bg-green-50 dark:bg-green-500/10', 
        text: 'text-green-600 dark:text-green-400', 
        icon: ArrowUpRight,
        gradient: 'from-green-500 to-green-600'
      },
      supplier_payment: { 
        bg: 'bg-orange-50 dark:bg-orange-500/10', 
        text: 'text-orange-600 dark:text-orange-400', 
        icon: ArrowUpRight,
        gradient: 'from-orange-500 to-orange-600'
      },
      reseller_payment: { 
        bg: 'bg-purple-50 dark:bg-purple-500/10', 
        text: 'text-purple-600 dark:text-purple-400', 
        icon: ArrowDownLeft,
        gradient: 'from-purple-500 to-purple-600'
      },
    };
    return styles[type] || styles.purchase;
  };

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading && recentTransactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
            {t('loadingDashboard')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('pleaseWait')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedPeriod === period
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(period)}
                </button>
              ))}
            </div> */}

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Summary Cards - Mobile: 2 columns, Desktop: 4 columns - Smaller size */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${card.textLight}`} />
                    </div>
                    {card.alert && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full"
                      >
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">{card.alertMessage}</span>
                      </motion.span>
                    )}
                  </div>

                  {/* Value */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {card.prefix}{card.value}
                      </p>
                      {card.unit && (
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{card.unit}</span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {card.subValue}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {card.label}
                    </span>
                    {card.trend && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {card.trend}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Stats & Charts */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t('performanceOverview')}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {selectedPeriod === 'today' ? t('today') : selectedPeriod === 'week' ? t('thisWeek') : t('thisMonth')}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('revenue'), value: formatCurrency(profitStats?.profit_analysis?.total?.revenue || stats.totalSaleAmount), trend: '+12.5%', color: 'emerald' },
                  { label: t('cost'), value: formatCurrency(profitStats?.profit_analysis?.total?.cost || stats.totalPurchaseAmount), trend: '-8.2%', color: 'rose' },
                  { label: t('profitMargin'), value: `${stats.averageProfitMargin.toFixed(1)}%`, subValue: t('overall'), color: stats.averageProfitMargin >= 0 ? 'emerald' : 'rose' },
                  { label: t('netBonus'), value: `${stats.netBonusImpact >= 0 ? '+' : ''}${formatCompactNumber(Math.abs(stats.netBonusImpact))}`, subValue: t('units'), color: stats.netBonusImpact >= 0 ? 'emerald' : 'rose' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{item.value}</p>
                    {/* {item.trend && (
                      <p className={`text-xs mt-1 ${
                        item.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.trend}
                      </p>
                    )} */}
                    {item.subValue && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.subValue}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bars */}
              <div className="mt-4 space-y-3">
                {[
                  { label: t('stockUtilization'), value: stats.totalPurchasedTopup > 0 ? (stats.totalSoldTopup / stats.totalPurchasedTopup) * 100 : 0, color: 'blue' },
                  { label: t('collectionRate'), value: stats.totalSaleAmount > 0 ? ((stats.totalSaleAmount - stats.resellerDue) / stats.totalSaleAmount) * 100 : 0, color: 'emerald' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Today's Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                {t('todayActivity')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('purchases')}</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.todayPurchaseAmount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {transactions.filter((t: TopUpTransaction) => 
                      t.transaction_type === 'purchase' && 
                      new Date(t.transaction_date) >= today && 
                      new Date(t.transaction_date) < tomorrow
                    ).length} {t('transactions')}
                  </p>
                </div>
                
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-600/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('sales')}</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.todaySaleAmount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {transactions.filter((t: TopUpTransaction) => 
                      t.transaction_type === 'sale' && 
                      new Date(t.transaction_date) >= today && 
                      new Date(t.transaction_date) < tomorrow
                    ).length} {t('transactions')}
                  </p>
                </div>
              </div>

              <div className={`mt-3 p-3 ${getProfitBg(stats.todayProfit)} rounded-lg`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('todayProfit')}</p>
                    <p className={`text-base sm:text-lg font-bold ${getProfitColor(stats.todayProfit)}`}>
                      {stats.todayProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(stats.todayProfit))}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('profitMargin')}</p>
                    <p className={`text-sm sm:text-base font-bold ${getProfitColor(stats.todayProfit)}`}>
                      {stats.todaySaleAmount > 0 
                        ? ((stats.todayProfit / stats.todaySaleAmount) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('dailyTarget')}: {formatCurrency(stats.todaySaleAmount * 1.2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Alerts */}
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    {t('quickActions')}
                  </h2>
                  <button
                    onClick={() => setShowAllActions(!showAllActions)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {showAllActions ? t('showLess') : t('showAll')}
                    <ChevronRight className={`w-3 h-3 transition-transform ${showAllActions ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={showAllActions ? 'all' : 'limited'}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`grid ${showAllActions ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2`}
                  >
                    {visibleActions.map((action, i) => {
                      const Icon = action.icon;
                      
                      return (
                        <motion.div
                          key={action.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={action.path}
                            className="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800 hover:shadow-md transition-all duration-300 overflow-hidden"
                          >
                            {/* Animated Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            {/* Icon Container */}
                            <div className={`relative p-2 rounded-lg ${action.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className={`w-3.5 h-3.5 ${action.textLight}`} />
                            </div>
                            
                            {/* Label */}
                            <span className="text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 line-clamp-2">
                              {action.label}
                            </span>
                            
                            {/* Description - Show on hover */}
                            {action.description && (
                              <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-gray-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-[8px] text-white text-center">
                                  {action.description}
                                </p>
                              </div>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Alerts & Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {t('alerts')}
                </h2>
              </div>

              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {stats.supplierDue > 50000 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-2 p-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-600/10 rounded-lg"
                    >
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-lg shrink-0">
                        <Truck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {t('highSupplierDue')}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {formatCurrency(stats.supplierDue)} {t('due')} · {stats.pendingSupplierPayments} {t('payments')}
                        </p>
                        <Link 
                          to="/supplier-payment" 
                          className="inline-flex items-center gap-0.5 text-[10px] text-orange-600 dark:text-orange-400 mt-1 hover:underline"
                        >
                          {t('payNow')}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {stats.resellerDue > 50000 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-2 p-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-600/10 rounded-lg"
                    >
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg shrink-0">
                        <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {t('highResellerDue')}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {formatCurrency(stats.resellerDue)} {t('due')} · {stats.pendingResellerCollections} {t('collections')}
                        </p>
                        <Link 
                          to="/reseller-payment" 
                          className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 mt-1 hover:underline"
                        >
                          {t('collectNow')}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {stats.totalStock < 1000 && stats.totalPurchasedTopup > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-2 p-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 rounded-lg"
                    >
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
                        <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {t('lowStock')}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {stats.totalStock} {t('unitsRemaining')}
                        </p>
                        <Link 
                          to="/buy-topup" 
                          className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                        >
                          {t('restockNow')}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {stats.pendingSupplierPayments === 0 && stats.pendingResellerCollections === 0 && stats.totalStock >= 1000 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-2 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-600/10 rounded-lg"
                    >
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {t('allGood')}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {t('noAlerts')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {t('quickStats')}
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {[
                  { label: t('activeSuppliers'), value: `${activeSuppliers}/${suppliers.length}`, icon: Truck, color: 'blue' },
                  { label: t('activeResellers'), value: `${activeResellers}/${resellers.length}`, icon: Users, color: 'green' },
                  { label: t('totalTransactions'), value: transactions.length, icon: Layers, color: 'purple' },
                  { label: t('avgTransaction'), value: formatCurrency(stats.totalSaleAmount / (transactions.length || 1)), icon: DollarSign, color: 'amber' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  const colors = {
                    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
                    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
                    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  };
                  
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${colors[item.color as keyof typeof colors]}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  to="/reports" 
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    {t('viewFullReport')}
                  </span>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className="p-1 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              {t('recentTransactions')}
            </h2>
            <Link 
              to="/transactions" 
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium group"
            >
              {t('viewAll')}
              <motion.div whileHover={{ x: 2 }}>
                <ArrowRight className="w-3 h-3" />
              </motion.div>
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentTransactions.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm">{t('noTransactions')}</p>
              </div>
            ) : (
              recentTransactions.map((tx, i) => {
                const style = getTransactionStyle(tx.transaction_type);
                const Icon = style.icon;
                const amount = getTransactionAmount(tx);
                const partyName = getPartyName(tx);
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${style.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {partyName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} text-[10px]`}>
                            {typeLabels[tx.transaction_type]}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${amount.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {amount.type === 'in' ? '+' : '-'}{formatCurrency(amount.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(tx.transaction_date)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;