// pages/TransactionsPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Loader2, ChevronDown, ChevronUp, X, DollarSign,
  Filter, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart, CreditCard, Truck, Users,
  Calendar, Download, Eye, EyeOff, CheckCircle, AlertCircle, Clock, Package,
  LucideIcon
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import { 
  fetchTransactions, 
  makeSupplierPayment,
  receiveResellerPayment
} from '@/redux/slices/transactionSlice';
import { TopUpTransaction, TransactionFilter } from '@/type/topUpTransaction';
import { successAlert, errorAlert } from '@/util/alert';

type Filter = 'all' | 'purchase' | 'sale' | 'supplier_payment' | 'reseller_payment';

interface FilterState {
  start_date: string;
  end_date: string;
  min_amount?: number;
  max_amount?: number;
  supplier_id?: number;
  reseller_id?: number;
}

// Filter Panel Component
const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClose,
  onClear
}: { 
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | number | undefined) => void;
  onClose: () => void;
  onClear: () => void;
}) => {
  const { t } = useLanguage();
  
  const filtersCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            {t('filters')}
            {filtersCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
                {filtersCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {filtersCount > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {t('clear')}
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('startDate')}
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => onFilterChange('start_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('endDate')}
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => onFilterChange('end_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('minAmount')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.min_amount ?? ''}
              onChange={(e) => onFilterChange('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              {t('maxAmount')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.max_amount ?? ''}
              onChange={(e) => onFilterChange('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
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

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('previous')}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
          disabled={typeof page !== 'number'}
          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
            currentPage === page
              ? 'bg-gradient-to-r from-primary to-primary/70 text-white shadow-md'
              : typeof page === 'number'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'text-gray-400 dark:text-gray-500 cursor-default'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('next')}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Payment Dialog Component (for Supplier)
const PaymentDialog = ({ 
  transaction, 
  onClose, 
  onSuccess 
}: { 
  transaction: TopUpTransaction; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  
  const due = (transaction.base_amount || 0) - (transaction.paid_amount || 0);
  
  const [amount, setAmount] = useState<string>(due.toString());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value) || 0;
    
    if (numValue > due) {
      setAmount(due.toString());
      errorAlert(t('paymentExceedsDue').replace('{due}', due.toLocaleString()));
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
      errorAlert(t('paymentExceedsDue').replace('{due}', due.toLocaleString()));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(makeSupplierPayment({
        supplier_id: transaction.supplier_id!,
        amount: numAmount,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (makeSupplierPayment.fulfilled.match(result)) {
        successAlert(t('paymentSuccessful'));
        onSuccess();
        onClose();
      } else {
        errorAlert(result.payload as string || t('paymentFailed'));
      }
    } catch (error) {
      errorAlert(t('paymentFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-5 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('payDue')} - {transaction.supplier?.name}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Due Amount Display */}
          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t('totalDue')}</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('paymentAmount')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max={due}
              step="0.01"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={`${t('maxAmount')}: ${due.toLocaleString()}`}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('maxAmount')}: {due.toLocaleString()}
            </p>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={t('referencePlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20"
              placeholder={t('notesPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('processing')}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {t('confirmPayment')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Collection Dialog Component (for Reseller)
const CollectionDialog = ({ 
  transaction, 
  onClose, 
  onSuccess 
}: { 
  transaction: TopUpTransaction; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  
  const due = (transaction.base_amount || 0) - (transaction.paid_amount || 0);
  
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
      const result = await dispatch(receiveResellerPayment({
        reseller_id: transaction.reseller_id!,
        amount: numAmount,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (receiveResellerPayment.fulfilled.match(result)) {
        successAlert(t('collectionSuccessful'));
        onSuccess();
        onClose();
      } else {
        errorAlert(result.payload as string || t('collectionFailed'));
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
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-5 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('collectDue')} - {transaction.reseller?.name}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Due Amount Display */}
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{t('totalDue')}</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('collectionAmount')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max={due}
              step="0.01"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={`${t('maxAmount')}: ${due.toLocaleString()}`}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('maxAmount')}: {due.toLocaleString()}
            </p>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={t('referencePlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20"
              placeholder={t('notesPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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

const TransactionsPage = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions);
  const pagination = useAppSelector((state: RootState) => state.transactions.pagination);
  const summary = useAppSelector((state: RootState) => state.transactions.summary);
  const isLoading = useAppSelector((state: RootState) => state.transactions.loading);
  
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedForPayment, setSelectedForPayment] = useState<TopUpTransaction | null>(null);
  const [selectedForCollection, setSelectedForCollection] = useState<TopUpTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Advanced filters
  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
    min_amount: undefined,
    max_amount: undefined,
    supplier_id: undefined,
    reseller_id: undefined,
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
  }, [filter, debouncedSearch, filters, currentPage]);

  const loadTransactions = () => {
    let transaction_type: string | undefined;
    
    if (filter !== 'all') {
      transaction_type = filter;
    }
    
    const apiFilters: TransactionFilter = {
      page: currentPage,
      limit: itemsPerPage,
      ...(transaction_type && { transaction_type }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
      ...(filters.min_amount !== undefined && { min_amount: filters.min_amount }),
      ...(filters.max_amount !== undefined && { max_amount: filters.max_amount }),
      ...(filters.supplier_id && { supplier_id: filters.supplier_id }),
      ...(filters.reseller_id && { reseller_id: filters.reseller_id }),
    };
    
    dispatch(fetchTransactions(apiFilters));
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
      supplier_id: undefined,
      reseller_id: undefined,
    });
    setSearch('');
    setFilter('all');
    setCurrentPage(1);
  };

  const filtersCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length;

  const filtersList: { key: Filter; label: string; icon: LucideIcon }[] = [
    { key: 'all', label: t('all'), icon: LayoutGrid },
    { key: 'purchase', label: t('purchases'), icon: ShoppingCart },
    { key: 'sale', label: t('sales'), icon: CreditCard },
    { key: 'supplier_payment', label: t('supplierPayment'), icon: Truck },
    { key: 'reseller_payment', label: t('resellerPayment'), icon: Users },
  ];

  const typeLabels: Record<string, string> = {
    purchase: t('purchases'),
    sale: t('sales'),
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

  const getPartyDetails = (transaction: TopUpTransaction): string => {
    if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'supplier_payment') {
      return transaction.supplier?.company || '';
    }
    if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'reseller_payment') {
      return transaction.reseller?.city || '';
    }
    return '';
  };

  const getDueAmount = (transaction: TopUpTransaction): number => {
    return (transaction.base_amount || 0) - (transaction.paid_amount || 0);
  };

  const getDueStatus = (transaction: TopUpTransaction): 'paid' | 'partial' | 'due' => {
    const due = getDueAmount(transaction);
    if (due === 0) return 'paid';
    if (due < (transaction.base_amount || 0)) return 'partial';
    return 'due';
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
    if (type === 'purchase') return <ArrowDownLeft className="w-4 h-4" />;
    if (type === 'sale') return <ArrowUpRight className="w-4 h-4" />;
    if (type === 'supplier_payment') return <ArrowUpRight className="w-4 h-4" />;
    if (type === 'reseller_payment') return <ArrowDownLeft className="w-4 h-4" />;
    return <ArrowDownLeft className="w-4 h-4" />;
  };

  const getTransactionColor = (type: string): { bg: string; text: string } => {
    const colors = {
      purchase: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
      sale: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
      supplier_payment: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
      reseller_payment: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    };
    return colors[type as keyof typeof colors] || colors.purchase;
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

  const toggleExpand = (id: number): void => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePaymentClick = (transaction: TopUpTransaction): void => {
    setSelectedForPayment(transaction);
  };

  const handleCollectionClick = (transaction: TopUpTransaction): void => {
    setSelectedForCollection(transaction);
  };

  const handleSuccess = (): void => {
    loadTransactions();
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('transactions')}</h1>
            {summary && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('totalBaseAmount')}: {summary.total_base_amount.toLocaleString()} · 
                {t('totalPaid')}: {summary.total_paid_amount.toLocaleString()} · 
                {t('totalBonus')}: {summary.total_bonus_amount.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Package className="w-4 h-4" />
              </button>
            </div>

            {(filtersCount > 0 || search || filter !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {t('clear')}
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              placeholder={t('searchTransactions')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
              showFilters || filtersCount > 0
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filters')}</span>
            {filtersCount > 0 && (
              <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
              onClear={clearFilters}
            />
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filtersList.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Summary Cards */}
        {/* {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalBaseAmount')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {summary.total_base_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalPaid')}</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {summary.total_paid_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalBonus')}</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {summary.total_bonus_amount.toLocaleString()}
              </p>
            </div>
          </div>
        )} */}

        {/* Transactions Grid/List */}
        {viewMode === 'list' ? (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <span className="col-span-3">{t('partyName')}</span>
              <span className="col-span-2">{t('transactionType')}</span>
              <span className="col-span-2 text-end">{t('baseAmount')}</span>
              <span className="col-span-2 text-end">{t('paidAmount')}</span>
              <span className="col-span-2 text-end">{t('dueAmount')}</span>
              {/* <span className="col-span-1 text-end">{t('action')}</span> */}
            </div>

            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p>{t('noTransactions')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map((tx, i) => {
                  const due = getDueAmount(tx);
                  const dueStatus = getDueStatus(tx);
                  const colors = getTransactionColor(tx.transaction_type);
                  const amount = getTransactionAmount(tx);
                  
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {/* Mobile View */}
                      <div className="md:hidden">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleExpand(tx.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                                {getTransactionIcon(tx.transaction_type)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {getPartyName(tx)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  {typeLabels[tx.transaction_type]}
                                  {getPartyDetails(tx) && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      {getPartyDetails(tx)}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {due > 0 && (
                                <span className={`text-[10px] px-2 py-1 rounded-full ${
                                  dueStatus === 'partial' 
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                }`}>
                                  {dueStatus === 'partial' ? t('partial') : t('due')}
                                </span>
                              )}
                              {expandedId === tx.id ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Quick Info Row */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatDate(tx.transaction_date)} · {formatTime(tx.transaction_date)}
                            </span>
                            <span className={`font-medium ${amount.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {amount.type === 'in' ? '+' : '-'}{amount.amount.toLocaleString()}
                            </span>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedId === tx.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm"
                              >
                                {/* Reference */}
                                {tx.reference_no && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('referenceNumber')}:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{tx.reference_no}</span>
                                  </div>
                                )}

                                {/* Base Amount & Bonus */}
                                {tx.base_amount > 0 && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 dark:text-gray-400">{t('baseAmount')}:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        {tx.base_amount.toLocaleString()}
                                      </span>
                                    </div>
                                    {tx.bonus_percentage > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">{t('bonus')} ({tx.bonus_percentage}%):</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                          {tx.bonus_amount?.toLocaleString() || 0}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-medium">
                                      <span className="text-gray-500 dark:text-gray-400">{t('totalAmount')}:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        {tx.total_amount?.toLocaleString() || tx.base_amount}
                                      </span>
                                    </div>
                                  </>
                                )}

                                {/* Payment Details */}
                                {(tx.transaction_type === 'purchase' || tx.transaction_type === 'sale') && (
                                  <>
                                    <div className="flex justify-between pt-1">
                                      <span className="text-gray-500 dark:text-gray-400">{t('paidAmount')}:</span>
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        {tx.paid_amount?.toLocaleString() || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
                                      <span className="text-gray-500 dark:text-gray-400 font-medium">{t('dueAmount')}:</span>
                                      <span className={`font-bold ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {due.toLocaleString()}
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {/* {due > 0 && (
                                      <div className="flex gap-2 mt-2">
                                        {tx.transaction_type === 'purchase' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePaymentClick(tx);
                                            }}
                                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200"
                                          >
                                            {t('pay')}
                                          </button>
                                        )}
                                        {tx.transaction_type === 'sale' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCollectionClick(tx);
                                            }}
                                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                                          >
                                            {t('collect')}
                                          </button>
                                        )}
                                      </div>
                                    )} */}
                                  </>
                                )}

                                {/* Notes */}
                                {tx.notes && (
                                  <div className="pt-1">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">
                                      {t('notes')}:
                                    </span>
                                    <p className="text-gray-900 dark:text-white text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                      {tx.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Transaction ID */}
                                <div className="pt-1 text-[10px] text-gray-400 text-right">
                                  ID: {tx.id}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors items-center">
                        <div className="col-span-3">
                          <p className="font-medium text-gray-900 dark:text-white">{getPartyName(tx)}</p>
                          {getPartyDetails(tx) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{getPartyDetails(tx)}</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {getTransactionIcon(tx.transaction_type)}
                            {typeLabels[tx.transaction_type]}
                          </span>
                        </div>
                        <div className="col-span-2 text-end font-medium text-gray-900 dark:text-white">
                          {tx.base_amount?.toLocaleString() || '—'}
                        </div>
                        <div className="col-span-2 text-end font-medium text-emerald-600 dark:text-emerald-400">
                          {tx.paid_amount?.toLocaleString() || '—'}
                        </div>
                        <div className="col-span-2 text-end">
                          <span className={`font-semibold ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {due > 0 ? due.toLocaleString() : '—'}
                          </span>
                          {dueStatus === 'partial' && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">{t('partial')}</p>
                          )}
                        </div>
                        {/* <div className="col-span-1 text-end">
                          {tx.transaction_type === 'purchase' && due > 0 && (
                            <button
                              onClick={() => handlePaymentClick(tx)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200"
                            >
                              {t('pay')}
                            </button>
                          )}
                          {tx.transaction_type === 'sale' && due > 0 && (
                            <button
                              onClick={() => handleCollectionClick(tx)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                            >
                              {t('collect')}
                            </button>
                          )}
                        </div> */}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.length === 0 ? (
              <div className="col-span-full px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p>{t('noTransactions')}</p>
              </div>
            ) : (
              transactions.map((tx, i) => {
                const due = getDueAmount(tx);
                const dueStatus = getDueStatus(tx);
                const colors = getTransactionColor(tx.transaction_type);
                const amount = getTransactionAmount(tx);
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                          {getTransactionIcon(tx.transaction_type)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{getPartyName(tx)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{typeLabels[tx.transaction_type]}</p>
                        </div>
                      </div>
                      {due > 0 && (
                        <span className={`text-[10px] px-2 py-1 rounded-full ${
                          dueStatus === 'partial' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        }`}>
                          {dueStatus === 'partial' ? t('partial') : t('due')}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{t('baseAmount')}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{tx.base_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{t('paidAmount')}:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{tx.paid_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{t('dueAmount')}:</span>
                        <span className={`font-medium ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {due.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(tx.transaction_date)}
                      </span>
                      {due > 0 && (
                        <>
                          {tx.transaction_type === 'purchase' && (
                            <button
                              onClick={() => handlePaymentClick(tx)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200"
                            >
                              {t('pay')}
                            </button>
                          )}
                          {tx.transaction_type === 'sale' && (
                            <button
                              onClick={() => handleCollectionClick(tx)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                            >
                              {t('collect')}
                            </button>
                          )}
                        </>
                      )}
                    </div> */}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Dialogs */}
        <AnimatePresence>
          {selectedForPayment && (
            <PaymentDialog
              transaction={selectedForPayment}
              onClose={() => setSelectedForPayment(null)}
              onSuccess={handleSuccess}
            />
          )}

          {selectedForCollection && (
            <CollectionDialog
              transaction={selectedForCollection}
              onClose={() => setSelectedForCollection(null)}
              onSuccess={handleSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Import LayoutGrid icon
import { LayoutGrid } from 'lucide-react';

export default TransactionsPage;