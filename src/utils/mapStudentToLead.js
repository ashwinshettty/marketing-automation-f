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

/** Why the lead reached Inkstall — enquiry subjectEntries/helpNeeded or student subjects. */
export const extractLeadSubject = (doc = {}) => {
  const parts = [];

  const push = (value) => {
    const text = String(value || '').trim();
    if (text) parts.push(text);
  };

  push(doc.subject);
  push(doc.helpNeeded);
  push(doc.enquirySubject);
  push(doc.lookingFor);
  push(doc.purpose);

  const collectList = (list) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (typeof item === 'string') {
        push(item);
        continue;
      }
      if (!item || typeof item !== 'object') continue;
      push(item.name || item.subject || item.title || item.label || item.text);
    }
  };

  collectList(doc.subjectEntries);
  collectList(doc.subjects);

  const seen = new Set();
  const unique = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  return unique.join(', ');
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

/** Accepts backend-normalized leads or raw student/enquiry docs. */
export const mapStudentToLead = (studentOrLead) => {
  if (!studentOrLead) return null;

  // Already normalized by marketing-b
  if (studentOrLead.type && studentOrLead.tag && studentOrLead.id) {
    const raw = studentOrLead.rawStudent || studentOrLead.raw || studentOrLead;
    return {
      ...studentOrLead,
      subject:
        studentOrLead.subject ||
        extractLeadSubject(raw) ||
        '',
      enquiredFor:
        studentOrLead.enquiredFor || raw.enquiredFor || '',
      lastActivityAt:
        studentOrLead.lastActivityAt ||
        formatDate(raw.lastActivityAt || raw.lastInboundAt || raw.updatedAt) ||
        studentOrLead.createdAt ||
        '',
      lastAgentOutcome: studentOrLead.lastAgentOutcome || raw.lastAgentOutcome || '',
      lastAgentOutcomeAt:
        studentOrLead.lastAgentOutcomeAt || raw.lastAgentOutcomeAt || null,
      lastAgentCallSummary:
        studentOrLead.lastAgentCallSummary || raw.lastAgentCallSummary || '',
      rawStudent: raw,
      raw: studentOrLead.raw || studentOrLead.rawStudent || studentOrLead,
    };
  }

  // Enquiry raw doc
  if (
    studentOrLead.fullName !== undefined ||
    studentOrLead.enquiryDate !== undefined ||
    studentOrLead.salesStatus !== undefined
  ) {
    const primaryContact = getPrimaryContact(studentOrLead);
    const phone =
      studentOrLead.whatsappNumber ||
      primaryContact?.phoneNumber ||
      primaryContact?.number ||
      '';
    const notesList = mapNotesList(studentOrLead.notes);
    const subject = extractLeadSubject(studentOrLead);

    return {
      id: String(studentOrLead._id),
      type: 'enquiry',
      tag: 'Enquiry',
      name: studentOrLead.fullName || primaryContact?.contactPersonName || '-',
      contactNo: formatPhone(phone),
      grade: studentOrLead.standard || '-',
      board: studentOrLead.board || '-',
      source: studentOrLead.source || '-',
      email: primaryContact?.email || '-',
      parentName: primaryContact?.contactPersonName || '-',
      enquiredFor: studentOrLead.enquiredFor || '',
      city:
        (typeof studentOrLead.address === 'string'
          ? studentOrLead.address
          : studentOrLead.address?.city) || '-',
      status: formatStatus(studentOrLead.salesStatus || 'new'),
      createdAt: formatDate(studentOrLead.enquiryDate || studentOrLead.createdAt),
      notes: notesList[0]?.text || '',
      notesList,
      subject,
      lastAgentOutcome: studentOrLead.lastAgentOutcome || '',
      lastAgentOutcomeAt: studentOrLead.lastAgentOutcomeAt || null,
      lastAgentCallSummary: studentOrLead.lastAgentCallSummary || '',
      rawStudent: studentOrLead,
      raw: studentOrLead,
    };
  }

  const primaryContact = getPrimaryContact(studentOrLead);
  const parentContact =
    studentOrLead.contactInformation?.find(
      (contact) => contact.relation && contact.relation.toLowerCase() !== 'self',
    ) || primaryContact;

  const subject = extractLeadSubject(studentOrLead);

  return {
    id: String(studentOrLead._id),
    type: 'student',
    tag: 'Admission Due',
    name: studentOrLead.studentName || '-',
    contactNo: formatPhone(primaryContact?.number || studentOrLead.phone),
    grade: studentOrLead.grade || '-',
    board: studentOrLead.board || '-',
    source: studentOrLead.source || '-',
    email: primaryContact?.email || '-',
    parentName: parentContact?.relationName || '-',
    city: studentOrLead.address?.city || '-',
    status: formatStatus(studentOrLead.status),
    createdAt: formatDate(studentOrLead.createdAt),
    notes: studentOrLead.notes?.[0]?.text || '',
    notesList: mapNotesList(studentOrLead.notes),
    subject,
    lastAgentOutcome: studentOrLead.lastAgentOutcome || '',
    lastAgentOutcomeAt: studentOrLead.lastAgentOutcomeAt || null,
    lastAgentCallSummary: studentOrLead.lastAgentCallSummary || '',
    rawStudent: studentOrLead,
    raw: studentOrLead,
  };
};
