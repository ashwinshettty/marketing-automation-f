export const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'Select Event Type' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'calls', label: 'Calls' },
  { value: 'branch visit', label: 'Branch Visit' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo lecture', label: 'Demo Lecture' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'payments', label: 'Payments' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'other', label: 'Other' },
];

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const URGENCY_OPTIONS = [
  { value: 'soon', label: 'Soon' },
  { value: 'later', label: 'Later' },
  { value: 'schedule', label: 'Schedule' },
];

export const CONTACT_TYPE_OPTIONS = [
  { value: 'Phone', label: 'Phone' },
  { value: 'In-person', label: 'In Person' },
  { value: 'Video', label: 'Video' },
  { value: 'Email', label: 'Email' },
];

export const buildActionItemFormFromLead = () => ({
  title: '',
  type: '',
  date: '',
  time: '',
  priority: 'medium',
  status: 'pending',
  salesuser: '',
  location: '',
  description: '',
});
