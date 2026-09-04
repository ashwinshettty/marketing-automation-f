const API_BASE = (import.meta.env.VITE_WI_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export function getPageScreenshotUrl(auditId, page) {
  if (!auditId || !page?.hasScreenshot) return null;
  if (page.screenshotUrl) return page.screenshotUrl;
  return `${API_BASE}/api/audits/${auditId}/screenshots/${page.id}`;
}
