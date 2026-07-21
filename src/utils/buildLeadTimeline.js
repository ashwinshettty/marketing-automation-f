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

/** WhatsApp-style duration mm:ss (e.g. 10:15). */
const formatCallDurationMmSs = (durationSeconds) => {
  const total = Number(durationSeconds);
  if (!Number.isFinite(total) || total <= 0) return null;

  const seconds = Math.round(total);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};
  
  const formatStatusLabel = (status) => {
    if (!status) return 'Updated';
  
    const normalized = String(status).toLowerCase();
    if (normalized === 'admissiondue') return 'Admission Due';
  
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

const composeEventTimestamp = (event) => {
  const baseDate = parseDate(event?.date || event?.createdAt || event?.updatedAt);
  if (!baseDate) return null;

  const timeText = String(event?.time || '').trim();
  const [hoursText, minutesText] = timeText.split(':');
  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);

  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    baseDate.setHours(hours, minutes, 0, 0);
  }

  return baseDate;
};
  
export const buildLeadTimelineItems = (lead, whatsappMessages = [], events = []) => {
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
      if (message.kind === 'call') {
        const at = parseDate(message.timestamp);
        if (!at) return;

        const isOutbound = message.direction === 'outbound';
        const durationLabel = formatCallDurationMmSs(message.duration);
        const status = String(message.status || '').toLowerCase();
        const answered = Boolean(durationLabel);

        let outcome = 'No answer';
        if (answered) {
          outcome = 'Answered';
        } else if (!isOutbound || status === 'rejected' || status === 'failed') {
          outcome = isOutbound ? 'No answer' : 'Missed';
        }

        const details = [
          `Type: Voice call`,
          `Direction: ${isOutbound ? 'Outgoing' : 'Incoming'}`,
          `Date: ${formatTimelineDate(at)}`,
          durationLabel ? `Duration: ${durationLabel}` : `Duration: —`,
          `Status: ${outcome}`,
        ].join('\n');

        push({
          id: message.id || `wa-call-${message.callId || at.getTime()}`,
          type: isOutbound ? 'whatsapp_call_outbound' : 'whatsapp_call_inbound',
          timestamp: at.getTime(),
          title: isOutbound ? 'Outgoing voice call' : 'Incoming voice call',
          body: details,
          meta: {
            status: outcome,
            duration: durationLabel,
            direction: message.direction,
            callStatus: message.status,
          },
        });
        return;
      }

      const at = parseDate(message.timestamp);
      const body = String(message.text || '').trim();
      if (!at || !body) return;

      const isInbound = message.direction === 'inbound';
      const isBot =
        !isInbound &&
        (message.isBot || Boolean(message.senderName));

      let type = 'whatsapp_outbound';
      let title = 'WhatsApp sent';

      if (isInbound) {
        type = 'whatsapp_inbound';
        title = 'User message';
      } else if (isBot) {
        type = 'whatsapp_bot';
        title = message.senderName
          ? `Bot reply · ${message.senderName}`
          : 'Bot reply';
      }

      push({
        id: `wa-${message.id}`,
        type,
        timestamp: at.getTime(),
        title,
        body,
        meta: {
          direction: message.direction,
          status: message.status,
          senderName: message.senderName,
          isBot,
        },
      });
    });

  events.forEach((event, index) => {
    const at = composeEventTimestamp(event);
    if (!at) return;

    const status = String(event.status || 'pending').toLowerCase();
    const eventType = String(event.type || 'event').toLowerCase();
    const title = event.title?.trim() || 'Event added';
    const details = [
      `Type: ${eventType}`,
      event.date ? `Date: ${formatTimelineDate(event.date)}` : null,
      event.time ? `Time: ${event.time}` : null,
      event.priority ? `Priority: ${event.priority}` : null,
      `Status: ${status}`,
      event.studentName ? `Student: ${event.studentName}` : null,
      event.contactName ? `Contact: ${event.contactName}` : null,
      event.contactNumber ? `Contact Number: ${event.contactNumber}` : null,
      event.contactType ? `Contact Type: ${event.contactType}` : null,
      event.salesuser?.name ? `Counsellor: ${event.salesuser.name}` : null,
      event.location ? `Location: ${event.location}` : null,
      event.description ? `Description: ${event.description}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    push({
      id: `event-${event._id || index}`,
      type: 'event_added',
      timestamp: at.getTime(),
      title,
      body: details,
      meta: { status, eventType },
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
    event_added: { badge: 'EV', badgeClass: 'bg-indigo-600', cardClass: 'bg-indigo-50' },
    whatsapp_inbound: { badge: 'User', badgeClass: 'bg-[#128C7E]', cardClass: 'bg-white border border-slate-100' },
    whatsapp_bot: { badge: 'Bot', badgeClass: 'bg-[#075E54]', cardClass: 'bg-[#e7f8ef] border border-[#cdeedc]' },
    whatsapp_outbound: { badge: 'You', badgeClass: 'bg-brand-navy', cardClass: 'bg-brand-yellow-soft/60' },
    whatsapp_call_outbound: {
      badge: 'Call',
      badgeClass: 'bg-[#25D366]',
      cardClass: 'bg-[#e7f8ef] border border-[#cdeedc]',
    },
    whatsapp_call_inbound: {
      badge: 'Call',
      badgeClass: 'bg-[#128C7E]',
      cardClass: 'bg-white border border-slate-100',
    },
  };
  