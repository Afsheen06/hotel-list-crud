import { useState, useEffect } from 'react';

export default function SearchFilter({ filters, onApply }) {
  // Local draft state so typing doesn't refetch on every keystroke;
  // the parent only re-queries when "Apply" is clicked (or Enter is pressed).
  const [draft, setDraft] = useState(filters);

  useEffect(() => setDraft(filters), [filters]);

  function handleSubmit(e) {
    e.preventDefault();
    onApply(draft);
  }

  function handleReset() {
    const cleared = { title: '', minPrice: '', maxPrice: '' };
    setDraft(cleared);
    onApply(cleared);
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <div className="field-group" style={{ flex: '1 1 220px' }}>
        <label htmlFor="search-title">Search by title</label>
        <input
          id="search-title"
          className="input"
          placeholder="e.g. Ocean View"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
      </div>

      <div className="field-group">
        <label>Price per night (₹)</label>
        <div className="price-range-inputs">
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            placeholder="Min"
            aria-label="Minimum price"
            value={draft.minPrice}
            onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            placeholder="Max"
            aria-label="Maximum price"
            value={draft.maxPrice}
            onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">Apply</button>
      <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset filters</button>
    </form>
  );
}
