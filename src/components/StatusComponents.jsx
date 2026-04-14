import { Icon } from './Icons';

export function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 16 }}>
      <div style={spinnerStyle} />
      <span style={{ color: 'var(--text3)', fontSize: '0.85rem', letterSpacing: '0.04em' }}>Loading</span>
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div style={{ margin: '2rem auto', maxWidth: 480, background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.25)', borderRadius: 12, padding: '1.25rem 1.5rem', color: '#ff6b6b', fontSize: '0.9rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Icon name="error" size={20} style={{ color: '#ff6b6b', flexShrink: 0, marginTop: 1 }} />
      {message}
    </div>
  );
}

export function EmptyState({ message = 'No data found.' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--text3)', fontSize: '0.9rem', gap: 10 }}>
      <Icon name="inbox" size={36} style={{ color: 'var(--surface3)' }} />
      {message}
    </div>
  );
}

const spinnerStyle = {
  width: 36, height: 36,
  border: '3px solid rgba(255,255,255,0.08)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

if (typeof document !== 'undefined' && !document.getElementById('spinner-kf')) {
  const s = document.createElement('style');
  s.id = 'spinner-kf';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
