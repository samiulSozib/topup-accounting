// types/statistics.types.ts

// ==================== PROFIT ANALYSIS TYPES ====================

export interface ProfitAnalysis {
  total_revenue: string;
  total_cost_of_goods_sold: string;
  total_profit: string;
  profit_margin_percentage: string;
  average_cost_per_unit: string;
  average_selling_price_per_unit: string;
  profit_per_unit: string;
  remaining_stock_units: string;
  remaining_stock_value: string;
  potential_profit_from_remaining: string;
  total_purchase_batches: number;
  total_sales_transactions: number;
}

export interface BonusAnalysis {
  total_bonus_given: string;
}

export interface DueAnalysis {
  total_supplier_due: string;
  total_reseller_due: string;
  amount_remaining_to_collect: string;
}

// ==================== TOPUP SUMMARY TYPES ====================

export interface TopupSummary {
  total_money_spent_on_purchases: string;
  total_quantity_purchased: string;
  total_money_received_from_sales: string;
  total_quantity_sold: string;
  total_bonus_given_to_resellers: string;
  current_stock_quantity: string;
  current_stock_value: string;
  profit_analysis: ProfitAnalysis;
}

// ==================== SUPPLIER TYPES ====================

export interface SupplierSummary {
  total_suppliers: number;
  total_purchases_amount: string;
  total_paid_to_suppliers: string;
  total_supplier_due: string;
  total_stock_value: string;
  active_suppliers: number;
  inactive_suppliers: number;
}

// ==================== RESELLER TYPES ====================

export interface ResellerSummary {
  total_resellers: number;
  total_sales_amount: string;
  total_received_from_resellers: string;
  total_reseller_due: string;
  active_resellers: number;
  inactive_resellers: number;
  amount_remaining_to_collect: string;
}

// ==================== TODAY'S SUMMARY TYPES ====================

export interface TodayPurchases {
  money_spent: string;
  quantity_purchased: string;
}

export interface TodaySales {
  money_received: string;
  quantity_sold: string;
  bonus_given: string;
}

export interface TodayProfit {
  total_profit: string;
  profit_margin: string;
}

export interface TodaySummary {
  date: string;
  purchases: TodayPurchases;
  sales: TodaySales;
  profit: TodayProfit;
}

// ==================== FILTERS TYPES ====================

export interface DashboardFilters {
  start_date: string | null;
  end_date: string | null;
}

// ==================== MAIN DASHBOARD SUMMARY TYPES ====================

export interface DashboardSummary {
  filters: DashboardFilters;
  suppliers: SupplierSummary;
  resellers: ResellerSummary;
  topup_summary: TopupSummary;
  today: TodaySummary;
}

export interface DashboardSummaryResponse {
  success: boolean;
  summary: DashboardSummary;
}

// ==================== PROFIT REPORT TYPES ====================

export interface ProfitReportData {
  period: {
    start_date: string;
    end_date: string;
  };
  total_revenue: string;
  total_cost: string;
  total_profit: string;
  profit_margin: string;
  remaining_stock_units: string;
  remaining_stock_value: string;
  total_sales: number;
  total_purchases: number;
}

export interface ProfitReportResponse {
  success: boolean;
  data: ProfitReportData;
}
