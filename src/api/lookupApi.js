import api from './axios';

export const fetchBoards = async () => {
  const { data } = await api.get('/boards');
  return Array.isArray(data) ? data : [];
};

export const fetchGrades = async () => {
  const { data } = await api.get('/grades');
  const gradesDoc = Array.isArray(data) ? data[0] : data;
  return Array.isArray(gradesDoc?.grades) ? gradesDoc.grades : [];
};

export const fetchCounsellors = async () => {
  const { data } = await api.get('/marketing/users');

  if (!data?.success) {
    return [];
  }

  const users = Array.isArray(data.users) ? data.users : [];

  return users.map((user) => ({
    id: user._id,
    name: user.name,
  }));
};
