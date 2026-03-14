// types/statistics.types.ts

export interface ProfitAnalysis {
  total: {
    revenue: number;
    cost: number;
    profit: number;
    profit_margin: string;
  };
  today: {
    revenue: number;
    cost: number;
    profit: number;
    profit_margin: string;
  };
}

export interface BonusAnalysis {
  total_bonus_received: number;
  total_bonus_given: number;
  net_bonus_impact: number;
}

export interface DueAnalysis {
  total_supplier_due: number;
  total_reseller_due: number;
  net_receivable: number;
}

export interface ProfitStatisticsResponse {
  success: boolean;
  profit_analysis: ProfitAnalysis;
  bonus_analysis: BonusAnalysis;
  due_analysis: DueAnalysis;
  supplier_breakdown: Array<{
    id: number;
    name: string;
    total_purchases: number;
    total_payments: number;
    total_due: number;
  }>;
  reseller_breakdown: Array<{
    id: number;
    name: string;
    total_sales: number;
    total_received: number;
    total_due: number;
  }>;
}

export interface DashboardSummary {
  suppliers: {
    total_suppliers: number;
    total_purchases: number;
    total_paid_to_suppliers: number;
    total_supplier_due: number;
    total_stock: number;
  };
  resellers: {
    total_resellers: number;
    total_sales: number;
    total_received_from_resellers: number;
    total_reseller_due: number;
  };
  today: {
    purchases: number;
    sales: number;
    payments_to_suppliers: number;
    payments_from_resellers: number;
  };
}

export interface DashboardSummaryResponse {
  success: boolean;
  summary: DashboardSummary;
}