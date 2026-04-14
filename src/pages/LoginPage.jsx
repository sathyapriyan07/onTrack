import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem', background: 'var(--bg)' }}>
      <div style={panel}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>onTRACK</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--white)' }}>Sign In</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginTop: 8 }}>Admin access only</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#ff6b6b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const panel = {
  width: '100%',
  maxWidth: 400,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: '2.5rem 2rem',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
};
const labelStyle = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.78rem',
  color: 'var(--text3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 7,
};
const inputStyle = {
  width: '100%',
  padding: '0.7rem 1rem',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: '0.95rem',
  color: 'var(--white)',
  outline: 'none',
  transition: 'border-color 0.2s',
};
const btnStyle = {
  width: '100%',
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  padding: '0.85rem',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.95rem',
  marginTop: 6,
  transition: 'opacity 0.2s',
};
