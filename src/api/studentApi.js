import api from './axios';

const unwrap = (response) => response.data;

export const fetchLeadManagerStudents = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get('/students/lead-manager', {
    params: { page, limit },
  });
  return unwrap(response);
};

export const updateStudent = async (studentId, payload) => {
  const response = await api.put(`/students/${studentId}`, payload);
  return unwrap(response);
};
