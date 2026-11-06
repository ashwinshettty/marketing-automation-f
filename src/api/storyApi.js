import axios from 'axios';
import { getAuthSession } from '../utils/authStorage';

const storyClient = axios.create({
  baseURL:
    import.meta.env.VITE_MARKETING_AUTOMATION_API_URL ||
    'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

storyClient.interceptors.request.use((config) => {
  const { token } = getAuthSession();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

storyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    const wrapped = new Error(body?.message || error.message || 'Story planning failed');
    wrapped.body = body;
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  },
);

export const planStoryScene = async (body) => {
  const response = await storyClient.post('/story/plans', body);
  return response.data;
};

export const uploadStoryAsset = async ({ file, type, seriesId, provenance }) => {
  const body = new FormData();
  body.append('file', file);
  body.append('type', type);
  if (seriesId) body.append('seriesId', seriesId);
  if (provenance) body.append('provenance', provenance);
  const { token } = getAuthSession();
  try {
    const response = await axios.post(`${storyClient.defaults.baseURL}/story/assets/upload`, body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    const payload = error.response?.data;
    const wrapped = new Error(payload?.message || error.message || 'The reference file could not be stored.');
    wrapped.body = payload;
    wrapped.status = error.response?.status;
    throw wrapped;
  }
};

export const approveStoryPlan = async (sceneId) => {
  const response = await storyClient.post(`/story/plans/${sceneId}/approve`);
  return response.data;
};

export const fetchStorySeries = async (seriesId) => {
  const response = await storyClient.get(`/story/series/${seriesId}`);
  return response.data;
};
