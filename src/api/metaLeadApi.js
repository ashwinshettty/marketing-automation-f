import authApi from './authAxios';

/** POST sync-leads — pull Meta Instant Form leads into the CRM store. */
export const syncMetaLeads = async (body = {}) => {
  const response = await authApi.post('/meta-leads/sync', body);
  return response.data;
};

/** GET import-leads — list stored Meta leads. */
export const importMetaLeads = async (params = {}, signal) => {
  const response = await authApi.get('/meta-leads', { params, signal });
  return response.data;
};

/** GET fetch-individual-lead — one stored Meta lead. */
export const fetchMetaLead = async (id) => {
  const response = await authApi.get(`/meta-leads/${id}`);
  return response.data;
};
