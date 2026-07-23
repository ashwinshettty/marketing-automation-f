export const buildStudentUpdatePayload = (lead, form) => {
  const raw = lead.rawStudent || lead.raw || {};
  const isEnquiry = lead.type === 'enquiry';

  if (isEnquiry) {
    const contactInformation = Array.isArray(raw.contactInformation)
      ? raw.contactInformation.map((contact) => ({ ...contact }))
      : [];

    if (contactInformation.length === 0) {
      contactInformation.push({
        phoneNumber: form.contactNo,
        email: form.email,
        contactPersonName: form.parentName || form.name,
        relation: 'self',
      });
    } else {
      contactInformation[0] = {
        ...contactInformation[0],
        phoneNumber: form.contactNo,
        number: form.contactNo,
        email: form.email,
        contactPersonName:
          form.parentName || contactInformation[0].contactPersonName || form.name,
      };
    }

    return {
      type: 'enquiry',
      fullName: form.name.trim(),
      standard: form.grade.trim(),
      board: form.board.trim(),
      source: form.source.trim(),
      whatsappNumber: form.contactNo.trim(),
      contactInformation,
      address: form.city.trim(),
      notes: form.notes.trim(),
    };
  }

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
    type: 'student',
    studentName: form.name.trim(),
    grade: form.grade.trim(),
    board: form.board.trim(),
    source: form.source.trim(),
    contactInformation,
    address: {
      ...(typeof raw.address === 'object' && raw.address ? raw.address : {}),
      city: form.city.trim(),
    },
    notes: form.notes.trim()
      ? [{ text: form.notes.trim() }]
      : Array.isArray(raw.notes)
        ? raw.notes
        : [],
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

export const sortNotesByNewest = (notes) =>
  [...(notes || [])].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

export const normalizeNotesFromLead = (lead) => {
  const rawNotes = lead?.rawStudent?.notes ?? lead?.raw?.notes;

  if (typeof rawNotes === 'string' && rawNotes.trim()) {
    return [
      {
        _id: 'legacy',
        text: rawNotes.trim(),
        createdAt: lead?.rawStudent?.updatedAt || lead?.rawStudent?.enquiryDate,
        status: 'pending',
      },
    ];
  }

  if (!Array.isArray(rawNotes)) {
    if (lead?.notes?.trim()) {
      return [
        {
          _id: 'primary',
          text: lead.notes.trim(),
          createdAt: '',
          status: 'pending',
        },
      ];
    }
    return [];
  }

  return sortNotesByNewest(
    rawNotes.map((note) => ({
      _id: note._id,
      text: note.text || '',
      createdAt: note.createdAt,
      status: note.status || 'pending',
      recentlyEdited: Boolean(note.recentlyEdited),
      addedBy: note.addedBy,
    })),
  );
};

export const sanitizeNotesForSave = (notes) =>
  (notes || [])
    .map((note) => {
      const trimmedText = (note.text || '').trim();
      if (!trimmedText) {
        return null;
      }

      const payload = {
        text: trimmedText,
        createdAt: note.createdAt || new Date().toISOString(),
        recentlyEdited: note._id ? Boolean(note.recentlyEdited) : false,
        status: note.status || 'pending',
      };

      if (note._id && note._id !== 'legacy' && note._id !== 'primary') {
        payload._id = note._id;
      }

      if (note.addedBy) {
        payload.addedBy = note.addedBy;
      }

      return payload;
    })
    .filter(Boolean);

export const buildNotesUpdatePayload = (lead, notes) => {
  const sanitized = sanitizeNotesForSave(notes);

  if (lead.type === 'enquiry') {
    return {
      type: 'enquiry',
      notes: sanitized.map((note) => note.text).join('\n\n'),
    };
  }

  return {
    type: 'student',
    notes: sanitized,
  };
};
