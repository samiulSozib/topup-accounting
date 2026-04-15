// pages/ReportsPage.tsx

import { useLanguage } from '@/contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchResellers } from '@/redux/slices/resellerSlice';
import { fetchSuppliers } from '@/redux/slices/supplierSlice';
import {
  fetchProfitStatistics,
  fetchTransactions
} from '@/redux/slices/transactionSlice';
import { RootState } from '@/redux/store';
import { TopUpTransaction } from '@/type/topUpTransaction';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  ChevronDown, ChevronUp,
  DollarSign,
  Download,
  FileBarChart,
  Filter,
  Layers,
  LineChart as LineChartIcon,
  Loader2,
  Maximize2, Minimize2,
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
  XAxis, YAxis
} from 'recharts';

// Types
interface MonthlyData {
  month: string;
  monthFull: string;
  purchase: number;
  sales: number;
  profit: number;
  purchaseCount: number;
  salesCount: number;
  avgPurchase: number;
  avgSale: number;
  bonusReceived: number;
  bonusGiven: number;
}

interface SupplierPerformance {
  id: number;
  name: string;
  totalPurchases: number;
  totalBonus: number;
  transactionCount: number;
  avgPurchase: number;
  lastPurchase: string;
}

interface ResellerPerformance {
  id: number;
  name: string;
  totalSales: number;
  totalBonus: number;
  transactionCount: number;
  avgSale: number;
  lastSale: string;
}

interface DailyData {
  date: string;
  day: number;
  month: number;
  year: number;
  purchase: number;
  sales: number;
  profit: number;
  displayDate: string;
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
  const profitStats = useAppSelector((state: RootState) => state.transactions.profitStatistics);
  const isLoading = useAppSelector((state: RootState) => state.transactions.loading);

  // State
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [filteredDailyData, setFilteredDailyData] = useState<DailyData[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [resellerPerformance, setResellerPerformance] = useState<ResellerPerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonYear, setComparisonYear] = useState<number>(new Date().getFullYear() - 1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['purchase', 'sales', 'profit']);

  // Helper function to parse string values to numbers
  const parseValue = (value): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  };

  // Generate year options (2020 to 2030)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 2020; i <= 2030; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Month options
  const monthOptions = useMemo(() => {
    return [
      { value: 1, label: t('january') },
      { value: 2, label: t('february') },
      { value: 3, label: t('march') },
      { value: 4, label: t('april') },
      { value: 5, label: t('may') },
      { value: 6, label: t('june') },
      { value: 7, label: t('july') },
      { value: 8, label: t('august') },
      { value: 9, label: t('september') },
      { value: 10, label: t('october') },
      { value: 11, label: t('november') },
      { value: 12, label: t('december') },
    ];
  }, [t]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateReports();
    }
  }, [transactions, selectedPeriod, selectedYear, selectedMonth, dateRange]);

  useEffect(() => {
    // Filter daily data for selected month and year
    const filtered = dailyData.filter(day =>
      day.year === selectedYear && day.month === selectedMonth
    );
    setFilteredDailyData(filtered);
  }, [dailyData, selectedYear, selectedMonth]);

  const loadData = useCallback(() => {
    dispatch(fetchTransactions({ page: 1, limit: 1000 }));
    dispatch(fetchSuppliers({ page: 1, item_per_page: 100 }));
    dispatch(fetchResellers({ page: 1, item_per_page: 100 }));
    dispatch(fetchProfitStatistics());
  }, [dispatch]);

  const filterTransactionsByPeriod = (txs: TopUpTransaction[]): TopUpTransaction[] => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        break;
      case 'custom':
        startDate = dateRange.start;
        endDate = dateRange.end;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return txs.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate >= startDate && txDate <= endDate;
    });
  };

  const calculateReports = () => {
    // Filter transactions based on selected period
    const filteredTransactions = filterTransactionsByPeriod(transactions);

    // Calculate monthly data
    const monthly = calculateMonthlyData(filteredTransactions);
    setMonthlyData(monthly);

    // Calculate daily data (all time for filtering)
    const daily = calculateDailyData(transactions); // Use all transactions for daily data
    setDailyData(daily);

    // Calculate supplier performance
    const supplierPerf = calculateSupplierPerformance(filteredTransactions);
    setSupplierPerformance(supplierPerf);

    // Calculate reseller performance
    const resellerPerf = calculateResellerPerformance(filteredTransactions);
    setResellerPerformance(resellerPerf);
  };

  const calculateMonthlyData = (txs: TopUpTransaction[]): MonthlyData[] => {
    const months: { [key: string]: MonthlyData } = {};

    // Initialize all months for selected year
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        monthFull: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        purchase: 0,
        sales: 0,
        profit: 0,
        purchaseCount: 0,
        salesCount: 0,
        avgPurchase: 0,
        avgSale: 0,
        bonusReceived: 0,
        bonusGiven: 0
      };
    }

    txs.forEach(tx => {
      const date = new Date(tx.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (months[monthKey]) {
        const baseAmount = parseValue(tx.base_amount);
        const bonusAmount = parseValue(tx.bonus_amount);

        if (tx.transaction_type === 'purchase') {
          months[monthKey].purchase += baseAmount;
          months[monthKey].purchaseCount++;
          months[monthKey].bonusReceived += bonusAmount;
        } else if (tx.transaction_type === 'sale') {
          months[monthKey].sales += baseAmount;
          months[monthKey].salesCount++;
          months[monthKey].bonusGiven += bonusAmount;
        }
      }
    });

    // Calculate averages and profits
    Object.values(months).forEach(month => {
      month.profit = month.sales - month.purchase;
      month.avgPurchase = month.purchaseCount > 0 ? month.purchase / month.purchaseCount : 0;
      month.avgSale = month.salesCount > 0 ? month.sales / month.salesCount : 0;
    });

    // Sort by date
    return Object.values(months).sort((a, b) => {
      const dateA = new Date(a.monthFull);
      const dateB = new Date(b.monthFull);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const calculateDailyData = (txs: TopUpTransaction[]): DailyData[] => {
    const days: { [key: string]: DailyData } = {};

    // Get all unique dates from transactions
    txs.forEach(tx => {
      const date = new Date(tx.transaction_date);
      const dateKey = date.toISOString().split('T')[0];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if (!days[dateKey]) {
        days[dateKey] = {
          date: dateKey,
          day,
          month,
          year,
          purchase: 0,
          sales: 0,
          profit: 0,
          displayDate: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
      }

      const baseAmount = parseValue(tx.base_amount);

      if (tx.transaction_type === 'purchase') {
        days[dateKey].purchase += baseAmount;
      } else if (tx.transaction_type === 'sale') {
        days[dateKey].sales += baseAmount;
      }
      days[dateKey].profit = days[dateKey].sales - days[dateKey].purchase;
    });

    // Sort by date (newest first)
    return Object.values(days).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const calculateSupplierPerformance = (txs: TopUpTransaction[]): SupplierPerformance[] => {
    const supplierMap: { [key: number]: SupplierPerformance } = {};

    txs.forEach(tx => {
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
            avgPurchase: 0,
            lastPurchase: tx.transaction_date
          };
        }
        supplierMap[tx.supplier_id].totalPurchases += baseAmount;
        supplierMap[tx.supplier_id].totalBonus += bonusAmount;
        supplierMap[tx.supplier_id].transactionCount++;
        if (new Date(tx.transaction_date) > new Date(supplierMap[tx.supplier_id].lastPurchase)) {
          supplierMap[tx.supplier_id].lastPurchase = tx.transaction_date;
        }
      }
    });

    return Object.values(supplierMap)
      .map(s => ({
        ...s,
        avgPurchase: s.transactionCount > 0 ? s.totalPurchases / s.transactionCount : 0
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);
  };

  const calculateResellerPerformance = (txs: TopUpTransaction[]): ResellerPerformance[] => {
    const resellerMap: { [key: number]: ResellerPerformance } = {};

    txs.forEach(tx => {
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
            avgSale: 0,
            lastSale: tx.transaction_date
          };
        }
        resellerMap[tx.reseller_id].totalSales += baseAmount;
        resellerMap[tx.reseller_id].totalBonus += bonusAmount;
        resellerMap[tx.reseller_id].transactionCount++;
        if (new Date(tx.transaction_date) > new Date(resellerMap[tx.reseller_id].lastSale)) {
          resellerMap[tx.reseller_id].lastSale = tx.transaction_date;
        }
      }
    });

    return Object.values(resellerMap)
      .map(r => ({
        ...r,
        avgSale: r.transactionCount > 0 ? r.totalSales / r.transactionCount : 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
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
    const data = monthlyData;

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
        ['Month', 'Purchases', 'Sales', 'Profit', 'Purchase Count', 'Sales Count', 'Bonus Received', 'Bonus Given'].join(','),
        ...monthlyData.map(d =>
          [d.monthFull, d.purchase, d.sales, d.profit, d.purchaseCount, d.salesCount, d.bonusReceived, d.bonusGiven].join(',')
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

  // Calculate summary values from profitStats or monthlyData
  const totalRevenue = useMemo(() => {
    if (profitStats?.profit_analysis?.total?.revenue) {
      return parseValue(profitStats.profit_analysis.total.revenue);
    }
    return monthlyData.reduce((sum, d) => sum + d.sales, 0);
  }, [profitStats, monthlyData]);

  const totalCost = useMemo(() => {
    if (profitStats?.profit_analysis?.total?.cost) {
      return parseValue(profitStats.profit_analysis.total.cost);
    }
    return monthlyData.reduce((sum, d) => sum + d.purchase, 0);
  }, [profitStats, monthlyData]);

  const totalProfit = useMemo(() => {
    if (profitStats?.profit_analysis?.total?.profit) {
      return parseValue(profitStats.profit_analysis.total.profit);
    }
    return monthlyData.reduce((sum, d) => sum + d.profit, 0);
  }, [profitStats, monthlyData]);

  const totalTransactionsCount = transactions.length;

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
                {t('businessAnalytics')} · {monthlyData.length} {t('months')}
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
              onClick={loadData}
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
                  {/* Period Selector */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      {t('period')}
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
                    >
                      <option value="week">{t('lastWeek')}</option>
                      <option value="month">{t('thisMonth')}</option>
                      <option value="quarter">{t('lastQuarter')}</option>
                      <option value="year">{t('year')}</option>
                      <option value="custom">{t('custom')}</option>
                    </select>
                  </div>

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
                  {selectedPeriod === 'year' && (
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
                  )}
                </div>

                {/* Comparison Toggle */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Target className="w-4 h-4" />
                    {t('compareWithPreviousYear')}
                    {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showComparison && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                          {t('comparisonYear')}
                        </label>
                        <select
                          value={comparisonYear}
                          onChange={(e) => setComparisonYear(Number(e.target.value))}
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
                        >
                          {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
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

        {/* Daily Breakdown with Month/Year Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              {t('dailyBreakdown')}
            </h3>

            {/* Month/Year Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('date')}</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('purchases')}</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('sales')}</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">{t('profit')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDailyData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('noDataForPeriod')}
                    </td>
                  </tr>
                ) : (
                  filteredDailyData.slice(0, 31).map((day, i) => (
                    <motion.tr
                      key={day.date}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.02 }}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{day.displayDate}</td>
                      <td className="text-right py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
                        {formatCurrency(day.purchase)}
                      </td>
                      <td className="text-right py-3 px-4 text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(day.sales)}
                      </td>
                      <td className={`text-right py-3 px-4 font-medium ${
                        day.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {day.profit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(day.profit))}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('avgPurchase'), value: monthlyData.reduce((sum, d) => sum + d.avgPurchase, 0) / (monthlyData.length || 1), icon: Package, color: 'blue' },
            { label: t('avgSale'), value: monthlyData.reduce((sum, d) => sum + d.avgSale, 0) / (monthlyData.length || 1), icon: CreditCard, color: 'green' },
            { label: t('totalBonusGiven'), value: monthlyData.reduce((sum, d) => sum + d.bonusGiven, 0), icon: Award, color: 'purple' },
            { label: t('totalBonusReceived'), value: monthlyData.reduce((sum, d) => sum + d.bonusReceived, 0), icon: Gift, color: 'amber' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
              green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
              purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
              amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
            };

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${colors[stat.color as keyof typeof colors]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCompactNumber(stat.value)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
};

export default ReportsPage;
