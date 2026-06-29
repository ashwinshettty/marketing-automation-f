const formatPhone = (phone) => {
  if (!phone) return '-';

  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return phone;
};

const formatStatus = (status) => {
  if (!status) return '-';

  const normalized = String(status).toLowerCase();
  if (normalized === 'admissiondue') return 'Admission Due';

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatDate = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getPrimaryContact = (student) => student.contactInformation?.[0] || null;

const mapNotesList = (notes) => {
  if (Array.isArray(notes)) {
    return notes
      .filter((note) => note?.text?.trim())
      .map((note) => ({
        id: String(note._id || note.id || ''),
        text: note.text.trim(),
        createdAt: formatDate(note.createdAt),
        status: note.status || '',
      }));
  }

  if (typeof notes === 'string' && notes.trim()) {
    return [{ id: 'legacy', text: notes.trim(), createdAt: '', status: '' }];
  }

  return [];
};

export const getLeadNotesList = (lead) => {
  if (!lead) return [];

  if (lead.notesList?.length > 0) {
    return lead.notesList;
  }

  const fromRawStudent = mapNotesList(lead.rawStudent?.notes);
  if (fromRawStudent.length > 0) {
    return fromRawStudent;
  }

  if (lead.notes?.trim()) {
    return [{ id: 'primary', text: lead.notes.trim(), createdAt: '', status: '' }];
  }

  return [];
};

export const mapStudentToLead = (student) => {
  const primaryContact = getPrimaryContact(student);
  const parentContact =
    student.contactInformation?.find(
      (contact) => contact.relation && contact.relation.toLowerCase() !== 'self',
    ) || primaryContact;

  return {
    id: String(student._id),
    name: student.studentName || '-',
    contactNo: formatPhone(primaryContact?.number || student.phone),
    grade: student.grade || '-',
    board: student.board || '-',
    source: student.source || '-',
    email: primaryContact?.email || '-',
    parentName: parentContact?.relationName || '-',
    city: student.address?.city || '-',
    status: formatStatus(student.status),
    createdAt: formatDate(student.createdAt),
    notes: student.notes?.[0]?.text || '',
    notesList: mapNotesList(student.notes),
    rawStudent: student,
  };
};
