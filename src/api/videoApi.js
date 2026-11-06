import axios from 'axios';
import { getAuthSession } from '../utils/authStorage';

const videoClient = axios.create({
  baseURL:
    import.meta.env.VITE_MARKETING_AUTOMATION_API_URL ||
    'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

videoClient.interceptors.request.use((config) => {
  const { token } = getAuthSession();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

videoClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    const wrapped = new Error(body?.message || error.message || 'Video planning failed');
    wrapped.body = body;
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  },
);

/**
 * Central video entry (intent router → ads | lesson).
 * Does not invoke Seedance.
 */
export const createVideoRequest = async (body) => {
  const response = await videoClient.post('/video/requests', body);
  return response.data;
};
