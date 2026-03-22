import api from './axios';

export interface User {
  id: string;
  email: string;
  fullName: string;
  propertyName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const register = async (
  email: string,
  password: string,
  fullName: string,
  propertyName: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', {
    email,
    password,
    fullName,
    propertyName,
  });
  return res.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data;
};