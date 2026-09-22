interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}