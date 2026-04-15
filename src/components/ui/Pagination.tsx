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
        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Anterior
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-gray-400">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded border text-sm ${
            p === current_page
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
          }`}
        >
          {p}
        </button>
      ))}
      {end < last_page && (
        <>
          {end < last_page - 1 && <span className="px-1 text-gray-400">...</span>}
          <button
            onClick={() => onPageChange(last_page)}
            className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {last_page}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === last_page}
        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Siguiente
      </button>
    </nav>
  );
}
