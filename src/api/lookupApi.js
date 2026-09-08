import authApi from './authAxios';

export const fetchBoards = async () => {
  const { data } = await authApi.get('/lookups/boards');
  return Array.isArray(data) ? data : [];
};

export const fetchGrades = async () => {
  const { data } = await authApi.get('/lookups/grades');

  if (Array.isArray(data)) {
    // Shape A: [{ grades: ['1','2',...] }]
    if (data[0]?.grades && Array.isArray(data[0].grades)) {
      return data[0].grades.filter(Boolean);
    }
    // Shape B: ['1','2'] or [{ name: '1' }]
    return data
      .map((item) => (typeof item === 'string' ? item : item?.name || item?.grade))
      .filter(Boolean);
  }

  if (Array.isArray(data?.grades)) {
    return data.grades.filter(Boolean);
  }

  return [];
};

export const fetchCounsellors = async () => {
  const { data } = await authApi.get('/lookups/counsellors');

  if (!data?.success) {
    return [];
  }

  const users = Array.isArray(data.users) ? data.users : [];

  return users.map((user) => ({
    id: user._id,
    name: user.name,
  }));
};
