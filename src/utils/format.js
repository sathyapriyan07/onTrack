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

export function flagEmoji(nationality) {
  const map = {
    British: '🇬🇧', German: '🇩🇪', Spanish: '🇪🇸', Finnish: '🇫🇮',
    French: '🇫🇷', Australian: '🇦🇺', Brazilian: '🇧🇷', Dutch: '🇳🇱',
    Mexican: '🇲🇽', Monegasque: '🇲🇨', Canadian: '🇨🇦', Japanese: '🇯🇵',
    Italian: '🇮🇹', American: '🇺🇸', Thai: '🇹🇭', Chinese: '🇨🇳',
    Danish: '🇩🇰', Austrian: '🇦🇹', Swiss: '🇨🇭', Polish: '🇵🇱',
    Argentine: '🇦🇷', 'New Zealander': '🇳🇿',
  };
  return map[nationality] || '🏁';
}
