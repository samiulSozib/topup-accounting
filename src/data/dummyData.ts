export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  bonusPercentage: number;
  status: 'active' | 'inactive';
}

export interface Reseller {
  id: string;
  name: string;
  phone: string;
  city: string;
  bonusPercentage: number;
  creditLimit: number;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  partyName: string;
  type: 'purchase' | 'sale' | 'supplier_payment' | 'reseller_payment';
  debit: number;
  credit: number;
  balance: number;
  date: string;
}

export const suppliers: Supplier[] = [
  { id: '1', name: 'Ahmad Khan', company: 'Roshan Telecom', phone: '+93 700 123456', bonusPercentage: 3.5, status: 'active' },
  { id: '2', name: 'Mohammad Ali', company: 'MTN Afghanistan', phone: '+93 770 654321', bonusPercentage: 4.0, status: 'active' },
  { id: '3', name: 'Farid Stanikzai', company: 'Etisalat AF', phone: '+93 780 111222', bonusPercentage: 3.0, status: 'inactive' },
];

export const resellers: Reseller[] = [
  { id: '1', name: 'Kabul Mobile Shop', phone: '+93 700 111000', city: 'Kabul', bonusPercentage: 2.0, creditLimit: 50000, status: 'active' },
  { id: '2', name: 'Herat Telecom', phone: '+93 770 222000', city: 'Herat', bonusPercentage: 2.5, creditLimit: 75000, status: 'active' },
  { id: '3', name: 'Mazar Telecom', phone: '+93 780 333000', city: 'Mazar-i-Sharif', bonusPercentage: 2.0, creditLimit: 60000, status: 'active' },
];

export const transactions: Transaction[] = [
  { id: '1', partyName: 'Roshan Telecom', type: 'purchase', debit: 100000, credit: 0, balance: -100000, date: '2026-03-10' },
  { id: '2', partyName: 'Kabul Mobile Shop', type: 'sale', debit: 0, credit: 45000, balance: -55000, date: '2026-03-10' },
  { id: '3', partyName: 'Herat Telecom', type: 'sale', debit: 0, credit: 35000, balance: -20000, date: '2026-03-09' },
  { id: '4', partyName: 'Roshan Telecom', type: 'supplier_payment', debit: 0, credit: 50000, balance: 30000, date: '2026-03-09' },
  { id: '5', partyName: 'Mazar Telecom', type: 'sale', debit: 0, credit: 25000, balance: 55000, date: '2026-03-08' },
  { id: '6', partyName: 'MTN Afghanistan', type: 'purchase', debit: 80000, credit: 0, balance: -25000, date: '2026-03-08' },
  { id: '7', partyName: 'Kabul Mobile Shop', type: 'reseller_payment', debit: 20000, credit: 0, balance: -45000, date: '2026-03-07' },
  { id: '8', partyName: 'Herat Telecom', type: 'sale', debit: 0, credit: 30000, balance: -15000, date: '2026-03-07' },
];

export const monthlyData = [
  { month: 'Jan', purchase: 320000, sales: 380000, profit: 60000 },
  { month: 'Feb', purchase: 280000, sales: 350000, profit: 70000 },
  { month: 'Mar', purchase: 400000, sales: 460000, profit: 60000 },
  { month: 'Apr', purchase: 350000, sales: 420000, profit: 70000 },
  { month: 'May', purchase: 380000, sales: 450000, profit: 70000 },
  { month: 'Jun', purchase: 420000, sales: 500000, profit: 80000 },
];
