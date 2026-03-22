import api from './axios';

export interface MonthlyReport {
  month: number;
  year: number;
  totalHours: number;
  totalSpent: number;
  entriesCount: number;
  byCategory: { category: string; count: number; hours: number }[];
  expensesByCategory: { category: string; total: number; count: number }[];
  entries: any[];
  expenses: any[];
}

export interface DashboardStats {
  thisMonth: {
    entriesCount: number;
    totalHours: number;
    totalSpent: number;
  };
  lastMonth: {
    totalSpent: number;
  };
  recentEntries: any[];
  last30DaysExpenses: any[];
}

export const getMonthlyReport = async (
  month: number,
  year: number
): Promise<MonthlyReport> => {
  const res = await api.get('/reports/monthly', { params: { month, year } });
  return res.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/reports/dashboard');
  return res.data;
};