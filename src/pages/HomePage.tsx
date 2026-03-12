// pages/HomePage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, CreditCard, Truck, Users, Plus, 
  ArrowUpRight, ArrowDownLeft, Loader2, Calendar,
  TrendingUp as ProfitIcon, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchAllTransactions, selectAllTransactions, selectTransactionsLoading } from '@/redux/slices/topUpTransactionSlice';
import { fetchSuppliers, selectAllSuppliers } from '@/redux/slices/supplierSlice';
import { fetchResellers, selectAllResellers } from '@/redux/slices/resellerSlice';
import { fetchProfitStatistics, selectProfitStatistics } from '@/redux/slices/topUpTransactionSlice';
import { ITopUpTransaction } from '@/type/topUpTransaction';

const HomePage = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  
  const transactions = useAppSelector(selectAllTransactions);
  const suppliers = useAppSelector(selectAllSuppliers);
  const resellers = useAppSelector(selectAllResellers);
  const profitStats = useAppSelector(selectProfitStatistics);
  const isLoading = useAppSelector(selectTransactionsLoading);
  
  const [summaryData, setSummaryData] = useState({
    totalStock: 0,
    supplierDue: 0,
    resellerDue: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    totalPurchase: 0,
    totalSales: 0,
    todayPurchase: 0,
    todaySales: 0,
    monthlyPurchase: 0,
    monthlySales: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateSummary();
    }
  }, [transactions]);

  const loadData = () => {
    dispatch(fetchAllTransactions({}));
    dispatch(fetchSuppliers({ item_per_page: 100 }));
    dispatch(fetchResellers({ item_per_page: 100000 }));
    dispatch(fetchProfitStatistics());
  };

  const calculateSummary = () => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current month range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Calculate totals
    let totalStock = 0;
    let supplierDue = 0;
    let resellerDue = 0;
    let todayProfit = 0;
    let monthlyProfit = 0;
    let totalPurchase = 0;
    let totalSales = 0;
    let todayPurchase = 0;
    let todaySales = 0;
    let monthlyPurchase = 0;
    let monthlySales = 0;

    // Track purchase and sale amounts
    let totalPurchaseAmount = 0;
    let totalSaleAmount = 0;
    let todayPurchaseAmount = 0;
    let todaySaleAmount = 0;
    let monthlyPurchaseAmount = 0;
    let monthlySaleAmount = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.transaction_date);
      
      // For purchases: credit is total amount I pay to supplier
      if (tx.transaction_type === 'purchase') {
        totalPurchase += tx.credit;
        totalPurchaseAmount += tx.credit;
        supplierDue += (tx.credit - tx.debit); // Unpaid amount to supplier
        
        // Today's purchases
        if (txDate >= today && txDate < tomorrow) {
          todayPurchase += tx.credit;
          todayPurchaseAmount += tx.credit;
        }
        
        // Monthly purchases
        if (txDate >= monthStart && txDate <= monthEnd) {
          monthlyPurchase += tx.credit;
          monthlyPurchaseAmount += tx.credit;
        }
      }
      
      // For sales: debit is total amount reseller pays me
      if (tx.transaction_type === 'sale') {
        totalSales += tx.debit;
        totalSaleAmount += tx.debit;
        resellerDue += (tx.debit - tx.credit); // Unpaid amount from reseller
        
        // Today's sales
        if (txDate >= today && txDate < tomorrow) {
          todaySales += tx.debit;
          todaySaleAmount += tx.debit;
        }
        
        // Monthly sales
        if (txDate >= monthStart && txDate <= monthEnd) {
          monthlySales += tx.debit;
          monthlySaleAmount += tx.debit;
        }
      }
      
      // For supplier payments: reduce supplier due
      if (tx.transaction_type === 'supplier_payment') {
        supplierDue -= tx.debit;
      }
      
      // For reseller payments: reduce reseller due
      if (tx.transaction_type === 'reseller_payment') {
        resellerDue -= tx.credit;
      }
    });

    // Calculate profits
    todayProfit = todaySaleAmount - todayPurchaseAmount;
    monthlyProfit = monthlySaleAmount - monthlyPurchaseAmount;

    // Calculate total stock (total purchased topup - total sold topup)
    const totalPurchasedTopup = transactions
      .filter(tx => tx.transaction_type === 'purchase')
      .reduce((sum, tx) => sum + tx.topup_amount, 0);
    
    const totalSoldTopup = transactions
      .filter(tx => tx.transaction_type === 'sale')
      .reduce((sum, tx) => sum + tx.topup_amount, 0);
    
    totalStock = totalPurchasedTopup - totalSoldTopup;

    setSummaryData({
      totalStock: Math.max(0, totalStock),
      supplierDue: Math.max(0, supplierDue),
      resellerDue: Math.max(0, resellerDue),
      todayProfit: todayProfit,
      monthlyProfit: monthlyProfit,
      totalPurchase,
      totalSales,
      todayPurchase,
      todaySales,
      monthlyPurchase,
      monthlySales,
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const summaryCards = [
    { 
      label: t('totalStock'), 
      value: formatCurrency(summaryData.totalStock), 
      icon: Wallet, 
      gradient: 'gradient-card-primary',
      subtext: t('availableTopup')
    },
    { 
      label: t('supplierDue'), 
      value: formatCurrency(summaryData.supplierDue), 
      icon: TrendingDown, 
      gradient: 'gradient-card-accent',
      subtext: t('toPay')
    },
    { 
      label: t('resellerDue'), 
      value: formatCurrency(summaryData.resellerDue), 
      icon: TrendingUp, 
      gradient: 'gradient-card-purple',
      subtext: t('toCollect')
    },
    { 
      label: t('totalProfit'), 
      value: profitStats ? formatCurrency(Math.abs(profitStats.total?.profit || 0)) : formatCurrency(0), 
      icon: DollarSign, 
      gradient: profitStats && profitStats.total?.profit >= 0 ? 'gradient-card-success' : 'gradient-card-warning',
      subtext: profitStats && profitStats.total?.profit >= 0 ? t('profit') : t('loss')
    },
  ];

  const quickActions = [
    { label: t('buyTopup'), icon: ShoppingCart, path: '/buy-topup', gradient: 'gradient-card-primary' },
    { label: t('sellTopup'), icon: CreditCard, path: '/sell-topup', gradient: 'gradient-card-accent' },
    { label: t('supplierPayment'), icon: Truck, path: '/supplier-payment', gradient: 'gradient-card-blue' },
    { label: t('resellerPayment'), icon: Users, path: '/reseller-payment', gradient: 'gradient-card-purple' },
    { label: t('addSupplier'), icon: Plus, path: '/add-supplier', gradient: 'gradient-card-success' },
    { label: t('addReseller'), icon: Plus, path: '/add-reseller', gradient: 'gradient-card-warning' },
  ];

  const typeLabels: Record<string, string> = {
    purchase: t('purchases'),
    sale: t('sales'),
    supplier_payment: t('supplierPayment'),
    reseller_payment: t('resellerPayment'),
  };

  const getPartyName = (transaction: ITopUpTransaction): string => {
    if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'supplier_payment') {
      return transaction.supplier?.name || '—';
    }
    if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'reseller_payment') {
      return transaction.reseller?.name || '—';
    }
    return '—';
  };

  const getDueAmount = (transaction: ITopUpTransaction): number => {
    if (transaction.transaction_type === 'purchase') {
      return transaction.credit - transaction.debit;
    }
    if (transaction.transaction_type === 'sale') {
      return transaction.debit - transaction.credit;
    }
    return 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'purchase') return <ArrowDownLeft className="w-4 h-4" />;
    if (type === 'sale') return <ArrowUpRight className="w-4 h-4" />;
    if (type === 'supplier_payment') return <ArrowUpRight className="w-4 h-4" />;
    if (type === 'reseller_payment') return <ArrowDownLeft className="w-4 h-4" />;
    return <ArrowDownLeft className="w-4 h-4" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'purchase') return 'bg-emerald-100 text-emerald-600';
    if (type === 'sale') return 'bg-amber-100 text-amber-600';
    if (type === 'supplier_payment') return 'bg-rose-100 text-rose-600';
    if (type === 'reseller_payment') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getTransactionDisplayAmount = (transaction: ITopUpTransaction): { amount: number; type: 'credit' | 'debit' } => {
    if (transaction.transaction_type === 'purchase') {
      return { amount: transaction.credit, type: 'credit' };
    }
    if (transaction.transaction_type === 'sale') {
      return { amount: transaction.debit, type: 'debit' };
    }
    if (transaction.transaction_type === 'supplier_payment') {
      return { amount: transaction.debit, type: 'debit' };
    }
    if (transaction.transaction_type === 'reseller_payment') {
      return { amount: transaction.credit, type: 'credit' };
    }
    return { amount: 0, type: 'credit' };
  };

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading && transactions.length === 0 && !profitStats) {
    return (
      <div className="max-w-4xl mx-auto min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${card.gradient} rounded-2xl p-4 text-primary-foreground shadow-gradient`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs opacity-80 mt-1">{card.label}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{card.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Profit Statistics Card */}
      {profitStats && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5" />
            <h2 className="text-sm font-semibold">{t('profitOverview')}</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs opacity-80">{t('totalRevenue')}</p>
              <p className="text-xl font-bold">{formatCurrency(profitStats.total?.revenue || 0)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">{t('totalCost')}</p>
              <p className="text-xl font-bold">{formatCurrency(profitStats.total?.cost || 0)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">{t('totalProfit')}</p>
              <p className={`text-xl font-bold ${(profitStats.total?.profit || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {(profitStats.total?.profit || 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(profitStats.total?.profit || 0))}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-80">{t('todayProfit')}</p>
              <p className={`text-xl font-bold ${(profitStats.today?.profit || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {(profitStats.today?.profit || 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(profitStats.today?.profit || 0))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-80">{t('supplierDue')}</p>
              <p className="text-lg font-semibold">{formatCurrency(profitStats.total?.supplier_due || 0)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">{t('resellerDue')}</p>
              <p className="text-lg font-semibold">{formatCurrency(profitStats.total?.reseller_due || 0)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Today's Stats */}
      <div className="bg-card rounded-2xl border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t('todayStats')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t('purchases')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(summaryData.todayPurchase)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('sales')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(summaryData.todaySales)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('profit')}</p>
            <p className={`text-lg font-bold ${summaryData.todayProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summaryData.todayProfit >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(summaryData.todayProfit))}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-card rounded-2xl border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <ProfitIcon className="w-4 h-4" />
          {t('monthlyStats')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t('purchases')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(summaryData.monthlyPurchase)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('sales')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(summaryData.monthlySales)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('profit')}</p>
            <p className={`text-lg font-bold ${summaryData.monthlyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summaryData.monthlyProfit >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(summaryData.monthlyProfit))}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link
                to={action.path}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border hover:shadow-card-hover transition-all group"
              >
                <div className={`${action.gradient} w-10 h-10 rounded-xl flex items-center justify-center shadow-gradient group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight text-foreground">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t('recentTransactions')}</h2>
          <Link to="/transactions" className="text-xs text-primary font-medium">
            {t('viewAll')} →
          </Link>
        </div>
        <div className="bg-card rounded-2xl border divide-y overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {t('noTransactions')}
            </div>
          ) : (
            recentTransactions.map((tx, i) => {
              const displayAmount = getTransactionDisplayAmount(tx);
              const due = getDueAmount(tx);
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getTransactionColor(tx.transaction_type)}`}>
                      {getTransactionIcon(tx.transaction_type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{getPartyName(tx)}</p>
                      <p className="text-xs text-muted-foreground">{typeLabels[tx.transaction_type]}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className={`text-sm font-semibold ${
                      displayAmount.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {displayAmount.type === 'credit' ? '+' : '-'}
                      {displayAmount.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {due > 0 ? (
                        <span className="text-amber-600">{t('due')}: {due.toLocaleString()}</span>
                      ) : (
                        formatDate(tx.transaction_date)
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Supplier and Reseller Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t('suppliers')}</h3>
          <p className="text-2xl font-bold text-primary">{suppliers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {suppliers.filter(s => s.status === 1).length} {t('active')} · {t('totalDue')}: {formatCurrency(profitStats?.total?.supplier_due || summaryData.supplierDue)}
          </p>
        </div>
        <div className="bg-card rounded-2xl border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t('resellers')}</h3>
          <p className="text-2xl font-bold text-primary">{resellers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {resellers.filter(r => r.status === 1).length} {t('active')} · {t('totalDue')}: {formatCurrency(profitStats?.total?.reseller_due || summaryData.resellerDue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;