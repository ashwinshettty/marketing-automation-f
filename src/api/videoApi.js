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
 * When VIDEO_GENERATION_ENABLED on the backend, may return GENERATING and a requestId to poll.
 */
export const createVideoRequest = async (body) => {
  const response = await videoClient.post('/video/requests', body);
  return response.data;
};

export const getVideoRequest = async (requestId) => {
  const response = await videoClient.get(`/video/requests/${requestId}`);
  return response.data;
};

/** Most recent SUCCEEDED video request for the signed-in user (for player restore). */
export const getLatestSucceededVideoRequest = async () => {
  const response = await videoClient.get('/video/requests/latest-succeeded');
  return response.data;
};

/** Up to N recent SUCCEEDED video requests for the gallery strip. */
export const getRecentSucceededVideoRequests = async (limit = 3) => {
  const response = await videoClient.get('/video/requests/recent-succeeded', {
    params: { limit },
  });
  return response.data;
};

/**
 * Authenticated MP4 download — use blob URL for <video> (Bearer cannot be sent via src=).
 */
export const fetchVideoBlob = async (requestId) => {
  const response = await videoClient.get(`/video/requests/${requestId}/video`, {
    responseType: 'blob',
  });
  return response.data;
};

const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'NOT_INVOKED']);

/**
 * Poll until generation reaches a terminal status.
 */
export const pollVideoRequest = async (
  requestId,
  {
    intervalMs = 4000,
    maxAttempts = 90,
    onUpdate = null,
  } = {},
) => {
  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    last = await getVideoRequest(requestId);
    const status = last?.generationStatus
      || last?.data?.request?.generationStatus
      || 'NOT_INVOKED';
    if (typeof onUpdate === 'function') onUpdate(last, attempt);
    if (TERMINAL.has(status)) return last;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return last;
};
