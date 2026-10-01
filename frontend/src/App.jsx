import { Routes, Route, Link } from 'react-router-dom';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';

export default function App() {
  return (
    <div>
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <h1>Hotel Listings</h1>
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-container">
      <div className="state-box">
        <h3>Page not found</h3>
        <Link className="btn btn-primary" to="/" style={{ marginTop: 12 }}>
          Go home
        </Link>
      </div>
    </div>
  );
}
