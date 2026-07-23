import authApi from './authAxios';

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

  if (filters.type) {
    params.type = filters.type;
  }

  return params;
};

export const fetchLeadManagerStudents = async ({
  page = 1,
  limit = 10,
  signal,
  filters = {},
} = {}) => {
  const response = await authApi.get('/leads', {
    params: {
      page,
      limit,
      ...buildFilterParams(filters),
    },
    signal,
  });
  return unwrap(response);
};

export const fetchStudentById = async (studentId, { type } = {}) => {
  const response = await authApi.get(`/leads/${studentId}`, {
    params: type ? { type } : undefined,
  });
  return unwrap(response);
};

export const updateStudent = async (studentId, payload, { type } = {}) => {
  const response = await authApi.put(`/leads/${studentId}`, payload, {
    params: type || payload?.type ? { type: type || payload.type } : undefined,
  });
  return unwrap(response);
};
