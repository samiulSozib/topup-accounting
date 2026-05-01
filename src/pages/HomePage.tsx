// pages/HomePage.tsx

import { useLanguage } from '@/contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchResellers } from '@/redux/slices/resellerSlice';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import {
  fetchDashboardSummary,
  fetchProfitReport,
  fetchTransactions,
} from '@/redux/slices/transactionSlice';
import { RootState } from '@/redux/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Home,
  Layers,
  LucideIcon,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp as TrendingIcon,
  TrendingUp,
  Truck,
  Users,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Types
import { Reseller } from '@/type/reseller';
import { Supplier } from '@/type/supplier';
import { TopUpTransaction } from '@/type/topUpTransaction';

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

  // Selectors
  const authState = useAppSelector((state: RootState) => state.businessOwner);
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions);
  const suppliers = useAppSelector((state: RootState) => state.suppliers.suppliers);
  const resellers = useAppSelector((state: RootState) => state.resellers.resellers);
  const dashboardSummary = useAppSelector((state: RootState) => state.transactions.dashboardSummary);
  const profitReport = useAppSelector((state: RootState) => state.transactions.profitReport);

  const transactionsLoading = useAppSelector((state: RootState) => state.transactions.loading);
  const suppliersLoading = useAppSelector((state: RootState) => state.suppliers.loading);
  const resellersLoading = useAppSelector((state: RootState) => state.resellers.loading);

  const isLoading = transactionsLoading || suppliersLoading || resellersLoading;

  const [showAllActions, setShowAllActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get currency code from auth state
  const currencyCode = authState?.businessOwner?.currency?.code || 'AFG';

  // Helper function to parse string values to numbers
  const parseValue = (value: string | number | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  };

  // Format currency with dynamic currency code
// Format currency with currency code at the end
const formatCurrency = (amount: number): string => {
  const currency = currencyCode || 'AFG';
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${formattedAmount} ${currency}`;
};

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchTransactions({ page: 1, limit: 100 })),
      dispatch(fetchSuppliers({ page: 1, item_per_page: 100 })),
      dispatch(fetchResellers({ page: 1, item_per_page: 100 })),
      dispatch(fetchDashboardSummary()),
      dispatch(fetchProfitReport())
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Get data directly from API response (no calculations)
  const summary = dashboardSummary?.summary;
  const profitAnalysis = summary?.topup_summary?.profit_analysis;
  const todaySummary = summary?.today;
  const suppliersData = summary?.suppliers;
  const resellersData = summary?.resellers;
  const profitReportData = profitReport?.data;

  // Direct values from API (no calculations)
  const totalStock = parseValue(summary?.topup_summary?.current_stock_quantity);
  const totalStockValue = parseValue(summary?.topup_summary?.current_stock_value);
  const supplierDue = parseValue(suppliersData?.total_supplier_due);
  const resellerDue = parseValue(resellersData?.total_reseller_due);
  const amountRemainingToCollect = parseValue(resellersData?.amount_remaining_to_collect);
  const todayProfit = parseValue(todaySummary?.profit?.total_profit);
  const todayProfitMargin = todaySummary?.profit?.profit_margin || '0';

  // From profit analysis
  const totalRevenue = parseValue(profitAnalysis?.total_revenue);
  const totalCostOfGoodsSold = parseValue(profitAnalysis?.total_cost_of_goods_sold);
  const totalProfit = parseValue(profitAnalysis?.total_profit);
  const profitMarginPercentage = profitAnalysis?.profit_margin_percentage || '0';
  const averageCostPerUnit = parseValue(profitAnalysis?.average_cost_per_unit);
  const averageSellingPricePerUnit = parseValue(profitAnalysis?.average_selling_price_per_unit);
  const profitPerUnit = parseValue(profitAnalysis?.profit_per_unit);
  const remainingStockUnits = parseValue(profitAnalysis?.remaining_stock_units);
  const remainingStockValue = parseValue(profitAnalysis?.remaining_stock_value);
  const potentialProfitFromRemaining = parseValue(profitAnalysis?.potential_profit_from_remaining);
  const totalPurchaseBatches = profitAnalysis?.total_purchase_batches || 0;
  const totalSalesTransactions = profitAnalysis?.total_sales_transactions || 0;

  // From topup summary
  const totalMoneySpentOnPurchases = parseValue(summary?.topup_summary?.total_money_spent_on_purchases);
  const totalQuantityPurchased = parseValue(summary?.topup_summary?.total_quantity_purchased);
  const totalMoneyReceivedFromSales = parseValue(summary?.topup_summary?.total_money_received_from_sales);
  const totalQuantitySold = parseValue(summary?.topup_summary?.total_quantity_sold);
  const totalBonusGiven = parseValue(summary?.topup_summary?.total_bonus_given_to_resellers);
  const currentStockQuantity = parseValue(summary?.topup_summary?.current_stock_quantity);
  const currentStockValue = parseValue(summary?.topup_summary?.current_stock_value);

  // From suppliers
  const totalSuppliers = suppliersData?.total_suppliers || 0;
  const totalPurchasesAmount = parseValue(suppliersData?.total_purchases_amount);
  const totalPaidToSuppliers = parseValue(suppliersData?.total_paid_to_suppliers);
  const totalSupplierDue = parseValue(suppliersData?.total_supplier_due);
  const totalStockValueFromSuppliers = parseValue(suppliersData?.total_stock_value);
  const activeSuppliersCount = suppliersData?.active_suppliers || 0;
  const inactiveSuppliersCount = suppliersData?.inactive_suppliers || 0;

  // From resellers
  const totalResellers = resellersData?.total_resellers || 0;
  const totalSalesAmount = parseValue(resellersData?.total_sales_amount);
  const totalReceivedFromResellers = parseValue(resellersData?.total_received_from_resellers);
  const totalResellerDue = parseValue(resellersData?.total_reseller_due);
  const activeResellersCount = resellersData?.active_resellers || 0;
  const inactiveResellersCount = resellersData?.inactive_resellers || 0;

  // From today summary
  const todayDate = todaySummary?.date || '';
  const todayMoneySpent = parseValue(todaySummary?.purchases?.money_spent);
  const todayQuantityPurchased = parseValue(todaySummary?.purchases?.quantity_purchased);
  const todayMoneyReceived = parseValue(todaySummary?.sales?.money_received);
  const todayQuantitySold = parseValue(todaySummary?.sales?.quantity_sold);
  const todayBonusGiven = parseValue(todaySummary?.sales?.bonus_given);

  // From profit report
  const profitReportTotalRevenue = parseValue(profitReportData?.total_revenue);
  const profitReportTotalCost = parseValue(profitReportData?.total_cost);
  const profitReportTotalProfit = parseValue(profitReportData?.total_profit);
  const profitReportProfitMargin = profitReportData?.profit_margin || '0%';
  const profitReportRemainingStockUnits = parseValue(profitReportData?.remaining_stock_units);
  const profitReportRemainingStockValue = parseValue(profitReportData?.remaining_stock_value);
  const profitReportTotalSales = profitReportData?.total_sales || 0;
  const profitReportTotalPurchases = profitReportData?.total_purchases || 0;

  // Count pending payments from transactions (still needed as not in API)
  const pendingSupplierPayments = transactions.filter((tx: TopUpTransaction) =>
    tx.transaction_type === 'purchase' && parseValue(tx.due_amount) > 0
  ).length;

  const pendingResellerCollections = transactions.filter((tx: TopUpTransaction) =>
    tx.transaction_type === 'sale' && parseValue(tx.due_amount) > 0
  ).length;

  // Stock utilization (using direct API values)
  const stockUtilization = totalQuantityPurchased > 0
    ? (totalQuantitySold / totalQuantityPurchased) * 100
    : 0;

  // Collection rate (using direct API values)
  const collectionRate = totalSalesAmount > 0
    ? ((totalSalesAmount - resellerDue) / totalSalesAmount) * 100
    : 0;

  // Net bonus impact (bonus given is cost)
  const netBonusImpact = -totalBonusGiven;

  const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 1).length;
  const activeResellers = resellers.filter((r: Reseller) => r.status === 1).length;

  // Summary Cards
  const summaryCards = [
    {
      label: t('totalStock'),
      value: totalStock.toLocaleString(),
      unit: t('units'),
      subValue: formatCurrency(totalStockValue),
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
      textLight: 'text-blue-600 dark:text-blue-400',
      trend: totalQuantityPurchased > 0 ? ((totalStock / totalQuantityPurchased) * 100).toFixed(1) + '%' : '0%',
      trendLabel: t('ofTotal'),
    },
    {
      label: t('supplierDue'),
      value: formatCurrency(supplierDue),
      subValue: `${pendingSupplierPayments} ${t('pending')}`,
      icon: TrendingDown,
      gradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50 dark:bg-orange-500/10',
      textLight: 'text-orange-600 dark:text-orange-400',
      alert: supplierDue > 50000,
      alertMessage: t('highDue')
    },
    {
      label: t('resellerDue'),
      value: formatCurrency(resellerDue),
      subValue: `${pendingResellerCollections} ${t('pending')}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50 dark:bg-green-500/10',
      textLight: 'text-green-600 dark:text-green-400',
      alert: resellerDue > 50000,
      alertMessage: t('highDue')
    },
  ];

  // Quick Actions
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
    const baseAmount = parseValue(transaction.base_amount);
    const paidAmount = parseValue(transaction.paid_amount);

    switch (transaction.transaction_type) {
      case 'purchase':
        return { amount: baseAmount, type: 'out' };
      case 'sale':
        return { amount: baseAmount, type: 'in' };
      case 'supplier_payment':
        return { amount: paidAmount, type: 'out' };
      case 'reseller_payment':
        return { amount: paidAmount, type: 'in' };
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative p-3 sm:p-4">
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

                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                      {card.unit && (
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{card.unit}</span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {card.subValue}
                    </p>
                  </div>

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
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('revenue')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('total')}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cost')}</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalCostOfGoodsSold)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('total')}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('profitMargin')}</p>
                  <p className={`text-sm sm:text-base font-bold ${parseFloat(profitMarginPercentage) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {profitMarginPercentage}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('overall')}</p>
                </div>
                {/* <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('netBonus')}</p>
                  <p className={`text-sm sm:text-base font-bold ${netBonusImpact >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {netBonusImpact >= 0 ? '+' : ''}{netBonusImpact.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('units')}</p>
                </div> */}
              </div>

              {/* Additional Stats from API */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('avgCostPerUnit')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(averageCostPerUnit)}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('avgSellingPrice')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(averageSellingPricePerUnit)}
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{t('stockUtilization')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stockUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stockUtilization}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{t('collectionRate')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {collectionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${collectionRate}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
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
                {t('todayActivity')} - {todayDate}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('purchases')}</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(todayMoneySpent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {todayQuantityPurchased.toLocaleString()} {t('units')} · {todayBonusGiven > 0 ? `+${todayBonusGiven.toLocaleString()} ${t('bonus')}` : ''}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-600/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('sales')}</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(todayMoneyReceived)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {todayQuantitySold.toLocaleString()} {t('units')} · {todayBonusGiven > 0 ? `${todayBonusGiven.toLocaleString()} ${t('bonusGiven')}` : ''}
                  </p>
                </div>
              </div>

              <div className={`mt-3 p-3 ${parseFloat(todayProfit.toString()) >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'} rounded-lg`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('todayProfit')}</p>
                    <p className={`text-base sm:text-lg font-bold ${parseFloat(todayProfit.toString()) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(Math.abs(todayProfit))}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('profitMargin')}</p>
                    <p className={`text-sm sm:text-base font-bold ${parseFloat(todayProfit.toString()) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {todayProfitMargin}%
                    </p>
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
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className={`relative p-2 rounded-lg ${action.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className={`w-3.5 h-3.5 ${action.textLight}`} />
                            </div>

                            <span className="text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 line-clamp-2">
                              {action.label}
                            </span>

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
                  {supplierDue > 50000 && (
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
                          {formatCurrency(supplierDue)} {t('due')} · {pendingSupplierPayments} {t('payments')}
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

                  {resellerDue > 50000 && (
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
                          {formatCurrency(resellerDue)} {t('due')} · {pendingResellerCollections} {t('collections')}
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

                  {totalStock < 1000 && totalQuantityPurchased > 0 && (
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
                          {totalStock.toLocaleString()} {t('unitsRemaining')}
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

                  {pendingSupplierPayments === 0 && pendingResellerCollections === 0 && totalStock >= 1000 && (
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Truck className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('activeSuppliers')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activeSuppliersCount}/{totalSuppliers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                      <Users className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('activeResellers')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activeResellersCount}/{totalResellers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Layers className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('totalTransactions')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {transactions.length}
                  </span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Package className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('purchaseBatches')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {totalPurchaseBatches}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CreditCard className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('salesTransactions')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {totalSalesTransactions}
                  </span>
                </div> */}
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
