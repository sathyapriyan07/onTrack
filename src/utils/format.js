export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  return timeStr;
}

export function positionSuffix(pos) {
  if (!pos) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = pos % 100;
  return pos + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ISO 3166-1 alpha-2 codes keyed by F1 nationality string
const NATIONALITY_CODE = {
  British: 'gb', German: 'de', Spanish: 'es', Finnish: 'fi',
  French: 'fr', Australian: 'au', Brazilian: 'br', Dutch: 'nl',
  Mexican: 'mx', Monegasque: 'mc', Canadian: 'ca', Japanese: 'jp',
  Italian: 'it', American: 'us', Thai: 'th', Chinese: 'cn',
  Danish: 'dk', Austrian: 'at', Swiss: 'ch', Polish: 'pl',
  Argentine: 'ar', 'New Zealander': 'nz', Belgian: 'be',
  Swedish: 'se', Hungarian: 'hu', Russian: 'ru', Portuguese: 'pt',
  Colombian: 'co', Venezuelan: 've', Indonesian: 'id', Indian: 'in',
  Irish: 'ie', Czech: 'cz', 'South African': 'za',
};

export function flagUrl(nationality, size = 24) {
  const code = NATIONALITY_CODE[nationality];
  if (!code) return null;
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`;
}

// Keep for any legacy usage
export function flagEmoji(nationality) {
  return flagUrl(nationality);
}

// Team accent colours
const TEAM_COLORS = {
  'ferrari':          '#DC0000',
  'red_bull':         '#0600EF',
  'mercedes':         '#00D2BE',
  'mclaren':          '#FF8700',
  'aston_martin':     '#006F62',
  'alpine':           '#0090FF',
  'williams':         '#005AFF',
  'haas':             '#E10600',
  'sauber':           '#00FF00',
  'kick_sauber':      '#00FF00',
  'rb':               '#1E5BC6',
  'alphatauri':       '#1E5BC6',
  'racing_point':     '#F596C8',
  'force_india':      '#F596C8',
  'renault':          '#FFD700',
  'toro_rosso':       '#1E5BC6',
  'lotus_f1':         '#FFB800',
  'manor':            '#FF0000',
  'caterham':         '#005030',
  'hrt':              '#999999',
  'virgin':           '#CC0000',
};

export function teamColor(constructorId) {
  if (!constructorId) return 'var(--accent)';
  const key = constructorId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return 'var(--accent)';
}
