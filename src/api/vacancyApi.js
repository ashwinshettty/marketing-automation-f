import authApi from './authAxios';

const unwrap = (response) => response.data;

const buildParams = ({
  page,
  limit,
  search,
  status,
  department,
  roleType,
  employmentType,
} = {}) => {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (search?.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (department) params.department = department;
  if (roleType) params.roleType = roleType;
  if (employmentType) params.employmentType = employmentType;
  return params;
};

export const fetchVacancies = async (options = {}) => {
  const response = await authApi.get('/vacancies', { params: buildParams(options) });
  return unwrap(response);
};

export const createVacancy = async (payload) => {
  const response = await authApi.post('/vacancies', payload);
  return unwrap(response);
};

export const updateVacancy = async (vacancyId, payload) => {
  const response = await authApi.put(`/vacancies/${vacancyId}`, payload);
  return unwrap(response);
};

export const deleteVacancy = async (vacancyId) => {
  const response = await authApi.delete(`/vacancies/${vacancyId}`);
  return unwrap(response);
};

export const fetchVacancyApplications = async (vacancyId) => {
  const response = await authApi.get(`/vacancies/${vacancyId}/applications`);
  return unwrap(response);
};
