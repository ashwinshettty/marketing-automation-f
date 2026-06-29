import api from './axios';

const unwrap = (response) => response.data;

const buildFilterParams = (filters = {}) => {
  const params = {};

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.grade) {
    params.grade = filters.grade;
  }

  if (filters.board) {
    params.board = filters.board;
  }

  if (filters.source?.trim()) {
    params.source = filters.source.trim();
  }

  return params;
};

export const fetchLeadManagerStudents = async ({
  page = 1,
  limit = 10,
  signal,
  filters = {},
} = {}) => {
  const response = await api.get('/students/lead-manager', {
    params: {
      page,
      limit,
      ...buildFilterParams(filters),
    },
    signal,
  });
  return unwrap(response);
};

export const fetchStudentById = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return unwrap(response);
};

export const updateStudent = async (studentId, payload) => {
  const response = await api.put(`/students/${studentId}`, payload);
  return unwrap(response);
};
