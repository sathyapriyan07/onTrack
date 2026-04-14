import { usePagination } from '../hooks/usePagination';

export function Pagination({ items, pageSize = 20, renderItem, renderTable }) {
  const { paged, page, setPage, totalPages } = usePagination(items, pageSize);

  return (
    <div>
      {renderTable ? renderTable(paged) : paged.map(renderItem)}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
