export const buildStudentUpdatePayload = (lead, form) => {
  const raw = lead.rawStudent || {};

  const contactInformation = Array.isArray(raw.contactInformation)
    ? raw.contactInformation.map((contact) => ({ ...contact }))
    : [];

  if (contactInformation.length === 0) {
    contactInformation.push({
      number: form.contactNo,
      email: form.email,
      relation: 'self',
    });
  } else {
    contactInformation[0] = {
      ...contactInformation[0],
      number: form.contactNo,
      email: form.email,
    };
  }

  const parentIndex = contactInformation.findIndex(
    (contact) => contact.relation && contact.relation.toLowerCase() !== 'self',
  );

  if (form.parentName) {
    if (parentIndex >= 0) {
      contactInformation[parentIndex] = {
        ...contactInformation[parentIndex],
        relationName: form.parentName,
      };
    } else {
      contactInformation.push({
        relationName: form.parentName,
        relation: 'guardian',
        number: contactInformation[0]?.number || form.contactNo,
      });
    }
  }

  return {
    ...raw,
    studentName: form.name.trim(),
    grade: form.grade.trim(),
    board: form.board.trim(),
    source: form.source.trim(),
    contactInformation,
    address: {
      ...(raw.address || {}),
      city: form.city.trim(),
    },
    notes: form.notes.trim()
      ? [{ text: form.notes.trim() }]
      : raw.notes || [],
  };
};

export const leadToEditForm = (lead) => ({
  name: lead.name === '-' ? '' : lead.name,
  contactNo: lead.contactNo === '-' ? '' : lead.contactNo,
  email: lead.email === '-' ? '' : lead.email,
  grade: lead.grade === '-' ? '' : lead.grade,
  board: lead.board === '-' ? '' : lead.board,
  source: lead.source === '-' ? '' : lead.source,
  parentName: lead.parentName === '-' ? '' : lead.parentName,
  city: lead.city === '-' ? '' : lead.city,
  notes: lead.notes || '',
});
