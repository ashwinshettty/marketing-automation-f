export const EMPTY_EVENT_FILTERS = {
    search: '',
    type: '',
    status: '',
    priority: '',
    salesuser: '',
  };
  
  export const EVENT_FILTER_TYPE_OPTIONS = [
    { value: '', label: 'All types' },
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
  
  export const EVENT_FILTER_STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];
  
  export const EVENT_FILTER_PRIORITY_OPTIONS = [
    { value: '', label: 'All priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];
  