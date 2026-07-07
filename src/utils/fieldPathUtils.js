export const formatFieldValue = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return '';

  const text = String(value).trim();
  return text === '-' ? '' : text;
};

const isScalarField = (value) =>
  value !== null && value !== undefined && typeof value !== 'object';

const findMatchingKey = (record, path) => {
  if (!record || !path) return null;

  const keys = Object.keys(record).filter((key) => isScalarField(record[key]));

  if (Object.prototype.hasOwnProperty.call(record, path)) {
    return path;
  }

  const lower = path.toLowerCase();
  const caseInsensitive = keys.find((key) => key.toLowerCase() === lower);
  if (caseInsensitive) return caseInsensitive;

  const endsWith = keys.find((key) => key.toLowerCase().endsWith(lower));
  if (endsWith) return endsWith;

  const includes = keys.find((key) => key.toLowerCase().includes(lower));
  if (includes) return includes;

  return null;
};

export const getValueByFieldPath = (record, fieldPath) => {
  if (!record || fieldPath === undefined || fieldPath === null) return '';

  const path = String(fieldPath).trim();
  if (!path) return '';

  if (!path.includes('.')) {
    const matchedKey = findMatchingKey(record, path);
    return matchedKey ? formatFieldValue(record[matchedKey]) : '';
  }

  const parts = path.split('.').map((part) => part.trim()).filter(Boolean);
  let current = record;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return '';
    }

    const matchedKey = findMatchingKey(current, part);
    if (!matchedKey) {
      return '';
    }

    current = current[matchedKey];
  }

  return formatFieldValue(current);
};

const META_SAMPLE_PATTERN = /^sample\s*\d+$/i;

const POSITION_FALLBACK_PATHS = ['name', 'grade', 'board', 'fees', 'status', 'source'];

export const buildVariableForPosition = (template, position) => {
  const configured = template?.variables?.find(
    (item) => Number(item.position) === position,
  );
  if (configured) return configured;

  const fallbackPath = POSITION_FALLBACK_PATHS[position - 1];
  if (!fallbackPath) return null;

  return {
    position,
    key: `var${position}`,
    source: `custom.var${position}`,
    example: fallbackPath,
  };
};

export const isLikelyMetaSample = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return true;
  return META_SAMPLE_PATTERN.test(trimmed);
};

export const getVariableFieldPath = (variable) => {
  const example = variable?.example?.trim();
  if (example && !isLikelyMetaSample(example)) return example;

  const source = variable?.source?.trim();
  if (source) {
    const parts = source.split('.');
    const last = parts[parts.length - 1]?.trim() || '';
    if (last && !/^var\d+$/i.test(last)) return last;
  }

  return variable?.key?.trim() || '';
};

export const buildFieldPathCandidates = (variable) => {
  const candidates = [];
  const example = variable?.example?.trim();

  if (example && !isLikelyMetaSample(example)) {
    candidates.push(example);

    if (example.includes('_')) {
      candidates.push(example.split('_').pop().trim());
    }

    if (example.includes('.')) {
      candidates.push(...example.split('.').map((part) => part.trim()).filter(Boolean));
    }
  }

  const source = variable?.source?.trim();
  if (source) {
    if (source.startsWith('student.')) {
      candidates.push(source.slice('student.'.length));
    }

    const parts = source.split('.');
    const last = parts[parts.length - 1]?.trim();
    if (last && !/^var\d+$/i.test(last)) {
      candidates.push(last);
    }
  }

  const key = variable?.key?.trim();
  if (key && !/^var\d+$/i.test(key)) {
    candidates.push(key);
  }

  return [...new Set(candidates.filter(Boolean))];
};

export const resolveRecordValueByVariable = (record, variable) => {
  if (!record || !variable) return '';

  for (const path of buildFieldPathCandidates(variable)) {
    const value = getValueByFieldPath(record, path);
    if (value) return value;
  }

  const position = Number(variable.position);
  if (position > 0 && position <= POSITION_FALLBACK_PATHS.length) {
    return getValueByFieldPath(record, POSITION_FALLBACK_PATHS[position - 1]);
  }

  return '';
};

export const isPlaceholderParam = (value) => /^value_\d+$/i.test(String(value || '').trim());
