// pages/ResellersPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Plus, Phone, MapPin, Percent, CreditCard, Eye, Pencil, Ban, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  fetchResellers,
  deleteReseller,
  changeResellerStatus,
  setSelectedReseller,
  selectAllResellers,
  selectResellerLoading,
  selectResellerPagination,
} from '@/redux/slices/resellerSlice';
import { successAlert, errorAlert, confirmDelete } from '@/util/alert';
import { IReseller } from '@/type/reseller';
import UpdateResellerPercentageModal from '@/components/models/updateResellerPercentage';

const ResellersPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const resellers = useAppSelector(selectAllResellers);
  const isLoading = useAppSelector(selectResellerLoading);
  const pagination = useAppSelector(selectResellerPagination);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedResellerForPercentage, setSelectedResellerForPercentage] = useState<IReseller | null>(null);

  useEffect(() => {
    loadResellers();
  }, [page, search]);

  const loadResellers = () => {
    dispatch(fetchResellers({ 
      page, 
      item_per_page: 10,
      search: search || undefined 
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleView = (reseller: IReseller) => {
    dispatch(setSelectedReseller(reseller));
    successAlert(t('viewingReseller'));
  };

  const handleEdit = (reseller: IReseller) => {
    dispatch(setSelectedReseller(reseller));
    navigate('/add-reseller', { state: { reseller } });
  };

  const handleUpdatePercentage = (reseller: IReseller) => {
    setSelectedResellerForPercentage(reseller);
  };

  const handleCloseModal = () => {
    setSelectedResellerForPercentage(null);
  };

  const handlePercentageUpdateSuccess = () => {
    loadResellers();
  };

  const handleToggleStatus = async (reseller: IReseller) => {
    try {
      const newStatus = reseller.status === 1 ? 0 : 1;
      const result = await dispatch(changeResellerStatus({
        reseller_id: reseller.id,
        data: { status: newStatus }
      }));

      if (changeResellerStatus.fulfilled.match(result)) {
        successAlert(t(newStatus === 1 ? 'resellerActivated' : 'resellerDeactivated'));
        loadResellers();
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
        }
      } catch (error) {
        errorAlert(t('deleteFailed'));
      }
    }
  };

  const getStatusBadge = (status: number | null) => {
    if (status === 1) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle className="w-3 h-3" />
          {t('active')}
        </span>
      );
    } else if (status === 0) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
          <XCircle className="w-3 h-3" />
          {t('inactive')}
        </span>
      );
    }
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
        {t('pending')}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('resellers')}</h1>
        <Link
          to="/add-reseller"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-card-primary text-primary-foreground font-medium text-sm shadow-gradient hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t('addReseller')}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-2xl border p-4">
        <input
          type="text"
          placeholder={t('searchResellers')}
          value={search}
          onChange={handleSearch}
          className="w-full px-4 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* Resellers List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : resellers.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground">{t('noResellers')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {resellers.map((reseller: IReseller, i: number) => (
              <motion.div
                key={reseller.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{reseller.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {reseller.city}
                    </div>
                  </div>
                  {getStatusBadge(reseller.status)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {reseller.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    {reseller.bonus_percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(reseller)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('view')}
                  </button>
                  <button
                    onClick={() => handleEdit(reseller)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleUpdatePercentage(reseller)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    {t('updateBonus')}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleToggleStatus(reseller)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      reseller.status === 1
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {reseller.status === 1 ? t('disable') : t('activate')}
                  </button>
                  <button
                    onClick={() => handleDelete(reseller.id)}
                    className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {t('delete')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-50"
              >
                {t('previous')}
              </button>
              <span className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
                {page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Update Percentage Modal */}
      {selectedResellerForPercentage && (
        <UpdateResellerPercentageModal
          reseller={selectedResellerForPercentage}
          onClose={handleCloseModal}
          onSuccess={handlePercentageUpdateSuccess}
        />
      )}
    </div>
  );
};

export default ResellersPage;