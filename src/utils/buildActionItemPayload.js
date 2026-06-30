export const buildActionItemPayload = (lead, form) => ({
  title: form.title.trim(),
  type: form.type,
  date: form.date,
  time: form.time,
  priority: form.priority,
  status: form.status,
  studentName: lead?.name && lead.name !== '-' ? lead.name : undefined,
  studentId: lead?.id || undefined,
  location: form.location.trim(),
  description: form.description.trim(),
  salesuser: form.salesuser || undefined,
});
