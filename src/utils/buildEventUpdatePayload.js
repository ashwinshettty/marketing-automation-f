export const buildEventUpdatePayload = (form) => ({
  title: form.title.trim(),
  type: form.type,
  date: form.date,
  time: form.time,
  priority: form.priority,
  status: form.status,
  location: form.location.trim(),
  description: form.description.trim(),
  salesuser: form.salesuser || undefined,
});

export const eventToEditForm = (event) => {
  const salesuserId = event?.salesuser?._id || event?.salesuser || '';

  return {
    title: event?.title || '',
    type: event?.type || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 10) : '',
    time: event?.time || '',
    priority: event?.priority || 'medium',
    status: event?.status || 'pending',
    salesuser: salesuserId ? String(salesuserId) : '',
    location: event?.location || '',
    description: event?.description || '',
  };
};
