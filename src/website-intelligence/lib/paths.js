/**
 * Base path when Website Intelligence is embedded inside marketing-automation-f.
 */
export const WI_BASE = '/website-intelligence';

/** Build an absolute path under the WI mount. */
export function wiPath(path = '/') {
  if (!path || path === '/') return WI_BASE;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${WI_BASE}${normalized}`;
}
