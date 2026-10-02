// Thin wrapper around fetch() for all hotel-related HTTP calls.
// Kept separate from Redux so the request logic is easy to read/test on its own.
//
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.error || 'Request failed');
    error.fields = body.fields;
    error.status = res.status;
    throw error;
  }
  return body;
}

function buildFormData(hotel) {
  const formData = new FormData();
  formData.append('title', hotel.title);
  formData.append('description', hotel.description);
  formData.append('latitude', hotel.latitude);
  formData.append('longitude', hotel.longitude);
  formData.append('price', hotel.price);
  if (hotel.imageFile) {
    formData.append('image', hotel.imageFile);
  }
  return formData;
}

export async function fetchHotels(params = {}) {
  const { title = '', minPrice = '', maxPrice = '', limit = 6, offset = 0 } = params;
  const query = new URLSearchParams();
  if (title) query.set('title', title);
  if (minPrice !== '') query.set('minPrice', minPrice);
  if (maxPrice !== '') query.set('maxPrice', maxPrice);
  query.set('limit', limit);
  query.set('offset', offset);

  const res = await fetch(`${API_BASE_URL}/hotels?${query.toString()}`);
  return handleResponse(res);
}

export async function fetchHotelById(id) {
  const res = await fetch(`${API_BASE_URL}/hotels/${id}`);
  return handleResponse(res);
}

export async function createHotel(hotel) {
  const res = await fetch(`${API_BASE_URL}/hotels`, {
    method: 'POST',
    body: buildFormData(hotel),
  });
  return handleResponse(res);
}

export async function updateHotel(id, hotel) {
  const res = await fetch(`${API_BASE_URL}/hotels/${id}`, {
    method: 'PUT',
    body: buildFormData(hotel),
  });
  return handleResponse(res);
}

export async function deleteHotel(id) {
  const res = await fetch(`${API_BASE_URL}/hotels/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  if (/^(https?:|blob:)/.test(imagePath)) return imagePath;
  return `${IMAGE_BASE_URL}${imagePath}`;
}
