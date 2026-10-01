export default function Pagination({ total, limit, offset, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  if (total === 0) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 2)}
      >
        ← Prev
      </button>
      <span>
        Page {currentPage} of {totalPages} ({total} hotel{total !== 1 ? 's' : ''})
      </span>
      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage)}
      >
        Next →
      </button>
    </div>
  );
}
