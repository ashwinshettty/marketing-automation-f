import authApi from './authAxios';

const unwrap = (response) => response.data;

export const createUser = async (payload) => {
  const response = await authApi.post('/users/create', payload);
  return unwrap(response);
};

export const sendOtp = async (payload) => {
  const response = await authApi.post('/users/send-otp', payload);
  return unwrap(response);
};

export const loginWithPassword = async (payload) => {
  const response = await authApi.post('/users/login/password', payload);
  return unwrap(response);
};

export const loginWithOtp = async (payload) => {
  const response = await authApi.post('/users/login/otp', payload);
  return unwrap(response);
};
