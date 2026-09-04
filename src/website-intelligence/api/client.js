// Amplify: https://api.bot.inkstall.in  |  local: http://localhost:3000
const API_BASE = (import.meta.env.VITE_WI_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  health: () => request('/health'),

  listAudits: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/audits${qs ? `?${qs}` : ''}`);
  },

  listCatalogs: () => request('/api/catalogs'),

  getCatalog: (id) => request(`/api/catalogs/${id}`),

  getCatalogServices: (id) => request(`/api/catalogs/${id}/services`),

  getService: (catalogId, serviceId) => request(`/api/catalogs/${catalogId}/services/${serviceId}`),

  createAudit: (body) =>
    request('/api/audits', { method: 'POST', body: JSON.stringify(body) }),

  getAudit: (id) => request(`/api/audits/${id}`),

  deleteAudit: (id) => request(`/api/audits/${id}`, { method: 'DELETE' }),

  getAuditStatus: (id) => request(`/api/audits/${id}/status`),

  getOpportunities: (id) => request(`/api/audits/${id}/opportunities`),

  getCapabilities: (id) => request(`/api/audits/${id}/capabilities`),

  getEvidence: (id) => request(`/api/audits/${id}/evidence`),

  getPages: (id) => request(`/api/audits/${id}/pages`),

  getOutreachContext: (auditId) => request(`/api/audits/${auditId}/outreach-context`),

  listOutreachEmails: (auditId) => request(`/api/audits/${auditId}/emails`),

  getOutreachEmail: (auditId, emailId) => request(`/api/audits/${auditId}/emails/${emailId}`),

  generateOutreachEmail: (auditId, body) =>
    request(`/api/audits/${auditId}/emails/generate`, { method: 'POST', body: JSON.stringify(body) }),

  saveOutreachEmailDraft: (auditId, body) =>
    request(`/api/audits/${auditId}/emails`, { method: 'POST', body: JSON.stringify(body) }),

  updateOutreachEmail: (auditId, emailId, body) =>
    request(`/api/audits/${auditId}/emails/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  regenerateOutreachEmail: (auditId, emailId, body = {}) =>
    request(`/api/audits/${auditId}/emails/${emailId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  sendOutreachEmail: (auditId, emailId, body = {}) =>
    request(`/api/audits/${auditId}/emails/${emailId}/send`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteOutreachEmail: (auditId, emailId) =>
    request(`/api/audits/${auditId}/emails/${emailId}`, { method: 'DELETE' }),

  uploadOutreachImage: async (auditId, emailId, file, insertAt) => {
    const form = new FormData();
    form.append('image', file);
    if (insertAt != null) form.append('insertAt', String(insertAt));

    const res = await fetch(`${API_BASE}/api/audits/${auditId}/emails/${emailId}/images`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error?.message || body.message || `Upload failed: ${res.status}`);
    }

    return res.json();
  },

  deleteOutreachImage: (auditId, emailId, assetId) =>
    request(`/api/audits/${auditId}/emails/${emailId}/images/${assetId}`, { method: 'DELETE' }),

  getOutreachImageUrl: (auditId, emailId, assetId) =>
    `${API_BASE}/api/audits/${auditId}/emails/${emailId}/images/${assetId}`,

  previewOpportunityReport: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/audits/${id}/report-preview${qs ? `?${qs}` : ''}`);
  },

  generateOpportunityReport: (id, body = {}) =>
    request(`/api/audits/${id}/generate-report`, { method: 'POST', body: JSON.stringify(body) }),

  sendOpportunityReport: (id, body) =>
    request(`/api/audits/${id}/send-report`, { method: 'POST', body: JSON.stringify(body) }),

  pollAuditUntilComplete: async (auditId, { onProgress, intervalMs = 1000, maxAttempts = 300 } = {}) => {
    let currentId = auditId;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await api.getAuditStatus(currentId);
      if (status.auditId && status.auditId !== currentId) {
        currentId = status.auditId;
      }
      onProgress?.(status);
      if (['completed', 'completed_with_warnings'].includes(status.status)) {
        return api.getAudit(currentId);
      }
      if (status.status === 'failed') {
        throw new Error('Audit failed');
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error('Audit timed out');
  },
};
