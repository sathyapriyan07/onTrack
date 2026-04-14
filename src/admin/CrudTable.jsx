import { useState } from 'react';
import { ImageUpload } from '../components/ImageUpload';

/**
 * Generic CRUD table for admin pages.
 * Props:
 *   - data: array of rows
 *   - columns: [{ key, label, render? }]
 *   - onSave: async (row) => void  (create or update)
 *   - onDelete: async (id) => void
 *   - formFields: [{ key, label, type?, required?, folder? }]
 *   - emptyForm: object with default values
 */
export function CrudTable({ data = [], columns, onSave, onDelete, formFields, emptyForm }) {
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openNew() {
    setForm(emptyForm);
    setEditing('new');
    setError('');
  }

  function openEdit(row) {
    setForm({ ...row });
    setEditing(row);
    setError('');
  }

  function cancel() {
    setEditing(null);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete this record?`)) return;
    try {
      await onDelete(row.id);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <div style={styles.toolbar}>
        <button onClick={openNew} style={styles.addBtn}>+ Add New</button>
      </div>

      {editing && (
        <div style={styles.formBox}>
          <h3 style={{ marginTop: 0 }}>{editing === 'new' ? 'Create' : 'Edit'}</h3>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.formGrid}>
            {formFields.map(({ key, label, type = 'text', required, folder }) => (
              <div key={key} style={type === 'image' || type === 'textarea' ? styles.fieldFull : styles.field}>
                {type === 'image' ? (
                  <ImageUpload
                    label={label}
                    value={form[key] || ''}
                    onChange={(url) => setForm((f) => ({ ...f, [key]: url }))}
                    folder={folder || 'general'}
                  />
                ) : type === 'textarea' ? (
                  <>
                    <label style={styles.label}>{label}{required && ' *'}</label>
                    <textarea
                      value={form[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      style={styles.textarea}
                    />
                  </>
                ) : (
                  <>
                    <label style={styles.label}>{label}{required && ' *'}</label>
                    <input
                      type={type}
                      value={form[key] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      style={styles.input}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancel} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={columns.length + 1} style={styles.empty}>No records found.</td></tr>
            )}
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : (row[col.key] ?? '—')}</td>
                ))}
                <td>
                  <button onClick={() => openEdit(row)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(row)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  toolbar: { marginBottom: 12 },
  addBtn: {
    background: '#e10600', color: '#fff', border: 'none', padding: '0.5rem 1rem',
    borderRadius: 4, cursor: 'pointer', fontWeight: 600,
  },
  formBox: {
    background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8,
    padding: '1.25rem', marginBottom: '1.5rem',
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' },
  label: { fontWeight: 600, fontSize: '0.85rem' },
  input: { padding: '0.4rem', border: '1px solid #ddd', borderRadius: 4 },
  textarea: { padding: '0.4rem', border: '1px solid #ddd', borderRadius: 4, resize: 'vertical' },
  formActions: { display: 'flex', gap: 8, marginTop: 16 },
  saveBtn: {
    background: '#15151e', color: '#fff', border: 'none', padding: '0.5rem 1.25rem',
    borderRadius: 4, cursor: 'pointer', fontWeight: 600,
  },
  cancelBtn: {
    background: '#fff', border: '1px solid #ddd', padding: '0.5rem 1.25rem',
    borderRadius: 4, cursor: 'pointer',
  },
  error: { background: '#fff0f0', color: '#e10600', padding: '0.5rem', borderRadius: 4, marginBottom: 12 },
  tableWrapper: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#888' },
  editBtn: {
    background: '#f0f0f0', border: 'none', padding: '3px 10px',
    borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: '0.8rem',
  },
  deleteBtn: {
    background: '#fff0f0', color: '#e10600', border: 'none', padding: '3px 10px',
    borderRadius: 3, cursor: 'pointer', fontSize: '0.8rem',
  },
};
