// pages/SellTopupPage.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { fetchResellers, selectAllResellers } from '@/redux/slices/resellerSlice';
import { fetchSuppliers, selectAllSuppliers } from '@/redux/slices/supplierSlice';
import { sellTopupToReseller, selectTransactionsLoading, fetchCurrentStock } from '@/redux/slices/topUpTransactionSlice';
import { successAlert, errorAlert } from '@/util/alert';

const SellTopupPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const resellers = useAppSelector(selectAllResellers);
  const suppliers = useAppSelector(selectAllSuppliers);
  const isLoading = useAppSelector(selectTransactionsLoading);
  
  const [resellerId, setResellerId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (supplierId) {
      checkStock();
    } else {
      setAvailableStock(null);
      setBaseAmount('');
    }
  }, [supplierId]);

  const loadData = () => {
    dispatch(fetchResellers({ item_per_page: 100 }));
    dispatch(fetchSuppliers({ item_per_page: 100 }));
  };

  const checkStock = async () => {
    if (!supplierId) return;
    
    setCheckingStock(true);
    try {
      const result = await dispatch(fetchCurrentStock({ 
        supplier_id: parseInt(supplierId) 
      }));
      
      if (fetchCurrentStock.fulfilled.match(result)) {
        setAvailableStock(result.payload.stock);
      }
    } catch (error) {
      errorAlert(t('stockCheckFailed'));
    } finally {
      setCheckingStock(false);
    }
  };

  const selectedReseller = resellers.find(r => r.id === parseInt(resellerId));
  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const amount = parseFloat(baseAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const bonusAmount = selectedReseller ? amount * (selectedReseller.bonus_percentage / 100) : 0;
  const totalTopup = amount + bonusAmount; // What reseller receives
  const dueAmount = amount - paid; // What reseller owes me (based on base amount)

  // Handle base amount change with stock validation (compare totalTopup with availableStock)
  const handleBaseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value) || 0;
    const calculatedBonus = selectedReseller ? numValue * (selectedReseller.bonus_percentage / 100) : 0;
    const calculatedTotal = numValue + calculatedBonus;
    
    // If stock is available, don't allow totalTopup to exceed stock
    if (availableStock !== null && calculatedTotal > availableStock) {
      // Find maximum base amount that doesn't exceed stock
      let maxBase = availableStock;
      if (selectedReseller && selectedReseller.bonus_percentage > 0) {
        // Calculate max base amount based on stock
        // totalTopup = base + (base * bonus%) <= stock
        // base * (1 + bonus%) <= stock
        // base <= stock / (1 + bonus%)
        maxBase = availableStock / (1 + selectedReseller.bonus_percentage / 100);
      }
      setBaseAmount(maxBase.toFixed(2));
      errorAlert(t('amountExceedsStock').replace('{stock}', availableStock.toLocaleString()));
    } else {
      setBaseAmount(value);
    }
  };

  // Handle paid amount change
  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaidAmount(value);
  };

  const validateForm = () => {
    if (!resellerId) {
      errorAlert(t('selectResellerRequired'));
      return false;
    }
    if (!supplierId) {
      errorAlert(t('selectSupplierRequired'));
      return false;
    }
    if (!baseAmount || amount <= 0) {
      errorAlert(t('validAmountRequired'));
      return false;
    }
    if (paid < 0) {
      errorAlert(t('validPaidAmountRequired'));
      return false;
    }
    // Check if totalTopup exceeds available stock
    if (availableStock !== null && totalTopup > availableStock) {
      const message = t('insufficientStock').replace('{stock}', availableStock.toLocaleString());
      errorAlert(message);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(sellTopupToReseller({
        reseller_id: parseInt(resellerId),
        supplier_id: parseInt(supplierId),
        base_amount: amount,
        paid_amount: paid || 0,
        reference_no: reference || undefined,
        notes: notes || undefined
      }));

      if (sellTopupToReseller.fulfilled.match(result)) {
        successAlert(t('topupSold'));
        // Reset form
        setResellerId('');
        setSupplierId('');
        setBaseAmount('');
        setPaidAmount('');
        setReference('');
        setNotes('');
        setAvailableStock(null);
      }
    } catch (error) {
      errorAlert(t('operationFailed'));
    }
  };

  // Determine if totalTopup exceeds available stock
  const isStockExceeded = availableStock !== null && totalTopup > availableStock;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-card rounded-2xl border p-6 space-y-5"
      >
        <h1 className="text-xl font-bold text-foreground">{t('sellTopup')}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('selectReseller')} <span className="text-destructive">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={resellerId}
              onChange={e => setResellerId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">{t('selectReseller')}</option>
              {resellers
                .filter(r => r.status === 1)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.city} ({r.bonus_percentage}% {t('bonus')})
                  </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('selectSupplier')} <span className="text-destructive">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              disabled={isLoading || checkingStock}
            >
              <option value="">{t('selectSupplier')}</option>
              {suppliers
                .filter(s => s.status === 1)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.company} ({s.bonus_percentage}% {t('bonus')})
                  </option>
              ))}
            </select>
            {checkingStock && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t('checkingStock')}
              </p>
            )}
            {availableStock !== null && (
              <p className="text-xs font-medium mt-1">
                <span className="text-muted-foreground">{t('availableStock')}: </span>
                <span className="text-primary">{availableStock.toLocaleString()}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('baseAmount')} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
              <input 
                type="number"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50 ${
                  isStockExceeded ? 'border-destructive ring-destructive/30' : ''
                }`}
                value={baseAmount}
                onChange={handleBaseAmountChange}
                disabled={isLoading || !supplierId || checkingStock}
                placeholder="0.00"
              />
            </div>
            {availableStock !== null && (
              <p className="text-xs mt-1 flex justify-between">
                <span className="text-muted-foreground">{t('maxPossibleBase')}: {calculateMaxBase(availableStock, selectedReseller?.bonus_percentage || 0)}</span>
                {isStockExceeded && (
                  <span className="text-destructive font-medium">{t('exceedsStock')}</span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('paidAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
              <input 
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
                value={paidAmount}
                onChange={handlePaidAmountChange}
                disabled={isLoading || !baseAmount}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('referenceNumber')}
            </label>
            <input 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              value={reference}
              onChange={e => setReference(e.target.value)}
              disabled={isLoading}
              placeholder={t('referencePlaceholder')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('notes')}
            </label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border bg-secondary text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none h-20 disabled:opacity-50"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isLoading}
              placeholder={t('notesPlaceholder')}
            />
          </div>
        </div>
      </motion.div>

      {amount > 0 && selectedReseller && selectedSupplier && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className={`rounded-2xl p-5 text-primary-foreground shadow-gradient ${
            isStockExceeded ? 'bg-red-600' : 'gradient-card-accent'
          }`}
        >
          <h3 className="text-sm font-medium opacity-80 mb-3">{t('liveCalculation')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('baseAmount')} (Reseller pays)</span>
              <span>{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('bonus')} ({selectedReseller.bonus_percentage}%)</span>
              <span className="text-emerald-300">+{bonusAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="h-px bg-primary-foreground/20 my-1" />
            <div className="flex justify-between font-bold text-lg">
              <span>{t('totalTopup')} (Reseller receives)</span>
              <span>{totalTopup.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {paid > 0 && (
              <>
                <div className="flex justify-between text-sm text-emerald-300">
                  <span>{t('paidNow')}</span>
                  <span>-{paid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>{t('dueFromReseller')}</span>
                  <span className={dueAmount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                    {dueAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </>
            )}
            {availableStock !== null && (
              <div className={`text-xs mt-2 p-2 rounded-lg ${
                isStockExceeded 
                  ? 'bg-red-700/50 text-white' 
                  : 'bg-emerald-700/50 text-emerald-100'
              }`}>
                {isStockExceeded 
                  ? `⚠️ ${t('insufficientStockWarning')}`
                  : `✅ ${t('stockAfterSale')}: ${(availableStock - totalTopup).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`
                }
              </div>
            )}
          </div>
        </motion.div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={isLoading || checkingStock || isStockExceeded}
        className="w-full py-3.5 rounded-xl gradient-card-accent text-primary-foreground font-semibold shadow-gradient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t('processing')}
          </>
        ) : (
          t('confirmSale')
        )}
      </button>
    </div>
  );
};

// Helper function to calculate max base amount based on stock and bonus percentage
const calculateMaxBase = (stock: number, bonusPercentage: number): string => {
  const maxBase = stock / (1 + bonusPercentage / 100);
  return `${maxBase.toFixed(2)}`;
};

export default SellTopupPage;