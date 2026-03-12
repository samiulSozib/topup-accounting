import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import SuppliersPage from "@/pages/SuppliersPage";
import ResellersPage from "@/pages/ResellersPage";
import AddSupplierPage from "@/pages/AddSupplierPage";
import AddResellerPage from "@/pages/AddResellerPage";
import BuyTopupPage from "@/pages/BuyTopupPage";
import SellTopupPage from "@/pages/SellTopupPage";
import TransactionsPage from "@/pages/TransactionsPage";
import SupplierLedgerPage from "@/pages/SupplierLedgerPage";
import ResellerLedgerPage from "@/pages/ResellerLedgerPage";
import ReportsPage from "@/pages/ReportsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import NotFound from "@/pages/NotFound";
import AuthGuard from "./components/authGuard";
import PublicGuard from "./components/PublicGuard";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes - with PublicGuard to prevent access when logged in */}
              <Route path="/login" element={
                <PublicGuard>
                  <LoginPage />
                </PublicGuard>
              } />
              <Route path="/register" element={
                <PublicGuard>
                  <RegisterPage />
                </PublicGuard>
              } />
              <Route path="/forgot-password" element={
                <PublicGuard>
                  <ForgotPasswordPage />
                </PublicGuard>
              } />
              
              {/* Protected Routes - with AuthGuard */}
              <Route element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }>
                <Route path="/" element={<HomePage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/resellers" element={<ResellersPage />} />
                <Route path="/add-supplier" element={<AddSupplierPage />} />
                <Route path="/add-reseller" element={<AddResellerPage />} />
                <Route path="/buy-topup" element={<BuyTopupPage />} />
                <Route path="/sell-topup" element={<SellTopupPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/supplier-ledger" element={<SupplierLedgerPage />} />
                <Route path="/reseller-ledger" element={<ResellerLedgerPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;