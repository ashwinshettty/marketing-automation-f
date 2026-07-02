export const formatMessageTime = (value) => {
  if (!value) return '';

  const raw = String(value);

  if (!raw.includes('T') && /(am|pm)/i.test(raw)) {
    return raw;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};
