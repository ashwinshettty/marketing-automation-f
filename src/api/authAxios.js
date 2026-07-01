import axios from 'axios';
import { clearAuthSession, getAuthSession } from '../utils/authStorage';

const authApi = axios.create({
  baseURL:
    import.meta.env.VITE_MARKETING_AUTOMATION_API_URL ||
    'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.request.use((config) => {
  const { token } = getAuthSession();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  },
);

export default authApi;
