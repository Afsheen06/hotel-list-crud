import HotelCard from './HotelCard';

export default function HotelList({ hotels, status, error, onEdit, onDeleteRequest }) {
  if (status === 'loading') {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Loading hotels...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="state-box">
        <h3>Something went wrong</h3>
        <p>{error || 'Could not load hotels. Please try again.'}</p>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="state-box">
        <h3>No hotels found</h3>
        <p>Try adjusting your search or filters, or add a new hotel to get started.</p>
      </div>
    );
  }

  return (
    <div className="hotel-grid">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
      ))}
    </div>
  );
}
