const STORAGE_KEY = 'ga-location-coordinates';
const memory = new Map();

const readStore = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    Object.entries(parsed).forEach(([key, value]) => memory.set(key, value));
  } catch {
    memory.clear();
  }
};

const writeStore = () => {
  const payload = {};
  memory.forEach((value, key) => {
    payload[key] = value;
  });
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* The map still works for this visit when storage is blocked. */
  }
};

async function geocodePlace(query) {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (memory.has(key)) return memory.get(key);
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
  );
  if (!response.ok) return null;
  const data = await response.json();
  const hit = data?.results?.[0];
  const point = hit ? { latitude: hit.latitude, longitude: hit.longitude } : null;
  memory.set(key, point);
  writeStore();
  return point;
}

/** Fills missing centers. Radius targets already have coordinates from Google Ads. */
export async function withCoordinates(groups) {
  readStore();
  const queue = [...(groups || [])];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const group = queue.shift();
      if (Number.isFinite(group.latitude) && Number.isFinite(group.longitude)) continue;
      const queries = group.queries?.length ? group.queries : [group.query].filter(Boolean);
      for (const query of queries) {
        try {
          const point = await geocodePlace(query);
          if (!point) continue;
          group.latitude = point.latitude;
          group.longitude = point.longitude;
          break;
        } catch {
          /* Try the next name in this region. */
        }
      }
    }
  });
  await Promise.all(workers);
  return (groups || []).filter((group) => Number.isFinite(group.latitude) && Number.isFinite(group.longitude));
}
