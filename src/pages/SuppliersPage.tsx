// pages/SuppliersPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Plus, Phone, Building2, Percent, Eye, Pencil, Ban, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  fetchSuppliers,
  deleteSupplier,
  changeSupplierStatus,
  setSelectedSupplier,
  selectAllSuppliers,
  selectSupplierLoading,
  selectSupplierPagination,
} from '@/redux/slices/supplierSlice';
import { successAlert, errorAlert, confirmDelete } from '@/util/alert';
import { ISupplier } from '@/type/supplier';
import UpdatePercentageModal from '@/components/models/updateSupplierPercentage';

const SuppliersPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const suppliers = useAppSelector(selectAllSuppliers);
  const isLoading = useAppSelector(selectSupplierLoading);
  const pagination = useAppSelector(selectSupplierPagination);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSupplierForPercentage, setSelectedSupplierForPercentage] = useState<ISupplier | null>(null); // State for modal

  useEffect(() => {
    loadSuppliers();
  }, [page, search]);

  const loadSuppliers = () => {
    dispatch(fetchSuppliers({ 
      page, 
      item_per_page: 10,
      search: search || undefined 
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleView = (supplier: ISupplier) => {
    dispatch(setSelectedSupplier(supplier));
    successAlert(t('viewingSupplier'));
  };

  const handleEdit = (supplier: ISupplier) => {
    dispatch(setSelectedSupplier(supplier));
    navigate('/add-supplier', { state: { supplier } });
  };

  // New function to open percentage modal
  const handleUpdatePercentage = (supplier: ISupplier) => {
    setSelectedSupplierForPercentage(supplier);
  };

  // Close modal function
  const handleCloseModal = () => {
    setSelectedSupplierForPercentage(null);
  };

  // Refresh suppliers after successful update
  const handlePercentageUpdateSuccess = () => {
    loadSuppliers();
  };

  const handleToggleStatus = async (supplier: ISupplier) => {
    try {
      const newStatus = supplier.status === 1 ? 0 : 1;
      const result = await dispatch(changeSupplierStatus({
        supplier_id: supplier.id,
        data: { status: newStatus }
      }));

      if (changeSupplierStatus.fulfilled.match(result)) {
        successAlert(t(newStatus === 1 ? 'supplierActivated' : 'supplierDeactivated'));
        loadSuppliers();
      }
    } catch (error) {
      errorAlert(t('statusUpdateFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete();
    if (confirmed) {
      try {
        const result = await dispatch(deleteSupplier(id));
        if (deleteSupplier.fulfilled.match(result)) {
          successAlert(t('supplierDeleted'));
          loadSuppliers();
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
        <h1 className="text-xl font-bold text-foreground">{t('suppliers')}</h1>
        <Link
          to="/add-supplier"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-card-primary text-primary-foreground font-medium text-sm shadow-gradient hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t('addSupplier')}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-2xl border p-4">
        <input
          type="text"
          placeholder={t('searchSuppliers')}
          value={search}
          onChange={handleSearch}
          className="w-full px-4 py-2 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* Suppliers List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground">{t('noSuppliers')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {suppliers.map((supplier: ISupplier, i: number) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {supplier.company}
                    </div>
                  </div>
                  {getStatusBadge(supplier.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {supplier.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    {supplier.bonus_percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(supplier)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('view')}
                  </button>
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t('edit')}
                  </button>
                  {/* New Update Percentage Button */}
                  <button
                    onClick={() => handleUpdatePercentage(supplier)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    {t('updateBonus')}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleToggleStatus(supplier)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      supplier.status === 1
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {supplier.status === 1 ? t('disable') : t('activate')}
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
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
      {selectedSupplierForPercentage && (
        <UpdatePercentageModal
          supplier={selectedSupplierForPercentage}
          onClose={handleCloseModal}
          onSuccess={handlePercentageUpdateSuccess}
        />
      )}
    </div>
  );
};

export default SuppliersPage;