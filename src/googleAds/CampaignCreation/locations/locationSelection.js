export const BULK_LOCATION_LIMIT = 1000;

export const INDIA_LOCATION = Object.freeze({
  id: '2356',
  name: 'India',
  type: 'Country',
  countryCode: 'IN',
  reach: '',
  action: 'include',
});

export function formatReach(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return new Intl.NumberFormat('en-US').format(amount);
}

export function parseBulkLines(text) {
  const seen = new Set();
  const lines = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim();
    if (!line || seen.has(line.toLowerCase())) continue;
    seen.add(line.toLowerCase());
    lines.push(line);
    if (lines.length >= BULK_LOCATION_LIMIT) break;
  }
  return lines;
}

export function upsertLocation(items, suggestion, action) {
  const id = String(suggestion?.id || '').replace(/\D/g, '');
  if (!id) return items;
  const next = {
    id,
    name: suggestion.name || '',
    type: suggestion.type || '',
    countryCode: suggestion.countryCode || '',
    reach: suggestion.reach != null ? String(suggestion.reach) : '',
    action,
  };
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return [...items, next];
  const copy = items.slice();
  copy[index] = next;
  return copy;
}

export function applyActionToAll(items, suggestions, action) {
  return suggestions.reduce((acc, suggestion) => upsertLocation(acc, suggestion, action), items);
}

export function removeLocation(items, id) {
  return items.filter((item) => item.id !== id);
}

export function radiusKey(item) {
  return [
    item.latitude,
    item.longitude,
    item.radius,
    item.radiusUnits,
  ].join('|');
}

export function addRadius(radii, radius) {
  const next = {
    label: radius.label,
    latitude: radius.latitude,
    longitude: radius.longitude,
    radius: Number(radius.radius),
    radiusUnits: radius.radiusUnits === 'MILES' ? 'MILES' : 'KILOMETERS',
    action: 'include',
  };
  if (radii.some((item) => radiusKey(item) === radiusKey(next))) return radii;
  return [...radii, next];
}

export function removeRadius(radii, key) {
  return radii.filter((item) => radiusKey(item) !== key);
}

export function unmatchedQueries(names, suggestions) {
  const found = new Set(
    (suggestions || [])
      .map((item) => String(item.searchTerm || '').trim().toLowerCase())
      .filter(Boolean),
  );
  if (!found.size) return [];
  return names.filter((name) => !found.has(name.toLowerCase()));
}

export function apiErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}
