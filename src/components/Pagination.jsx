import { usePagination } from '../hooks/usePagination';
import { Icon } from './Icons';

export function Pagination({ items, pageSize = 20, renderItem, renderTable }) {
  const { paged, page, setPage, totalPages } = usePagination(items, pageSize);

  return (
    <div>
      {renderTable ? renderTable(paged) : paged.map(renderItem)}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 24, alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={btnStyle(page === 1)}
          >
            <Icon name="chevron_left" size={18} />
            Prev
          </button>
          <span style={{ color: 'var(--text3)', fontSize: '0.82rem', padding: '0 0.5rem' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={btnStyle(page === totalPages)}
          >
            Next
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle = (disabled) => ({
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '0.45rem 1rem',
  background: disabled ? 'var(--surface)' : 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  color: disabled ? 'var(--text3)' : 'var(--text)',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  transition: 'all 0.2s',
});
