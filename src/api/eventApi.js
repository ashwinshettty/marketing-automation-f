import authApi from './authAxios';

const unwrap = (response) => response.data;

const buildEventParams = ({
  page,
  limit,
  studentId,
  search,
  type,
  status,
  priority,
  salesuser,
} = {}) => {
  const params = {};

  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (studentId) params.studentId = studentId;
  if (search?.trim()) params.search = search.trim();
  if (type) params.type = type;
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (salesuser) params.salesuser = salesuser;

  return params;
};

export const createEvent = async (payload) => {
  const response = await authApi.post('/events', payload);
  return unwrap(response);
};

export const fetchEvents = async (options = {}) => {
  const response = await authApi.get('/events', {
    params: buildEventParams(options),
  });
  return unwrap(response);
};

export const updateEvent = async (eventId, payload) => {
  const response = await authApi.put(`/events/${eventId}`, payload);
  return unwrap(response);
};

export const deleteEvent = async (eventId) => {
  const response = await authApi.delete(`/events/${eventId}`);
  return unwrap(response);
};

export const createActionItem = createEvent;
export const fetchActionItems = fetchEvents;
