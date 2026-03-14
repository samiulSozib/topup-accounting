// pages/ResellerLedgerPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { 
  fetchAllTransactions, 
  selectAllTransactions, 
  selectTransactionsLoading, 
  makeResellerCollection 
} from '@/redux/slices/transactionSlice';
import { ITopUpTransaction, ITransactionFilters, ITransactionResponse } from '@/type/topUpTransaction';
import { 
  Loader2, ChevronDown, ChevronUp, Search, ArrowUpRight, ArrowDownLeft, X, DollarSign,
  Filter, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { successAlert, errorAlert } from '@/util/alert';

interface FilterState {
  start_date: string;
  end_date: string;
  min_amount?: number;
  max_amount?: number;
}

// Filter Panel Component
const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClose 
}: { 
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | number | undefined) => void;
  onClose: () => void;
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card rounded-2xl border p-4 mb-4 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {t('filters')}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Range */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('startDate')}</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('endDate')}</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Amount Range */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('minAmount')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.min_amount ?? ''}
              onChange={(e) => onFilterChange('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('maxAmount')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.max_amount ?? ''}
              onChange={(e) => onFilterChange('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const { t } = useLanguage();

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
            currentPage === page
              ? 'gradient-card-primary text-primary-foreground shadow-gradient'
              : 'bg-secondary text-secondary-foreground hover:bg-muted'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Collection Dialog Component
const CollectionDialog = ({
  transaction,
  onClose,
  onSuccess
}: {
  transaction: ITopUpTransaction;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const due = transaction.debit - transaction.credit;

  const [amount, setAmount] = useState<string>(due.toString());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value) || 0;

    if (numValue > due) {
      setAmount(due.toString());
      errorAlert(t('collectionExceedsDue').replace('{due}', due.toLocaleString()));
    } else {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount) || 0;

    if (numAmount <= 0) {
      errorAlert(t('validAmountRequired'));
      return;
    }

    if (numAmount > due) {
      errorAlert(t('collectionExceedsDue').replace('{due}', due.toLocaleString()));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(makeResellerCollection({
        transaction_id: transaction.id,
        amount: numAmount,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (makeResellerCollection.fulfilled.match(result)) {
        successAlert(t('collectionSuccessful'));
        onSuccess();
        onClose();
      }
    } catch (error) {
      errorAlert(t('collectionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {t('collectDue')} - {transaction.reseller?.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Due Amount Display */}
          <div className="bg-secondary/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{t('totalDue')}</p>
            <p className="text-2xl font-bold text-rose-600">{due.toLocaleString()}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('collectionAmount')} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
              <input
                type="number"
                min="0"
                max={due}
                step="0.01"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-8 pr-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder={`Max: ${due.toLocaleString()}`}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('maxAmount')}: {due.toLocaleString()}
            </p>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={t('referencePlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20"
              placeholder={t('notesPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('processing')}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {t('confirmCollection')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ResellerLedgerPage = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const transactions = useAppSelector(selectAllTransactions);
  const isLoading = useAppSelector(selectTransactionsLoading);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedForCollection, setSelectedForCollection] = useState<ITopUpTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Advanced filters
  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
    min_amount: undefined,
    max_amount: undefined,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load transactions when filters change
  useEffect(() => {
    loadTransactions();
  }, [debouncedSearch, filters, currentPage]);

  const loadTransactions = () => {
    const apiFilters: ITransactionFilters = {
      transaction_type: 'sale,reseller_payment',
      page: currentPage,
      limit: itemsPerPage,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
      ...(filters.min_amount !== undefined && { min_amount: filters.min_amount }),
      ...(filters.max_amount !== undefined && { max_amount: filters.max_amount }),
    };

    dispatch(fetchAllTransactions(apiFilters)).then((result) => {
      // Type guard to check if result has payload with pagination
      if (result && typeof result === 'object' && 'payload' in result) {
        const payload = result.payload as ITransactionResponse;
        if (payload?.pagination) {
          setTotalPages(payload.pagination.total_pages || 1);
        }
      }
    });
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      min_amount: undefined,
      max_amount: undefined,
    });
    setSearch('');
    setCurrentPage(1);
  };

  const filtersCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length;

  // Calculate totals
  const totalSold = transactions
    .filter(tx => tx.transaction_type === 'sale')
    .reduce((sum, tx) => sum + tx.debit, 0);

  const totalReceived = transactions
    .filter(tx => tx.transaction_type === 'reseller_payment')
    .reduce((sum, tx) => sum + tx.credit, 0);

  const dueAmount = totalSold - totalReceived;

  const cards = [
    {
      label: t('totalSold'),
      value: totalSold,
      gradient: 'gradient-card-purple'
    },
    {
      label: t('totalReceived'),
      value: totalReceived,
      gradient: 'gradient-card-success'
    },
    {
      label: t('resellerDue'),
      value: dueAmount,
      gradient: dueAmount >= 0 ? 'gradient-card-warning' : 'gradient-card-accent'
    },
  ];

  const typeLabels: Record<string, string> = {
    sale: t('sales'),
    reseller_payment: t('resellerPayment'),
  };

  const getPartyName = (transaction: ITopUpTransaction): string => {
    return transaction.reseller?.name || '—';
  };

  const getPartyDetails = (transaction: ITopUpTransaction): string => {
    return transaction.reseller?.city || '';
  };

  const getDueAmount = (transaction: ITopUpTransaction): number => {
    if (transaction.transaction_type === 'sale') {
      return transaction.debit - transaction.credit;
    }
    return 0;
  };

  const getDueStatus = (transaction: ITopUpTransaction): 'paid' | 'partial' | 'due' => {
    if (transaction.transaction_type === 'sale') {
      const due = transaction.debit - transaction.credit;
      if (due === 0) return 'paid';
      if (due < transaction.debit) return 'partial';
      return 'due';
    }
    return 'paid';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string): JSX.Element => {
    if (type === 'sale') return <ArrowUpRight className="w-4 h-4" />;
    if (type === 'reseller_payment') return <ArrowDownLeft className="w-4 h-4" />;
    return <ArrowDownLeft className="w-4 h-4" />;
  };

  const getTransactionColor = (type: string): string => {
    if (type === 'sale') return 'bg-amber-100 text-amber-600';
    if (type === 'reseller_payment') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getTransactionAmount = (transaction: ITopUpTransaction): { amount: number; type: 'credit' | 'debit' } => {
    if (transaction.transaction_type === 'sale') {
      return { amount: transaction.debit, type: 'debit' };
    }
    if (transaction.transaction_type === 'reseller_payment') {
      return { amount: transaction.credit, type: 'credit' };
    }
    return { amount: 0, type: 'credit' };
  };

  const toggleExpand = (id: number): void => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCollectionClick = (transaction: ITopUpTransaction): void => {
    setSelectedForCollection(transaction);
  };

  const handleCollectionSuccess = (): void => {
    // Refresh transactions
    loadTransactions();
  };

  if (isLoading && transactions.length === 0) {
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
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('resellerLedger')}</h1>
        {(filtersCount > 0 || search) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${card.gradient} rounded-2xl p-4 text-primary-foreground shadow-gradient`}
          >
            <p className="text-xs opacity-80">{card.label}</p>
            <p className="text-xl font-bold mt-1">
              {card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full ps-10 pe-4 py-3 rounded-xl border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            placeholder={t('searchResellers')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
            showFilters || filtersCount > 0
              ? 'gradient-card-primary text-primary-foreground shadow-gradient'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{t('filters')}</span>
          {filtersCount > 0 && (
            <span className="bg-primary-foreground/20 text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filtersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Transactions Table */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-8 gap-4 px-4 py-3 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase">
          <span className="col-span-2">{t('partyName')}</span>
          <span>{t('transactionType')}</span>
          <span className="text-end">{t('total')}</span>
          <span className="text-end">{t('paid')}</span>
          <span className="text-end">{t('due')}</span>
          <span className="text-end">{t('date')}</span>
          <span className="text-end">{t('action')}</span>
        </div>

        {transactions.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            {t('noTransactions')}
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((tx, i) => {
              const due = getDueAmount(tx);
              const dueStatus = getDueStatus(tx);
              const isExpanded = expandedId === tx.id;

              // Get total and paid based on transaction type
              const total = tx.transaction_type === 'sale' ? tx.debit : 0;
              const paid = tx.transaction_type === 'sale' ? tx.credit : tx.credit;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Mobile - Enhanced View */}
                  <div className="md:hidden">
                    <div
                      className="px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => toggleExpand(tx.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionColor(tx.transaction_type)}`}>
                            {getTransactionIcon(tx.transaction_type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{getPartyName(tx)}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              {typeLabels[tx.transaction_type]}
                              {getPartyDetails(tx) && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                  {getPartyDetails(tx)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {tx.transaction_type === 'sale' && due > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${dueStatus === 'partial'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                              }`}>
                              {dueStatus === 'partial' ? t('partial') : t('due')}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Quick Info Row */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          {formatDate(tx.transaction_date)} · {formatTime(tx.transaction_date)}
                        </span>
                        {tx.transaction_type === 'sale' && due > 0 ? (
                          <span className="font-medium text-rose-600">
                            {t('due')}: {due.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        ) : tx.transaction_type === 'sale' && due === 0 ? (
                          <span className="font-medium text-emerald-600">
                            {t('paid')}
                          </span>
                        ) : null}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t text-sm space-y-2"
                        >
                          {/* Reference */}
                          {tx.reference_no && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('referenceNumber')}:</span>
                              <span className="text-foreground font-medium">{tx.reference_no}</span>
                            </div>
                          )}

                          {/* Base Amount & Bonus - Only for sales */}
                          {tx.transaction_type === 'sale' && tx.base_amount > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('baseAmount')}:</span>
                                <span className="text-foreground">
                                  {tx.base_amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>
                              {tx.bonus_percentage > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{t('bonus')} ({tx.bonus_percentage}%):</span>
                                  <span className="text-emerald-600">
                                    {(tx.topup_amount - tx.base_amount).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium">
                                <span className="text-muted-foreground">{t('topupAmount')}:</span>
                                <span className="text-foreground">
                                  {tx.topup_amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Payment Details - Only for sales */}
                          {tx.transaction_type === 'sale' && (
                            <>
                              <div className="flex justify-between pt-1">
                                <span className="text-muted-foreground">{t('totalAmount')}:</span>
                                <span className="text-foreground font-medium">
                                  {total.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('paidAmount')}:</span>
                                <span className="text-emerald-600 font-medium">
                                  {paid.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-1 mt-1">
                                <span className="text-muted-foreground font-medium">{t('dueAmount')}:</span>
                                <span className={`font-bold ${due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {due.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </div>

                              {/* Collect Due Button */}
                              {due > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCollectionClick(tx);
                                  }}
                                  className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  {t('collectDue')}
                                </button>
                              )}
                            </>
                          )}

                          {/* Payment amount for reseller_payment */}
                          {tx.transaction_type === 'reseller_payment' && (
                            <div className="flex justify-between pt-1">
                              <span className="text-muted-foreground">{t('paymentAmount')}:</span>
                              <span className="text-emerald-600 font-medium">
                                {tx.credit.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {tx.notes && (
                            <div className="pt-1">
                              <span className="text-muted-foreground text-xs block mb-1">
                                {t('notes')}:
                              </span>
                              <p className="text-foreground text-xs bg-secondary/30 p-2 rounded-lg">
                                {tx.notes}
                              </p>
                            </div>
                          )}

                          {/* Transaction ID */}
                          <div className="pt-1 text-[10px] text-muted-foreground text-right">
                            ID: {tx.id}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-8 gap-4 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors items-center">
                    <span className="font-medium text-foreground col-span-2">
                      {getPartyName(tx)}
                      {getPartyDetails(tx) && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({getPartyDetails(tx)})
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground">{typeLabels[tx.transaction_type]}</span>
                    <span className="text-end font-medium">
                      {tx.transaction_type === 'sale'
                        ? `${tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </span>
                    <span className="text-end font-medium text-emerald-600">
                      {tx.transaction_type === 'sale'
                        ? `${tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : tx.transaction_type === 'reseller_payment'
                          ? `${tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                    </span>
                    <span className={`text-end font-semibold ${due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.transaction_type === 'sale' && due > 0
                        ? `${due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : tx.transaction_type === 'sale' && due === 0
                          ? '—'
                          : '—'}
                    </span>
                    <span className="text-end text-muted-foreground">
                      {formatDate(tx.transaction_date)}
                      <span className="text-xs block">{formatTime(tx.transaction_date)}</span>
                    </span>
                    <span className="text-end">
                      {tx.transaction_type === 'sale' && due > 0 && (
                        <button
                          onClick={() => handleCollectionClick(tx)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{t('collect')}</span>
                        </button>
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Collection Dialog */}
      {selectedForCollection && (
        <CollectionDialog
          transaction={selectedForCollection}
          onClose={() => setSelectedForCollection(null)}
          onSuccess={handleCollectionSuccess}
        />
      )}
    </div>
  );
};

export default ResellerLedgerPage;