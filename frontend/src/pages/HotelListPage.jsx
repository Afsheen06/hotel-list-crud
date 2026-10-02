import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { loadHotels, removeHotel, setFilters, setPage } from '../features/hotels/hotelsSlice';
import * as hotelsApi from '../api/hotelsApi';
import HotelList from '../components/HotelList';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import HotelForm from '../components/HotelForm';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Toast from '../components/Toast';

export default function HotelListPage() {
  const dispatch = useDispatch();
  const { items, total, limit, offset, filters, status, error } = useSelector((s) => s.hotels);

  const [formMode, setFormMode] = useState(null); // null | 'add' | { edit: hotel }
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [hotelPendingDelete, setHotelPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(loadHotels());
  }, [dispatch, filters, offset]);

  async function handleAddSubmit(values) {
    setSubmitting(true);
    setFormError(null);
    try {
      await hotelsApi.createHotel(values);
      setFormMode(null);
      dispatch(loadHotels());
      setToastMessage('Hotel added successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(values) {
    setSubmitting(true);
    setFormError(null);
    try {
      await hotelsApi.updateHotel(formMode.edit.id, values);
      setFormMode(null);
      dispatch(loadHotels());
      setToastMessage('Hotel updated successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete(id) {
    setDeleting(true);
    try {
      await dispatch(removeHotel(id)).unwrap();
      setHotelPendingDelete(null);
      setToastMessage('Hotel deleted successfully');
      // If we just deleted the last item on this page (and it's not page 1), step back a page
      if (items.length === 1 && offset > 0) {
        dispatch(setPage(offset / limit - 1));
      } else {
        dispatch(loadHotels());
      }
    } catch (err) {
      setToastMessage(`Delete failed: ${err}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-container">
      <Helmet>
        <title>Hotels | Browse and Manage Listings</title>
        <meta
          name="description"
          content="Browse, search and manage hotel listings with prices, descriptions and map locations."
        />
      </Helmet>

      {formMode ? (
        <>
          <button className="back-link" onClick={() => { setFormMode(null); setFormError(null); }}>
            ← Back to hotel list
          </button>
          {formError && <p className="error-text" style={{ maxWidth: 640, margin: '0 auto 12px' }}>{formError}</p>}
          <HotelForm
            key={formMode === 'add' ? 'add' : formMode.edit.id}
            initialData={
              formMode === 'add'
                ? null
                : {
                    title: formMode.edit.title,
                    description: formMode.edit.description,
                    latitude: formMode.edit.latitude,
                    longitude: formMode.edit.longitude,
                    price: formMode.edit.price,
                    imageUrl: formMode.edit.image_path
                      ? hotelsApi.resolveImageUrl(formMode.edit.image_path)
                      : null,
                  }
            }
            onSubmit={formMode === 'add' ? handleAddSubmit : handleEditSubmit}
            submitting={submitting}
            submitLabel={formMode === 'add' ? 'Add Hotel' : 'Save Changes'}
          />
        </>
      ) : (
        <>
          <div className="list-heading">
            <div><p className="eyebrow">EXPLORE & DISCOVER</p><h2>Find your next stay</h2>
            <p className="page-intro">A little inspiration for your next getaway. Find a hotel that feels right.</p></div>
            <button className="btn btn-primary" onClick={() => setFormMode('add')}>
              + Add Hotel
            </button>
          </div>

          <SearchFilter filters={filters} onApply={(next) => dispatch(setFilters(next))} />

          <p className="results-summary" role="status">{status === 'loading' ? 'Finding hotels…' : status === 'failed' ? 'Unable to load hotels' : `${total} ${total === 1 ? 'hotel' : 'hotels'} found`}</p>

          <HotelList
            hotels={items}
            status={status}
            error={error}
            onEdit={(hotel) => setFormMode({ edit: hotel })}
            onDeleteRequest={(hotel) => setHotelPendingDelete(hotel)}
          />

          <Pagination
            total={total}
            limit={limit}
            offset={offset}
            onPageChange={(page) => dispatch(setPage(page))}
          />
        </>
      )}

      <ConfirmDeleteModal
        hotel={hotelPendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHotelPendingDelete(null)}
        deleting={deleting}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
