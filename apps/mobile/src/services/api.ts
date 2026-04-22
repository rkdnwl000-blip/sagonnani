import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: JWT 토큰 자동 첨부
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || '오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  },
);

// ===== Auth =====
export const authApi = {
  registerUser: (data: any) => apiClient.post('/auth/user/register', data),
  loginUser: (data: any) => apiClient.post('/auth/user/login', data),
  updateFcmToken: (fcmToken: string) => apiClient.patch('/auth/fcm-token', { fcmToken }),
};

// ===== 대차 요청 =====
export const requestsApi = {
  create: (data: any) => apiClient.post('/requests', data),
  getMy: () => apiClient.get('/requests/my'),
  getOne: (id: string) => apiClient.get(`/requests/${id}`),
  cancel: (id: string) => apiClient.patch(`/requests/${id}/cancel`),
  markReturned: (id: string) => apiClient.patch(`/requests/${id}/returned`),
};

// ===== 견적 =====
export const quotesApi = {
  accept: (quoteId: string) => apiClient.patch(`/quotes/${quoteId}/accept`),
};

// ===== 사진 =====
export const photosApi = {
  getUploadUrl: (requestId: string, angle: string, phase: string) =>
    apiClient.get(`/requests/${requestId}/photos/upload-url`, { params: { angle, phase } }),
  saveRecord: (requestId: string, data: { angle: string; phase: string; url: string }) =>
    apiClient.post(`/requests/${requestId}/photos`, data),
  getPhotos: (requestId: string) => apiClient.get(`/requests/${requestId}/photos`),
};
