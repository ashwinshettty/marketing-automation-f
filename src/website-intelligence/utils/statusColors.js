export function capabilityStatusVariant(status) {
  switch (status) {
    case 'detected':
      return 'signal';
    case 'likely':
      return 'signal-dim';
    case 'not_detected':
      return 'risk';
    case 'not_observable':
    case 'unknown':
    default:
      return 'dim';
  }
}

export function capabilityStatusLabel(status) {
  switch (status) {
    case 'detected':
      return 'Detected';
    case 'likely':
      return 'Likely present';
    case 'not_detected':
      return 'Confirmed missing';
    case 'not_observable':
      return 'Not observable';
    default:
      return 'Could not verify';
  }
}

export function pageStatusVariant(status) {
  switch (status) {
    case 'analyzed':
      return 'signal';
    case 'failed':
      return 'risk';
    default:
      return 'dim';
  }
}

export function confidenceLabel(score) {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

export function formatDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function formatPath(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search || '/';
  } catch {
    return url;
  }
}
