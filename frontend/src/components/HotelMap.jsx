import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const hotelIcon = L.icon({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

function MapView({ latitude, longitude, userPosition }) {
  const map = useMap();
  useEffect(() => {
    if (userPosition) {
      map.fitBounds([[latitude, longitude], userPosition], { padding: [35, 35], maxZoom: 15 });
    } else {
      map.setView([latitude, longitude], 13);
    }
  }, [map, latitude, longitude, userPosition]);
  return null;
}

export default function HotelMap({ latitude, longitude, title }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [tileAttempt, setTileAttempt] = useState(0);

  useEffect(() => {
    if (tilesLoaded) return;
    const timer = setTimeout(() => setTileError(true), 12000);
    return () => clearTimeout(timer);
  }, [tilesLoaded, tileAttempt]);

  function showMyLocation() {
    if (!navigator.geolocation) {
      setMessage('Your browser does not support location access. The hotel location is still shown.');
      return;
    }
    setLocating(true);
    setMessage('Finding your location...');
    // Browser permission is requested only after the user clicks the button.
    // The visitor coordinates stay in this component; they are never saved to the database.
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition([coords.latitude, coords.longitude]);
        setMessage('Your location is shown as a blue circle. The pin marks the hotel.');
        setLocating(false);
      },
      (error) => {
        const errors = {
          1: 'Location permission was denied. Allow location access in your browser to try again.',
          2: 'Your location is currently unavailable. Please try again.',
          3: 'Finding your location timed out. Please try again.',
        };
        setMessage(errors[error.code] || 'Could not get your location. Please try again.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function retryTiles() {
    setTilesLoaded(false);
    setTileError(false);
    setTileAttempt((value) => value + 1);
  }

  return (
    <section aria-label="Hotel location map">
      <div className="map-box">
        <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            key={tileAttempt}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileload: () => { setTilesLoaded(true); setTileError(false); },
              tileerror: () => setTileError(true),
            }}
          />
          <Marker icon={hotelIcon} position={[lat, lng]} alt={`Location of ${title}`}>
            <Popup>{title}</Popup>
          </Marker>
          {userPosition && (
            <CircleMarker center={userPosition} radius={9} pathOptions={{ color: '#1769aa', fillOpacity: 0.8 }}>
              <Popup>Your current location</Popup>
            </CircleMarker>
          )}
          <MapView latitude={lat} longitude={lng} userPosition={userPosition} />
        </MapContainer>
      </div>
      {tileError && (
        <p role="status" className="error-text">
          Map images could not load. Check your internet connection.{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={retryTiles}>Retry map</button>
        </p>
      )}
      <div className="map-actions">
        <button type="button" className="btn btn-secondary" onClick={showMyLocation} disabled={locating}>
          {locating ? 'Finding your location...' : 'Show my location'}
        </button>
      </div>
      <p role="status" aria-live="polite">{message}</p>
    </section>
  );
}

