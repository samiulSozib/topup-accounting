// pages/ResellersPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Phone, MapPin, Percent, Eye, Pencil, Ban, CheckCircle, XCircle,
  DollarSign, TrendingUp, TrendingDown, Users, AlertCircle, Clock,
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw,
  Filter, ChevronLeft, ChevronRight, Search,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  MoreVertical,
  Calendar,
  Award,
  Gift,
  Package,
  Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import {
  fetchResellers,
  deleteReseller,
  changeResellerStatus,
} from '@/redux/slices/resellerSlice';
import { receiveResellerPayment } from '@/redux/slices/transactionSlice';
import { Reseller } from '@/type/reseller';
import { successAlert, errorAlert, confirmDelete } from '@/util/alert';
import UpdateResellerPercentageModal from '@/components/models/updateResellerPercentage';
import CollectionModal from '@/components/models/collectionModal';
import SellTopupModal from '@/components/models/sellTopUpModal';


const ResellersPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const resellers = useAppSelector((state: RootState) => state.resellers.resellers);
  const pagination = useAppSelector((state: RootState) => state.resellers.pagination);
  const isLoading = useAppSelector((state: RootState) => state.resellers.loading);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedResellerForPercentage, setSelectedResellerForPercentage] = useState<Reseller | null>(null);
  const [selectedResellerForCollection, setSelectedResellerForCollection] = useState<Reseller | null>(null);
  const [selectedResellerForSell, setSelectedResellerForSell] = useState<Reseller | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadResellers();
  }, [page, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadResellers = () => {
    dispatch(fetchResellers({
      page,
      item_per_page: 10,
      search: debouncedSearch || undefined
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleView = (reseller: Reseller) => {
    navigate(`/resellers/${reseller.id}`, { state: { reseller } });
  };

  const handleEdit = (reseller: Reseller) => {
    navigate('/add-reseller', { state: { reseller } });
  };

  const handleUpdatePercentage = (reseller: Reseller) => {
    setSelectedResellerForPercentage(reseller);
    setOpenDropdownId(null);
  };

  const handleCollection = (reseller: Reseller) => {
    setSelectedResellerForCollection(reseller);
    setOpenDropdownId(null);
  };

  const handleSellClick = (reseller: Reseller) => {
    setSelectedResellerForSell(reseller);
    setOpenDropdownId(null);
  };

  const handleCloseModal = () => {
    setSelectedResellerForPercentage(null);
    setSelectedResellerForCollection(null);
    setSelectedResellerForSell(null);
  };

  const handlePercentageUpdateSuccess = () => {
    loadResellers();
  };

  const handleCollectionSuccess = () => {
    loadResellers();
  };

  const handleSellSuccess = () => {
    loadResellers();
  };

  const handleToggleStatus = async (reseller: Reseller) => {
    try {
      const result = await dispatch(changeResellerStatus(reseller.id));

      if (changeResellerStatus.fulfilled.match(result)) {
        successAlert(t(reseller.status === 1 ? 'resellerDeactivated' : 'resellerActivated'));
        loadResellers();
        setOpenDropdownId(null);
      } else {
        errorAlert(result.payload as string || t('statusUpdateFailed'));
      }
    } catch (error) {
      errorAlert(t('statusUpdateFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete();
    if (confirmed) {
      try {
        const result = await dispatch(deleteReseller(id));
        if (deleteReseller.fulfilled.match(result)) {
          successAlert(t('resellerDeleted'));
          loadResellers();
          setOpenDropdownId(null);
        } else {
          errorAlert(result.payload as string || t('deleteFailed'));
        }
      } catch (error) {
        errorAlert(t('deleteFailed'));
      }
    }
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {t('active')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
          <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {t('inactive')}
        </span>
      );
    }
  };

  const getDueStatus = (due: number): 'paid' | 'partial' | 'due' => {
    if (due === 0) return 'paid';
    if (due > 0) return 'due';
    return 'paid';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('resellers')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              {t('totalResellers')}: {pagination?.total_records || resellers.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                title={t('gridView')}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                title={t('listView')}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <Link
              to="/add-reseller"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">{t('addReseller')}</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchResellers')}
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Resellers List */}
        {isLoading && resellers.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : resellers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('noResellers')}</p>
            <Link
              to="/add-reseller"
              className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-3 sm:px-4 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('addReseller')}
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - Enhanced Cards */
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {resellers.map((reseller: Reseller, i: number) => {
              const dueStatus = getDueStatus(reseller.total_due_amount || 0);
              const totalSales = reseller.total_sell_amount || 0;
              const totalWithBonus = reseller.total_sell_topup_with_bonus || 0;
              const bonusGiven = totalWithBonus - totalSales;
              const collectionRatio = totalSales > 0 ? ((reseller.total_received_amount || 0) / totalSales * 100).toFixed(1) : '0';

              return (
                <motion.div
                  key={reseller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-3 sm:p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${reseller.status === 1
                        ? 'bg-green-50 dark:bg-green-500/10'
                        : 'bg-gray-50 dark:bg-gray-700'
                        }`}>
                        <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${reseller.status === 1
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400'
                          }`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px]">
                          {reseller.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{reseller.city}</p>
                      </div>
                    </div>
                    {getStatusBadge(reseller.status)}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 truncate text-[11px] sm:text-xs">{reseller.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Percent className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-[11px] sm:text-xs">{reseller.bonus_percentage}% {t('bonus')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-[11px] sm:text-xs">
                        {t('since')} {formatDate(reseller.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1.5 sm:p-2">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">{t('due')}</p>
                      <p className={`text-xs sm:text-sm font-semibold truncate ${(reseller.total_due_amount || 0) > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {formatCurrency(reseller.total_due_amount || 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1.5 sm:p-2">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">{t('received')}</p>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                        {formatCurrency(reseller.total_received_amount || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">{t('totalSales')}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                        {formatCompactNumber(totalSales)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">{t('withBonus')}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">
                        {formatCompactNumber(totalWithBonus)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">{t('bonusGiven')}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">
                        {formatCompactNumber(bonusGiven)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar for Collection Ratio */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 mb-1">
                      <span>{t('collectionRatio')}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{collectionRatio}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{ width: `${collectionRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                    <button
                      onClick={() => handleSellClick(reseller)}
                      className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-primary/10 text-primary text-[10px] sm:text-xs font-medium hover:bg-primary/20 transition-colors"
                      title={t('sell')}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">{t('sell')}</span>
                    </button>
                    <button
                      onClick={() => handleView(reseller)}
                      className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title={t('view')}
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">{t('view')}</span>
                    </button>
                    <button
                      onClick={() => handleEdit(reseller)}
                      className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title={t('edit')}
                    >
                      <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">{t('edit')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      onClick={() => handleUpdatePercentage(reseller)}
                      className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] sm:text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      title={t('updateBonus')}
                    >
                      <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">%</span>
                    </button>
                    {(reseller.total_due_amount || 0) > 0 ? (
                      <button
                        onClick={() => handleCollection(reseller)}
                        className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                        title={t('collect')}
                      >
                        <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden xs:inline">{t('collect')}</span>
                      </button>
                    ) : (
                      <div className="py-1.5 sm:py-2"></div>
                    )}
                    <button
                      onClick={() => handleToggleStatus(reseller)}
                      className={`flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${reseller.status === 1
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                        }`}
                      title={reseller.status === 1 ? t('disable') : t('activate')}
                    >
                      <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">{reseller.status === 1 ? t('disable') : t('activate')}</span>
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(reseller.id)}
                    className="w-full mt-1.5 sm:mt-2 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] sm:text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                  >
                    <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {t('delete')}
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View - With Dropdown Menu */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <div className="col-span-3">{t('reseller')}</div>
              <div className="col-span-2">{t('contact')}</div>
              <div className="col-span-1 text-center">{t('bonus')}</div>
              <div className="col-span-2 text-end">{t('sales')}</div>
              <div className="col-span-2 text-end">{t('due')}</div>
              <div className="col-span-2 text-end">{t('actions')}</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {resellers.map((reseller: Reseller, i: number) => {
                const dueStatus = getDueStatus(reseller.total_due_amount || 0);
                const totalSales = reseller.total_sell_amount || 0;
                const totalWithBonus = reseller.total_sell_topup_with_bonus || 0;

                return (
                  <motion.div
                    key={reseller.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => toggleExpand(reseller.id)}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${reseller.status === 1
                              ? 'bg-green-50 dark:bg-green-500/10'
                              : 'bg-gray-50 dark:bg-gray-700'
                              }`}>
                              <Users className={`w-3.5 h-3.5 ${reseller.status === 1
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400'
                                }`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                                {reseller.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{reseller.city}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {(reseller.total_due_amount || 0) > 0 && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${dueStatus === 'due'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                }`}>
                                {dueStatus === 'due' ? t('due') : t('paid')}
                              </span>
                            )}
                            {expandedId === reseller.id ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reseller.phone}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t('due')}: {formatCurrency(reseller.total_due_amount || 0)}
                          </span>
                        </div>

                        <AnimatePresence>
                          {expandedId === reseller.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2"
                            >
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">{t('totalSales')}</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{formatCompactNumber(totalSales)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">{t('withBonus')}</p>
                                  <p className="font-medium text-purple-600 dark:text-purple-400">{formatCompactNumber(totalWithBonus)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">{t('received')}</p>
                                  <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatCompactNumber(reseller.total_received_amount || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">{t('due')}</p>
                                  <p className={`font-medium ${(reseller.total_due_amount || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {formatCompactNumber(reseller.total_due_amount || 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 mt-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSellClick(reseller); }}
                                  className="py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
                                >
                                  {t('sell')}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleView(reseller); }}
                                  className="py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  {t('view')}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(reseller); }}
                                  className="py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  {t('edit')}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUpdatePercentage(reseller); }}
                                  className="py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                >
                                  %
                                </button>
                                {(reseller.total_due_amount || 0) > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCollection(reseller); }}
                                    className="py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                  >
                                    {t('collect')}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(reseller); }}
                                  className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors ${reseller.status === 1
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                    }`}
                                >
                                  {reseller.status === 1 ? t('disable') : t('activate')}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(reseller.id); }}
                                  className="col-span-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                                >
                                  {t('delete')}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors items-center">
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${reseller.status === 1
                            ? 'bg-green-50 dark:bg-green-500/10'
                            : 'bg-gray-50 dark:bg-gray-700'
                            }`}>
                            <Users className={`w-4 h-4 ${reseller.status === 1
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400'
                              }`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{reseller.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{reseller.city}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-300 text-sm truncate">{reseller.phone}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatDate(reseller.createdAt)}
                        </p>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                          {reseller.bonus_percentage}%
                        </span>
                      </div>
                      <div className="col-span-2 text-end">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCompactNumber(totalSales)}</p>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400">
                          {t('withBonus')}: {formatCompactNumber(totalWithBonus)}
                        </p>
                      </div>
                      <div className="col-span-2 text-end">
                        <p className={`font-semibold ${(reseller.total_due_amount || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {formatCurrency(reseller.total_due_amount || 0)}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {t('received')}: {formatCompactNumber(reseller.total_received_amount || 0)}
                        </p>
                      </div>
                      <div className="col-span-2 text-end relative" ref={dropdownRef}>
                        <button
                          onClick={(e) => toggleDropdown(reseller.id, e)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                          <span>{t('actions')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdownId === reseller.id ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === reseller.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10 py-1">
                            <button
                              onClick={() => handleSellClick(reseller)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4 text-primary" />
                              {t('sell')}
                            </button>
                            <button
                              onClick={() => handleView(reseller)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              {t('view')}
                            </button>
                            <button
                              onClick={() => handleEdit(reseller)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Pencil className="w-4 h-4 text-amber-600" />
                              {t('edit')}
                            </button>
                            <button
                              onClick={() => handleUpdatePercentage(reseller)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Percent className="w-4 h-4 text-purple-600" />
                              {t('updateBonus')}
                            </button>
                            {(reseller.total_due_amount || 0) > 0 && (
                              <button
                                onClick={() => handleCollection(reseller)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                {t('collect')}
                              </button>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleToggleStatus(reseller)}
                              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                reseller.status === 1
                                  ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              <Ban className="w-4 h-4" />
                              {reseller.status === 1 ? t('disable') : t('activate')}
                            </button>
                            <button
                              onClick={() => handleDelete(reseller.id)}
                              className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              {t('delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium">
              {page} / {pagination.total_pages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedResellerForPercentage && (
          <UpdateResellerPercentageModal
            reseller={selectedResellerForPercentage}
            onClose={() => setSelectedResellerForPercentage(null)}
            onSuccess={handlePercentageUpdateSuccess}
          />
        )}

        {selectedResellerForCollection && (
          <CollectionModal
            reseller={selectedResellerForCollection}
            onClose={() => setSelectedResellerForCollection(null)}
            onSuccess={handleCollectionSuccess}
          />
        )}

        {selectedResellerForSell && (
          <SellTopupModal
            reseller={selectedResellerForSell}
            onClose={() => setSelectedResellerForSell(null)}
            onSuccess={handleSellSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResellersPage;