// pages/ReportsPage.tsx

import { useLanguage } from '@/contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchResellers } from '@/redux/slices/resellerSlice';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import {
  fetchDashboardSummary,
  fetchProfitReport,
  fetchTransactions
} from '@/redux/slices/transactionSlice';
import { RootState } from '@/redux/store';
import { TopUpTransaction } from '@/type/topUpTransaction';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  FileBarChart,
  Filter,
  Layers,
  LineChart as LineChartIcon,
  Loader2,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Types
interface ChartDataPoint {
  month: string;
  monthFull: string;
  purchase: number;
  sales: number;
  profit: number;
}

interface SupplierPerformance {
  id: number;
  name: string;
  totalPurchases: number;
  totalBonus: number;
  transactionCount: number;
  avgPurchase: number;
}

interface ResellerPerformance {
  id: number;
  name: string;
  totalSales: number;
  totalBonus: number;
  transactionCount: number;
  avgSale: number;
}

type ChartType = 'bar' | 'line' | 'area' | 'composed';
type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'custom';

const ReportsPage = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  // Redux selectors
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions);
  const suppliers = useAppSelector((state: RootState) => state.suppliers.suppliers);
  const resellers = useAppSelector((state: RootState) => state.resellers.resellers);
  const dashboardSummary = useAppSelector((state: RootState) => state.transactions.dashboardSummary);
  const profitReport = useAppSelector((state: RootState) => state.transactions.profitReport);
  const authState = useAppSelector((state: RootState) => state.businessOwner);
  const isLoading = useAppSelector((state: RootState) => state.transactions.loading);

  // State
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [resellerPerformance, setResellerPerformance] = useState<ResellerPerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['purchase', 'sales', 'profit']);

  // Get currency code from auth state
  const currencyCode = authState?.businessOwner?.currency?.code || 'AFG';

  // Helper function to parse string values to numbers
  const parseValue = (value: string | number | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  };

  // Format currency with currency code at the end
  const formatCurrency = (amount: number): string => {
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${formattedAmount} ${currencyCode}`;
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Year options
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 2020; i <= 2030; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Get data from dashboard summary
  const summary = dashboardSummary?.summary;
  const profitAnalysis = summary?.topup_summary?.profit_analysis;

  // Get profit report data
  const profitReportData = profitReport?.data;

  // Extract values from API response
  const totalRevenue = parseValue(profitAnalysis?.total_revenue);
  const totalCost = parseValue(profitAnalysis?.total_cost_of_goods_sold);
  const totalProfit = parseValue(profitAnalysis?.total_profit);
  const profitMargin = profitAnalysis?.profit_margin_percentage || '0';
  const totalTransactionsCount = transactions.length;
  const totalBonusGiven = parseValue(summary?.topup_summary?.total_bonus_given_to_resellers);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchTransactions({ page: 1, limit: 1000 })),
      dispatch(fetchSuppliers({ page: 1, item_per_page: 100 })),
      dispatch(fetchResellers({ page: 1, item_per_page: 100 })),
      dispatch(fetchDashboardSummary()),
      dispatch(fetchProfitReport())
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculate chart data and performance from transactions
  useEffect(() => {
    if (transactions.length > 0) {
      calculateChartData();
      calculateSupplierPerformance();
      calculateResellerPerformance();
    }
  }, [transactions, selectedYear]);

  const calculateChartData = () => {
    const months: { [key: string]: ChartDataPoint } = {};

    // Initialize all months for selected year
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        monthFull: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        purchase: 0,
        sales: 0,
        profit: 0
      };
    }

    transactions.forEach(tx => {
      const date = new Date(tx.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (months[monthKey]) {
        const baseAmount = parseValue(tx.base_amount);

        if (tx.transaction_type === 'purchase') {
          months[monthKey].purchase += baseAmount;
        } else if (tx.transaction_type === 'sale') {
          months[monthKey].sales += baseAmount;
        }
        months[monthKey].profit = months[monthKey].sales - months[monthKey].purchase;
      }
    });

    setChartData(Object.values(months).sort((a, b) => {
      const dateA = new Date(a.monthFull);
      const dateB = new Date(b.monthFull);
      return dateA.getTime() - dateB.getTime();
    }));
  };

  const calculateSupplierPerformance = () => {
    const supplierMap: { [key: number]: SupplierPerformance } = {};

    transactions.forEach(tx => {
      if (tx.transaction_type === 'purchase' && tx.supplier_id) {
        const baseAmount = parseValue(tx.base_amount);
        const bonusAmount = parseValue(tx.bonus_amount);

        if (!supplierMap[tx.supplier_id]) {
          const supplier = suppliers.find(s => s.id === tx.supplier_id);
          supplierMap[tx.supplier_id] = {
            id: tx.supplier_id,
            name: supplier?.name || 'Unknown',
            totalPurchases: 0,
            totalBonus: 0,
            transactionCount: 0,
            avgPurchase: 0
          };
        }
        supplierMap[tx.supplier_id].totalPurchases += baseAmount;
        supplierMap[tx.supplier_id].totalBonus += bonusAmount;
        supplierMap[tx.supplier_id].transactionCount++;
      }
    });

    const result = Object.values(supplierMap)
      .map(s => ({
        ...s,
        avgPurchase: s.transactionCount > 0 ? s.totalPurchases / s.transactionCount : 0
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);

    setSupplierPerformance(result);
  };

  const calculateResellerPerformance = () => {
    const resellerMap: { [key: number]: ResellerPerformance } = {};

    transactions.forEach(tx => {
      if (tx.transaction_type === 'sale' && tx.reseller_id) {
        const baseAmount = parseValue(tx.base_amount);
        const bonusAmount = parseValue(tx.bonus_amount);

        if (!resellerMap[tx.reseller_id]) {
          const reseller = resellers.find(r => r.id === tx.reseller_id);
          resellerMap[tx.reseller_id] = {
            id: tx.reseller_id,
            name: reseller?.name || 'Unknown',
            totalSales: 0,
            totalBonus: 0,
            transactionCount: 0,
            avgSale: 0
          };
        }
        resellerMap[tx.reseller_id].totalSales += baseAmount;
        resellerMap[tx.reseller_id].totalBonus += bonusAmount;
        resellerMap[tx.reseller_id].transactionCount++;
      }
    });

    const result = Object.values(resellerMap)
      .map(r => ({
        ...r,
        avgSale: r.transactionCount > 0 ? r.totalSales / r.transactionCount : 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    setResellerPerformance(result);
  };

  const getChartComponent = () => {
    switch (selectedChartType) {
      case 'line':
        return LineChart;
      case 'area':
        return AreaChart;
      case 'composed':
        return ComposedChart;
      default:
        return BarChart;
    }
  };

  const renderChart = () => {
    const ChartComponent = getChartComponent();
    const data = chartData;

    return (
      <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'hsl(220 10% 50%)' }}
            axisLine={{ stroke: 'hsl(220 10% 50%)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(220 10% 50%)' }}
            axisLine={{ stroke: 'hsl(220 10% 50%)' }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid hsl(210 15% 90%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend />

          {selectedChartType === 'bar' && (
            <>
              {selectedMetrics.includes('purchase') && (
                <Bar
                  dataKey="purchase"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name={t('purchases')}
                />
              )}
              {selectedMetrics.includes('sales') && (
                <Bar
                  dataKey="sales"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name={t('sales')}
                />
              )}
              {selectedMetrics.includes('profit') && (
                <Bar
                  dataKey="profit"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  name={t('profit')}
                />
              )}
            </>
          )}

          {selectedChartType === 'line' && (
            <>
              {selectedMetrics.includes('purchase') && (
                <Line
                  type="monotone"
                  dataKey="purchase"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  name={t('purchases')}
                />
              )}
              {selectedMetrics.includes('sales') && (
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  name={t('sales')}
                />
              )}
              {selectedMetrics.includes('profit') && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  name={t('profit')}
                />
              )}
            </>
          )}

          {selectedChartType === 'area' && (
            <>
              {selectedMetrics.includes('purchase') && (
                <Area
                  type="monotone"
                  dataKey="purchase"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name={t('purchases')}
                />
              )}
              {selectedMetrics.includes('sales') && (
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name={t('sales')}
                />
              )}
              {selectedMetrics.includes('profit') && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name={t('profit')}
                />
              )}
            </>
          )}

          {selectedChartType === 'composed' && (
            <>
              <Bar
                dataKey="purchase"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                name={t('purchases')}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={3}
                name={t('sales')}
              />
              <Area
                type="monotone"
                dataKey="profit"
                fill="#f59e0b"
                stroke="#f59e0b"
                fillOpacity={0.2}
                name={t('profit')}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const exportToCSV = () => {
    setExportLoading(true);
    setTimeout(() => {
      const csvContent = [
        ['Month', 'Purchases', 'Sales', 'Profit'].join(','),
        ...chartData.map(d =>
          [d.monthFull, d.purchase, d.sales, d.profit].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      setExportLoading(false);
    }, 1000);
  };

  const printReport = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-indigo-500 absolute top-5 left-5 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
              <FileBarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('businessAnalytics')} · {chartData.length} {t('months')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              title={t('filters')}
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={loadDashboardData}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              title={t('refresh')}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportToCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors shadow-md"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{t('export')}</span>
            </button>
            <button
              onClick={printReport}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              title={t('print')}
            >
              <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              title={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Chart Type */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('chartType')}
                    </label>
                    <div className="flex gap-2">
                      {(['bar', 'line', 'area', 'composed'] as ChartType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedChartType(type)}
                          className={`p-2 rounded-lg transition-colors ${
                            selectedChartType === type
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                          title={t(type)}
                        >
                          {type === 'bar' && <BarChart3 className="w-4 h-4" />}
                          {type === 'line' && <LineChartIcon className="w-4 h-4" />}
                          {type === 'area' && <Activity className="w-4 h-4" />}
                          {type === 'composed' && <Layers className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Selection */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('metrics')}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['purchase', 'sales', 'profit'].map(metric => (
                        <button
                          key={metric}
                          onClick={() => toggleMetric(metric)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedMetrics.includes(metric)
                              ? metric === 'purchase'
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                : metric === 'sales'
                                ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {t(metric)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Selection */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('year')}
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Comparison Toggle */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Target className="w-4 h-4" />
                      {t('compareWithPreviousYear')}
                      {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: t('totalRevenue'),
              value: totalRevenue,
              icon: DollarSign,
              color: 'from-blue-500 to-blue-600',
              bgLight: 'bg-blue-50 dark:bg-blue-500/10',
              textLight: 'text-blue-600 dark:text-blue-400'
            },
            {
              label: t('totalCost'),
              value: totalCost,
              icon: TrendingDown,
              color: 'from-orange-500 to-orange-600',
              bgLight: 'bg-orange-50 dark:bg-orange-500/10',
              textLight: 'text-orange-600 dark:text-orange-400'
            },
            {
              label: t('totalProfit'),
              value: totalProfit,
              icon: TrendingUp,
              color: 'from-emerald-500 to-emerald-600',
              bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
              textLight: 'text-emerald-600 dark:text-emerald-400'
            },
            {
              label: t('totalTransactions'),
              value: totalTransactionsCount,
              icon: Activity,
              color: 'from-purple-500 to-purple-600',
              bgLight: 'bg-purple-50 dark:bg-purple-500/10',
              textLight: 'text-purple-600 dark:text-purple-400'
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.bgLight}`}>
                    <Icon className={`w-5 h-5 ${card.textLight}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCompactNumber(card.value)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Profit Margin Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('profitMargin')}</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {profitMargin}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalBonusGiven')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalBonusGiven)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              {t('monthlyPerformance')} - {selectedYear}
            </h2>
            <div className="flex items-center gap-2">
              {selectedMetrics.map(metric => (
                <span
                  key={metric}
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    metric === 'purchase'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      : metric === 'sales'
                      ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                >
                  {t(metric)}
                </span>
              ))}
            </div>
          </div>

          {renderChart()}
        </motion.div>

        {/* Supplier & Reseller Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                {t('topSuppliers')}
              </h3>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {supplierPerformance.slice(0, 5).map((supplier, i) => (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {supplier.transactionCount} {t('transactions')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(supplier.totalPurchases)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('bonus')}: {formatCurrency(supplier.totalBonus)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {supplierPerformance.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('noSupplierData')}
                </div>
              )}
            </div>
          </motion.div>

          {/* Reseller Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                {t('topResellers')}
              </h3>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {resellerPerformance.slice(0, 5).map((reseller, i) => (
                <motion.div
                  key={reseller.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{reseller.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {reseller.transactionCount} {t('transactions')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(reseller.totalSales)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('bonus')}: {formatCurrency(reseller.totalBonus)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {resellerPerformance.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('noResellerData')}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
