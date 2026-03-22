import api from './axios';

export interface Expense {
  id: string;
  userId: string;
  logEntryId?: string;
  expenseDate: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl?: string;
  createdAt: string;
  logEntry?: { title: string };
}

export const getExpenses = async (
  month?: number,
  year?: number,
  category?: string
): Promise<Expense[]> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  if (category) params.category = category;
  const res = await api.get('/expenses', { params });
  return res.data;
};

export const createExpense = async (data: FormData): Promise<Expense> => {
  const res = await api.post('/expenses', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateExpense = async (
  id: string,
  data: FormData
): Promise<Expense> => {
  const res = await api.put(`/expenses/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};