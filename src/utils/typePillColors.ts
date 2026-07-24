export type TypePillColors = {
  background: string;
  border: string;
  text: string;
};

const TYPE_PILL_COLORS: Record<string, TypePillColors> = {
  'self-paced': { background: '#fff1cc', border: '#d7a100', text: '#6e5200' },
  'interactive': { background: '#e8f1ff', border: '#3b82f6', text: '#17408b' },
  'online': { background: '#f1e8ff', border: '#8b5cf6', text: '#4c1d95' },
  'instructor-led': { background: '#ffe9dd', border: '#f97316', text: '#9a3412' },
  'discussion':   { background: '#f9e3ef', border: '#d14d8f', text: '#7d1f50' },

};

const TYPE_ALIASES: Record<string, string> = {
  'self paced': 'self-paced',
  'facilitator led': 'instructor-led',
  'instructor led': 'instructor-led',
};

const FALLBACK_COLORS: TypePillColors[] = [
  { background: '#f0f9ff', border: '#0ea5e9', text: '#075985' },
  { background: '#ecfccb', border: '#65a30d', text: '#365314' },
  { background: '#ffedd5', border: '#ea580c', text: '#7c2d12' },
  { background: '#dff7ec', border: '#2f9e6f', text: '#14553a' },
];

const normalizeType = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const toCanonicalType = (value: string): string => {
  const normalized = normalizeType(value);
  const alias = TYPE_ALIASES[normalized];

  if (alias) {
    return alias;
  }

  return normalized.replace(/\s+/g, '-');
};

const hashType = (value: string): number => {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
};

export const getTypePillColors = (typeLabel: string): TypePillColors => {
  const canonicalType = toCanonicalType(typeLabel);
  const configuredColors = TYPE_PILL_COLORS[canonicalType];

  if (configuredColors) {
    return configuredColors;
  }

  return FALLBACK_COLORS[hashType(canonicalType) % FALLBACK_COLORS.length];
};
