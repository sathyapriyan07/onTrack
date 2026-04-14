import { useState } from 'react';

export function SearchFilter({ placeholder = 'Search...', onFilter }) {
  const [value, setValue] = useState('');

  function handleChange(e) {
    setValue(e.target.value);
    onFilter(e.target.value);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ padding: '0.5rem 0.75rem', width: '100%', maxWidth: 340, marginBottom: 14, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.95rem' }}
    />
  );
}
