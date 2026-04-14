import { useState } from 'react';
import { Icon } from './Icons';

export function SearchFilter({ placeholder = 'Search...', onFilter }) {
  const [value, setValue] = useState('');

  function handleChange(e) {
    setValue(e.target.value);
    onFilter(e.target.value);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <Icon name="search" size={18} style={{ position: 'absolute', left: 12, color: 'var(--text3)', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          padding: '0.55rem 1rem 0.55rem 2.25rem',
          width: 260,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          fontSize: '0.88rem',
          color: 'var(--text)',
          outline: 'none',
          transition: 'border-color 0.25s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border2)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}
