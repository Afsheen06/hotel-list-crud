import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as hotelsApi from '../api/hotelsApi';
import HotelMap from '../components/HotelMap';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | succeeded | failed
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    hotelsApi
      .fetchHotelById(id)
      .then((res) => {
        if (!cancelled) {
          setHotel(res.data);
          setStatus('succeeded');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus('failed');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="page-container">
        <div className="state-box">
          <div className="spinner" />
          <p>Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed' || !hotel) {
    return (
      <div className="page-container">
        <div className="state-box">
          <h3>Hotel not found</h3>
          <p>{error || "This hotel doesn't exist or may have been deleted."}</p>
          <Link className="btn btn-primary" to="/" style={{ marginTop: 12 }}>
            Back to hotel list
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = hotelsApi.resolveImageUrl(hotel.image_path);

  return (
    <div className="page-container">
      <Helmet>
        <title>{`${hotel.title} | Hotel Details`}</title>
        <meta name="description" content={hotel.description.slice(0, 150)} />
      </Helmet>

      <Link to="/" className="back-link">← Back to hotel list</Link>

      <div className="detail-layout">
        <div>
          {imageUrl ? (
            <img src={imageUrl} alt={`Photo of ${hotel.title}`} className="detail-image" />
          ) : (
            <div className="hotel-card-media" style={{ height: 260, borderRadius: 10 }}>
              <span className="placeholder">No image available</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="detail-title">{hotel.title}</h1>
          <div className="detail-price">₹{Number(hotel.price).toLocaleString('en-IN')} <span className="price-unit">/ night</span></div>
          <div className="detail-meta">
            <span>Lat: {Number(hotel.latitude).toFixed(4)}</span>
            <span>Lng: {Number(hotel.longitude).toFixed(4)}</span>
          </div>
          <p>{hotel.description}</p>

          <h3 style={{ marginTop: 24 }}>Location</h3>
          <HotelMap key={hotel.id} latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />
        </div>
      </div>
    </div>
  );
}
