import { useState, useMemo } from 'react';

export function usePagination(items = [], pageSize = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );
  return { paged, page, setPage, totalPages };
}
