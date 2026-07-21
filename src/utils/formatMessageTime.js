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

export const formatChatDateLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const isSameChatDay = (leftValue, rightValue) => {
  const left = new Date(leftValue);
  const right = new Date(rightValue);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

/** Format call duration seconds like WhatsApp: "23 secs", "3 mins". */
export const formatCallDuration = (durationSeconds) => {
  const total = Number(durationSeconds);
  if (!Number.isFinite(total) || total <= 0) return null;

  const seconds = Math.round(total);
  if (seconds < 60) {
    return `${seconds} sec${seconds === 1 ? '' : 's'}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;

  if (minutes < 60) {
    if (remSeconds === 0) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    return `${minutes} min${minutes === 1 ? '' : 's'} ${remSeconds} sec${remSeconds === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (remMinutes === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${hours} hr${hours === 1 ? '' : 's'} ${remMinutes} min${remMinutes === 1 ? '' : 's'}`;
};
