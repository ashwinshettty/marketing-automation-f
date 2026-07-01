const parseDate = (value) => {
    if (!value) return null;
  
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  
  export const formatTimelineDate = (value) => {
    const date = parseDate(value);
    if (!date) return '';
  
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatStatusLabel = (status) => {
    if (!status) return 'Updated';
  
    const normalized = String(status).toLowerCase();
    if (normalized === 'admissiondue') return 'Admission Due';
  
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };
  
  export const buildLeadTimelineItems = (lead, whatsappMessages = []) => {
    if (!lead) return [];
  
    const items = [];
    const student = lead.rawStudent || {};
  
    const push = (item) => {
      if (item?.timestamp) {
        items.push(item);
      }
    };
  
    const createdAt = parseDate(student.createdAt);
    if (createdAt) {
      push({
        id: `lead-created-${lead.id}`,
        type: 'lead_created',
        timestamp: createdAt.getTime(),
        title: 'Lead created',
        body: `${lead.name} was added as a lead.`,
      });
    }
  
    const inquiryDate = parseDate(student.inquiryDate);
    if (
      inquiryDate &&
      (!createdAt || Math.abs(inquiryDate.getTime() - createdAt.getTime()) > 60_000)
    ) {
      push({
        id: `inquiry-${lead.id}`,
        type: 'inquiry',
        timestamp: inquiryDate.getTime(),
        title: 'Inquiry recorded',
        body: `Inquiry date recorded for ${lead.name}.`,
      });
    }
  
    (student.statusHistory || []).forEach((entry, index) => {
      const changedAt = parseDate(entry.changedAt);
      if (!changedAt) return;
  
      push({
        id: `status-${entry._id || index}`,
        type: 'status_change',
        timestamp: changedAt.getTime(),
        title: 'Status changed',
        body: `Status updated to ${formatStatusLabel(entry.status)}.`,
        meta: { status: entry.status },
      });
    });
  
    const assignTo = student.assignTo;
    const assignedAt = parseDate(assignTo?.assignedDate);
    if (assignedAt && assignTo?.name) {
      push({
        id: `assigned-${lead.id}-${assignedAt.getTime()}`,
        type: 'assigned',
        timestamp: assignedAt.getTime(),
        title: 'Lead assigned',
        body: `Assigned to ${assignTo.name}${assignTo.role ? ` (${assignTo.role})` : ''}.`,
      });
    }
  
    const studentUpdatedAt = parseDate(student.updatedAt);
  
    (student.notes || []).forEach((note, index) => {
      const noteText = (note.text || '').trim();
      if (!noteText) return;
  
      const noteCreated = parseDate(note.createdAt);
  
      if (noteCreated) {
        push({
          id: `note-added-${note._id || index}`,
          type: 'note_added',
          timestamp: noteCreated.getTime(),
          title: 'Note added',
          body: noteText,
          meta: { status: note.status || 'pending' },
        });
      }
  
      const isExistingNote = Boolean(note._id);
      if (
        isExistingNote &&
        note.recentlyEdited &&
        studentUpdatedAt &&
        noteCreated &&
        studentUpdatedAt.getTime() > noteCreated.getTime() + 2000
      ) {
        push({
          id: `note-updated-${note._id || index}-${studentUpdatedAt.getTime()}`,
          type: 'note_updated',
          timestamp: studentUpdatedAt.getTime(),
          title: 'Note updated',
          body: noteText,
          meta: { status: note.status || 'pending' },
        });
      } else if (!noteCreated && studentUpdatedAt) {
        push({
          id: `note-${note._id || index}`,
          type: 'note_added',
          timestamp: studentUpdatedAt.getTime(),
          title: 'Note added',
          body: noteText,
          meta: { status: note.status || 'pending' },
        });
      }
    });
  
    whatsappMessages.forEach((message) => {
      const at = parseDate(message.timestamp);
      if (!at || !message.text) return;
  
      push({
        id: `wa-${message.id}`,
        type:
          message.direction === 'outbound' ? 'whatsapp_outbound' : 'whatsapp_inbound',
        timestamp: at.getTime(),
        title: message.direction === 'outbound' ? 'WhatsApp sent' : 'WhatsApp received',
        body: message.text,
        meta: { direction: message.direction, status: message.status },
      });
    });
  
    return items.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  export const TIMELINE_STYLES = {
    lead_created: { badge: 'LC', badgeClass: 'bg-slate-500', cardClass: 'bg-slate-50' },
    inquiry: { badge: 'IN', badgeClass: 'bg-slate-400', cardClass: 'bg-slate-50' },
    status_change: { badge: 'ST', badgeClass: 'bg-blue-600', cardClass: 'bg-blue-50' },
    assigned: { badge: 'AS', badgeClass: 'bg-violet-600', cardClass: 'bg-violet-50' },
    note_added: { badge: 'N+', badgeClass: 'bg-amber-500', cardClass: 'bg-brand-yellow-soft/60' },
    note_updated: { badge: 'N~', badgeClass: 'bg-amber-600', cardClass: 'bg-brand-yellow-soft/80' },
    whatsapp_inbound: { badge: 'In', badgeClass: 'bg-[#25D366]', cardClass: 'bg-white' },
    whatsapp_outbound: { badge: 'You', badgeClass: 'bg-brand-navy', cardClass: 'bg-brand-yellow-soft/60' },
  };
  