import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({ baseURL: API_URL });

let token: string | null = null;

export const setToken = (t: string) => {
  token = t;
  if (typeof window !== 'undefined') localStorage.setItem('admin_token', t);
};

export const getToken = () => {
  if (token) return token;
  if (typeof window !== 'undefined') return localStorage.getItem('admin_token');
  return null;
};

apiClient.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard').then((r) => r.data),
  getCompanies: (status?: string) =>
    apiClient.get('/admin/companies', { params: { status } }).then((r) => r.data),
  approveCompany: (id: string) => apiClient.patch(`/admin/companies/${id}/approve`).then((r) => r.data),
  suspendCompany: (id: string) => apiClient.patch(`/admin/companies/${id}/suspend`).then((r) => r.data),
  chargeCommission: (id: string, amount: number) =>
    apiClient.post(`/admin/companies/${id}/charge`, { amount }).then((r) => r.data),
  getRequests: (status?: string) =>
    apiClient.get('/admin/requests', { params: { status } }).then((r) => r.data),
};

export const authApi = {
  loginUser: (data: any) => apiClient.post('/auth/user/login', data).then((r) => r.data),
};
