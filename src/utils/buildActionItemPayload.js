export const buildActionItemPayload = (lead, form) => ({
    title: form.title.trim(),
    type: form.type,
    date: form.date,
    time: form.time,
    priority: form.priority,
    status: form.status,
    urgency: form.urgency,
    studentName: form.studentName.trim(),
    studentId: lead?.id || undefined,
    contactNumber: form.contactNumber.trim(),
    contactName: form.contactName.trim(),
    contactType: form.contactType,
    location: form.location.trim(),
    description: form.description.trim(),
    salesuser: form.salesuser || undefined,
  });
  