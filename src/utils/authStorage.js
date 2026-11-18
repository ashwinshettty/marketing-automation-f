import { evaluateSession } from './authSessionPolicy.js';

const AUTH_KEYS = ['token', '_id', 'role', 'username'];

export const saveAuthSession = ({ token, id, role, username }) => {
  if (token) localStorage.setItem('token', token);
  if (id) localStorage.setItem('_id', id);
  if (role) localStorage.setItem('role', role);
  if (username) localStorage.setItem('username', username);
};

export const getAuthSession = () => ({
  token: localStorage.getItem('token'),
  _id: localStorage.getItem('_id'),
  role: localStorage.getItem('role'),
  username: localStorage.getItem('username'),
});

export const isAuthenticated = (nowMs = Date.now()) => {
  const session = getAuthSession();
  const evaluation = evaluateSession(
    { token: session.token, id: session._id },
    nowMs,
  );
  return evaluation.authenticated;
};

export const getSessionEvaluation = (nowMs = Date.now()) => {
  const session = getAuthSession();
  return evaluateSession({ token: session.token, id: session._id }, nowMs);
};

export const clearAuthSession = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};
