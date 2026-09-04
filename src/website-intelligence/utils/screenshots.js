const API_BASE = import.meta.env.VITE_API_URL || '';

export function getPageScreenshotUrl(auditId, page) {
  if (!auditId || !page?.hasScreenshot) return null;
  if (page.screenshotUrl) return page.screenshotUrl;
  return `${API_BASE}/api/audits/${auditId}/screenshots/${page.id}`;
}
