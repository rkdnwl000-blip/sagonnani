import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({ baseURL: API_URL, timeout: 10000 });

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('company_auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || '오류가 발생했습니다.')),
);

export const authApi = {
  login: (data: any) => apiClient.post('/auth/company/login', data),
  register: (data: any) => apiClient.post('/auth/company/register', data),
  updateFcmToken: (fcmToken: string) => apiClient.patch('/auth/fcm-token', { fcmToken }),
};

export const requestsApi = {
  getAvailable: (category?: string) => apiClient.get('/requests/available', { params: { category } }),
  getOne: (id: string) => apiClient.get(`/requests/${id}`),
  confirmDelivery: (id: string) => apiClient.patch(`/requests/${id}/delivery`),
};

export const quotesApi = {
  create: (requestId: string, data: any) => apiClient.post(`/requests/${requestId}/quotes`, data),
};

export const vehiclesApi = {
  getMy: () => apiClient.get('/vehicles/my'),
  create: (data: any) => apiClient.post('/vehicles', data),
  update: (id: string, data: any) => apiClient.patch(`/vehicles/${id}`, data),
  remove: (id: string) => apiClient.delete(`/vehicles/${id}`),
};

export const companyApi = {
  getProfile: () => apiClient.get('/companies/me'),
  getTransactions: () => apiClient.get('/companies/me/transactions'),
  getMyQuotes: () => apiClient.get('/companies/me/quotes'),
};

export const paymentsApi = {
  prepare: (amount: number) => apiClient.post('/payments/prepare', { amount }),
  confirm: (data: { paymentKey: string; orderId: string; amount: number }) =>
    apiClient.post('/payments/confirm', data),
};
