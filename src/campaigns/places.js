/**
 * Dynamic location search via free third-party APIs (no API key):
 * - Open-Meteo Geocoding (cities / regions / countries, CORS-friendly)
 * - Photon / Komoot (OpenStreetMap), used as a fallback / browse enricher
 */

/** Seed results when Browse opens with an empty query */
export const browseSeedPlaces = [
  { name: 'India', lat: 22.3511, lng: 78.6677, type: 'Country', value: 'country:in' },
  { name: 'Mumbai, Maharashtra, India', lat: 19.076, lng: 72.8777, type: 'City', value: 'city:mumbai' },
  { name: 'Delhi, India', lat: 28.6139, lng: 77.209, type: 'City', value: 'city:delhi' },
  { name: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946, type: 'City', value: 'city:bengaluru' },
  { name: 'Hyderabad, Telangana, India', lat: 17.385, lng: 78.4867, type: 'City', value: 'city:hyderabad' },
  { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707, type: 'City', value: 'city:chennai' },
  { name: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567, type: 'City', value: 'city:pune' },
  { name: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639, type: 'City', value: 'city:kolkata' },
];

const placeLabel = (parts) =>
  [...parts].filter(Boolean).filter((part, index, arr) => arr.indexOf(part) === index).join(', ');

const slugValue = (prefix, name, lat, lng) => {
  const slug = String(name || 'place')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${prefix}:${slug}:${lat.toFixed(4)},${lng.toFixed(4)}`;
  }
  return `${prefix}:${slug}`;
};

/** Map Open-Meteo / GeoNames feature codes → Meta-style type label */
const typeFromFeatureCode = (code = '') => {
  if (code === 'PCLI' || code === 'PCLD' || code === 'PCLS') return 'Country';
  if (code.startsWith('ADM1')) return 'Region';
  if (code.startsWith('ADM')) return 'Region';
  if (code.startsWith('PPL')) return 'City';
  return 'Location';
};

const typeFromPhoton = (properties = {}) => {
  const key = properties.osm_key;
  const value = properties.osm_value;
  if (key === 'place' && value === 'country') return 'Country';
  if (key === 'boundary' && value === 'administrative') {
    if (properties.extent || properties.type === 'country') return 'Country';
    return properties.state ? 'Region' : 'Region';
  }
  if (key === 'place' && ['city', 'town', 'village', 'municipality', 'suburb'].includes(value)) {
    return 'City';
  }
  if (key === 'place' && value === 'state') return 'Region';
  return 'Location';
};

const normalizePlace = ({ name, lat, lng, type, value }) => {
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    name,
    label: name,
    lat,
    lng,
    type: type || 'Location',
    value: value || slugValue('place', name, lat, lng),
  };
};

async function searchOpenMeteo(query, limit = 10) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${limit}&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results || [])
    .map((row) =>
      normalizePlace({
        name: placeLabel([row.name, row.admin1, row.country]),
        lat: row.latitude,
        lng: row.longitude,
        type: typeFromFeatureCode(row.feature_code),
        value: slugValue(
          typeFromFeatureCode(row.feature_code).toLowerCase(),
          row.name,
          row.latitude,
          row.longitude
        ),
      })
    )
    .filter(Boolean);
}

async function searchPhoton(query, limit = 8) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.features || [])
    .map((feature) => {
      const props = feature.properties || {};
      const name = placeLabel([props.name, props.city, props.state, props.country]);
      const lng = feature.geometry?.coordinates?.[0];
      const lat = feature.geometry?.coordinates?.[1];
      const type = typeFromPhoton(props);
      return normalizePlace({
        name,
        lat,
        lng,
        type,
        value: slugValue(type.toLowerCase(), name, lat, lng),
      });
    })
    .filter(Boolean);
}

const mergeUnique = (lists) => {
  const seen = new Set();
  const out = [];
  lists.flat().forEach((place) => {
    if (!place) return;
    const key = place.value || place.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(place);
  });
  return out;
};

/**
 * Search locations dynamically. Returns { name, label, lat, lng, type, value }.
 * @param {string} query
 * @param {{ limit?: number }} [options]
 */
export const searchPlaces = async (query, options = {}) => {
  const limit = options.limit || 10;
  const needle = String(query || '').trim();

  if (needle.length < 2) {
    return browseSeedPlaces.slice(0, limit);
  }

  try {
    const [meteo, photon] = await Promise.all([
      searchOpenMeteo(needle, limit).catch(() => []),
      searchPhoton(needle, Math.min(6, limit)).catch(() => []),
    ]);
    const merged = mergeUnique([meteo, photon]);
    if (merged.length) return merged.slice(0, limit);
  } catch {
    // fall through to seed filter
  }

  const lower = needle.toLowerCase();
  return browseSeedPlaces
    .filter((place) => place.name.toLowerCase().includes(lower))
    .slice(0, limit);
};

/** Browse list: seed + live suggestions for a region (default India). */
export const browsePlaces = async (regionQuery = 'India') => {
  try {
    const live = await searchPlaces(regionQuery, { limit: 12 });
    return mergeUnique([browseSeedPlaces, live]).slice(0, 16);
  } catch {
    return browseSeedPlaces;
  }
};

/**
 * Reverse-geocode coordinates → human-readable area name (Photon / OSM).
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '';

  try {
    const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&lang=en`;
    const response = await fetch(url);
    if (!response.ok) return '';
    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature) return '';
    const props = feature.properties || {};
    return (
      placeLabel([props.name, props.city, props.town, props.village, props.state, props.country]) ||
      props.name ||
      ''
    );
  } catch {
    return '';
  }
};
