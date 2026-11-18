export function buildAuthHeaders(token, extra = {}) {
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function isProtectedWiUrl(url, apiBase) {
  if (!url || typeof url !== 'string' || !apiBase) return false;
  const base = String(apiBase).replace(/\/$/, '');
  return url.startsWith(`${base}/api/audits`) || url.startsWith(`${base}/api/catalogs`);
}
