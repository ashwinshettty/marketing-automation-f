import axios from 'axios';
import { getAuthSession } from '../utils/authStorage';
import { applyApiAuthFailure } from '../utils/apiAuthFailure';

const api = axios.create({
  baseURL: import.meta.env.VITE_INKSTALL_BACKEND_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const { token } = getAuthSession();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      applyApiAuthFailure({ status });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    const apiError = new Error(message);
    apiError.details = error.response?.data;
    apiError.status = status;

    return Promise.reject(apiError);
  },
);

export default api;
