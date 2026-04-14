// Material Symbols Rounded icon
export function Icon({ name, size = 20, fill = false, style = {} }) {
  return (
    <span
      className={`material-symbols-rounded${fill ? ' icon-fill' : ''}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}

// Flag image from flagcdn.com
export function Flag({ nationality, height = 16 }) {
  const CODES = {
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
  const code = CODES[nationality];
  if (!code) return null;
  const w = Math.round(height * (4 / 3));
  return (
    <img
      src={`https://flagcdn.com/${w}x${height}/${code}.png`}
      srcSet={`https://flagcdn.com/${w * 2}x${height * 2}/${code}.png 2x`}
      width={w}
      height={height}
      alt={nationality}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, flexShrink: 0 }}
    />
  );
}
