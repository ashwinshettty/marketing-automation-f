import axios from 'axios';
import { getAuthSession } from '../utils/authStorage';
import { applyApiAuthFailure } from '../utils/apiAuthFailure';

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
    const status = error.response?.status;
    // Login/OTP endpoints may return 401 without an established session; still apply policy.
    if (status === 401 || status === 403) {
      applyApiAuthFailure({ status });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    const apiError = new Error(message);
    apiError.status = status;
    return Promise.reject(apiError);
  },
);

export default authApi;
