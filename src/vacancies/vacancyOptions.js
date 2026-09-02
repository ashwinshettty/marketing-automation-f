export const EMPTY_VACANCY_FILTERS = {
  search: '',
  status: '',
  department: '',
  roleType: '',
  employmentType: '',
};

export const VACANCY_DEPARTMENT_OPTIONS = [
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Other', label: 'Other' },
];

export const VACANCY_ROLE_OPTIONS = [
  { value: 'teaching', label: 'Teaching' },
  { value: 'non-teaching', label: 'Non-teaching' },
];

export const VACANCY_EMPLOYMENT_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const VACANCY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
];

export const emptyVacancyForm = () => ({
  title: '',
  department: 'Teaching',
  roleType: 'teaching',
  location: '',
  employmentType: 'full-time',
  positionsOpen: 1,
  status: 'open',
  jd: '',
  requirements: '',
  experience: '',
  subjects: '',
  applyEmail: 'contact@inkstall.com',
  applyNotes: '',
});

export const vacancyToForm = (vacancy) => ({
  ...emptyVacancyForm(),
  title: vacancy?.title || '',
  department: vacancy?.department || 'Teaching',
  roleType: vacancy?.roleType || 'teaching',
  location: vacancy?.location || '',
  employmentType: vacancy?.employmentType || 'full-time',
  positionsOpen: Math.max(1, Number(vacancy?.positionsOpen) || 1),
  status: vacancy?.status || 'open',
  jd: vacancy?.jd || '',
  requirements: vacancy?.requirements || '',
  experience: vacancy?.experience || '',
  subjects: vacancy?.subjects || '',
  applyEmail: vacancy?.applyEmail || 'contact@inkstall.com',
  applyNotes: vacancy?.applyNotes || '',
});
