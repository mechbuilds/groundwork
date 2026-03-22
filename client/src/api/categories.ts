import api from './axios';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  type: string;
  createdAt: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data;
};

export const createCategory = async (data: {
  name: string;
  color: string;
  icon: string;
  type: string;
}): Promise<Category> => {
  const res = await api.post('/categories', data);
  return res.data;
};

export const updateCategory = async (
  id: string,
  data: Partial<{ name: string; color: string; icon: string; type: string }>
): Promise<Category> => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};