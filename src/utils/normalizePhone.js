export const normalizePhoneNumber = (phone) => {
  let digits = String(phone || '').replace(/[^0-9]/g, '');

  if (!digits) return '';

  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  return digits;
};
