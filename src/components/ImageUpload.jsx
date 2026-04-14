import { useState, useRef } from 'react';
import { uploadImage } from '../services/storageService';

/**
 * Props:
 *   value      - current image URL (string)
 *   onChange   - (url: string) => void
 *   folder     - storage folder ('drivers' | 'constructors')
 *   label      - field label
 */
export function ImageUpload({ value, onChange, folder = 'general', label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP or GIF allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    // reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleUrlChange(e) {
    onChange(e.target.value);
    setError('');
  }

  function handleClear() {
    onChange('');
    setError('');
  }

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>{label}</label>

      {/* Preview */}
      {value && (
        <div style={styles.preview}>
          <img src={value} alt="preview" style={styles.previewImg} />
          <button type="button" onClick={handleClear} style={styles.clearBtn} title="Remove image">
            ✕
          </button>
        </div>
      )}

      {/* File picker */}
      <div style={styles.row}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={styles.uploadBtn}
        >
          {uploading ? '⏳ Uploading...' : '📁 Upload File'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Manual URL fallback */}
      <input
        type="url"
        value={value || ''}
        onChange={handleUrlChange}
        placeholder="…or paste image URL"
        style={styles.urlInput}
      />

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontWeight: 600, fontSize: '0.85rem' },
  preview: { position: 'relative', display: 'inline-block', width: 'fit-content' },
  previewImg: { height: 80, maxWidth: 160, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' },
  clearBtn: {
    position: 'absolute', top: -6, right: -6,
    background: '#e10600', color: '#fff', border: 'none',
    borderRadius: '50%', width: 20, height: 20, cursor: 'pointer',
    fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  row: { display: 'flex', gap: 8, alignItems: 'center' },
  uploadBtn: {
    background: '#15151e', color: '#fff', border: 'none',
    padding: '0.4rem 0.9rem', borderRadius: 4, cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
  },
  urlInput: { padding: '0.4rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85rem' },
  error: { color: '#e10600', fontSize: '0.8rem' },
};
