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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
      <div style={panel}>
        <div style={panelHeader}>
          <div style={{ fontSize: '0.72rem', color: '#e10600', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>onTRACK</div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} style={formBody}>
          {error && <div style={errorBox}>{error}</div>}
          <label style={label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={input} />
          <label style={label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={input} />
          <button type="submit" disabled={loading} style={btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const panel = { width: '100%', maxWidth: 400, border: '1px solid #e5e5e5', overflow: 'hidden' };
const panelHeader = { background: '#15151e', padding: '1.75rem 2rem', borderBottom: '3px solid #e10600' };
const formBody = { background: '#fff', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: 12 };
const label = { fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555' };
const input = { padding: '0.6rem 0.75rem', border: '2px solid #e5e5e5', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s' };
const btn = {
  background: '#e10600', color: '#fff', border: 'none', padding: '0.8rem',
  cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginTop: 4,
};
const errorBox = { background: '#fff0f0', color: '#e10600', padding: '0.6rem 0.75rem', fontSize: '0.88rem', borderLeft: '3px solid #e10600' };
