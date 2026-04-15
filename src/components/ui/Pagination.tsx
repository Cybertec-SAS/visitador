import type { PaginationMeta } from '@/types/api';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, last_page } = meta;

  if (last_page <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, current_page - 2);
  const end = Math.min(last_page, current_page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page === 1}
        className="px-3 py-1.5 rounded-btn border border-line text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-soft transition-colors cursor-pointer"
      >
        Anterior
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 rounded-btn border border-line text-sm font-bold hover:bg-primary-soft transition-colors cursor-pointer"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-muted">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-btn border text-sm font-bold cursor-pointer transition-colors ${
            p === current_page
              ? 'bg-primary text-white border-primary'
              : 'border-line hover:bg-primary-soft'
          }`}
        >
          {p}
        </button>
      ))}
      {end < last_page && (
        <>
          {end < last_page - 1 && <span className="px-1 text-muted">...</span>}
          <button
            onClick={() => onPageChange(last_page)}
            className="px-3 py-1.5 rounded-btn border border-line text-sm font-bold hover:bg-primary-soft transition-colors cursor-pointer"
          >
            {last_page}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === last_page}
        className="px-3 py-1.5 rounded-btn border border-line text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-soft transition-colors cursor-pointer"
      >
        Siguiente
      </button>
    </nav>
  );
}
