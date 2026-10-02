import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../api/hotelsApi';

export default function HotelCard({ hotel, onEdit, onDeleteRequest }) {
  const imageUrl = resolveImageUrl(hotel.image_path);

  return (
    <div className="hotel-card">
      <Link to={`/hotels/${hotel.id}`} className="hotel-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={`Photo of ${hotel.title}`} />
        ) : (
          <span className="placeholder">No image available</span>
        )}
      </Link>
      <div className="hotel-card-body">
        <h3 className="hotel-card-title">
          <Link className="hotel-card-link" to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
        </h3>
        <div className="hotel-card-price">₹{Number(hotel.price).toLocaleString('en-IN')} <span className="price-unit">/ night</span></div>
        <p className="hotel-card-desc">{hotel.description}</p>
        <div className="hotel-card-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(hotel)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDeleteRequest(hotel)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
