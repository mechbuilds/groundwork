import api from './axios';

export interface LogEntry {
  id: string;
  userId: string;
  entryDate: string;
  title: string;
  description: string;
  category: string;
  durationHours: number;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  expenses?: any[];
}

export const getEntries = async (month?: number, year?: number): Promise<LogEntry[]> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const res = await api.get('/entries', { params });
  return res.data;
};

export const getEntry = async (id: string): Promise<LogEntry> => {
  const res = await api.get(`/entries/${id}`);
  return res.data;
};

export const createEntry = async (data: FormData): Promise<LogEntry> => {
  const res = await api.post('/entries', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateEntry = async (id: string, data: FormData): Promise<LogEntry> => {
  const res = await api.put(`/entries/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteEntry = async (id: string): Promise<void> => {
  await api.delete(`/entries/${id}`);
};