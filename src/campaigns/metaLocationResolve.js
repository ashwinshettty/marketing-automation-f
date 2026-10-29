import { searchMetaLocations } from '../api/campaignApi';

const META_TYPE_BY_UI = {
  Country: 'country',
  Region: 'region',
  City: 'city',
  Location: 'city',
  Zip: 'zip',
  Postal: 'zip',
};

/** First meaningful place name from "Mumbai, Maharashtra, India". */
export const primaryPlaceName = (label = '') => {
  const parts = String(label)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[0] || String(label).trim();
};

const normalizeName = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Pick the best Meta adgeolocation row for a UI place label.
 */
export const pickBestMetaLocation = (rows = [], label = '') => {
  if (!Array.isArray(rows) || !rows.length) return null;
  const needle = normalizeName(primaryPlaceName(label));
  const full = normalizeName(label);
  const scored = rows
    .map((row) => {
      const name = normalizeName(row.name);
      let score = 0;
      if (name === needle) score += 100;
      if (name.startsWith(needle) || needle.startsWith(name)) score += 40;
      if (name.includes(needle) || needle.includes(name)) score += 20;
      if (full.includes(normalizeName(row.region || ''))) score += 10;
      if (row.countryCode === 'IN' && /india/i.test(label)) score += 5;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].row : rows[0];
};

/**
 * Resolve Meta targeting keys dynamically via Graph adgeolocation search.
 * Attaches metaKey / countryCode / regionKey onto the place for publish → Mongo/Meta.
 */
export const resolveMetaGeoForPlace = async (place = {}) => {
  const label = String(place.label || place.name || '').trim();
  if (!label) return place;

  const uiType = place.type || 'City';
  const metaType = META_TYPE_BY_UI[uiType] || 'city';
  const query = primaryPlaceName(label);

  try {
    const rows = await searchMetaLocations({
      q: query,
      type: metaType,
      countryCode: metaType === 'country' ? undefined : 'IN',
    });
    const best = pickBestMetaLocation(rows, label);
    if (!best) return place;

    return {
      ...place,
      metaKey: String(best.key),
      countryCode: best.countryCode || (metaType === 'country' ? String(best.key) : place.countryCode),
      regionKey:
        best.regionId != null && best.regionId !== ''
          ? String(best.regionId)
          : place.regionKey,
      regionName: best.region || place.regionName,
      metaName: best.name || place.metaName,
    };
  } catch {
    // Search UI still works offline / if Meta is down — custom_locations cover lat/lng.
    return place;
  }
};
