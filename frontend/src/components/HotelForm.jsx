import { useState, useRef } from 'react';

// A single reusable form used for both "add hotel" and "edit hotel".
// initialData (optional) pre-fills the fields when editing.
// onSubmit receives a plain object: { title, description, latitude, longitude, price, imageFile }
export default function HotelForm({ initialData, onSubmit, submitting, submitLabel = 'Save Hotel' }) {
  const [values, setValues] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    latitude: initialData?.latitude ?? '',
    longitude: initialData?.longitude ?? '',
    price: initialData?.price ?? '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG or WEBP images are allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 5MB' }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function validate() {
    const next = {};
    if (!values.title.trim()) next.title = 'Title is required';
    else if (values.title.length > 150) next.title = 'Title must be 150 characters or fewer';

    if (!values.description.trim()) next.description = 'Description is required';

    const lat = Number(values.latitude);
    if (values.latitude === '' || !Number.isFinite(lat)) next.latitude = 'Enter a valid latitude';
    else if (lat < -90 || lat > 90) next.latitude = 'Latitude must be between -90 and 90';

    const lng = Number(values.longitude);
    if (values.longitude === '' || !Number.isFinite(lng)) next.longitude = 'Enter a valid longitude';
    else if (lng < -180 || lng > 180) next.longitude = 'Longitude must be between -180 and 180';

    const price = Number(values.price);
    if (values.price === '' || !Number.isFinite(price)) next.price = 'Enter a valid price';
    else if (price < 0 || price > 99999999.99) next.price = 'Price must be between 0 and 99999999.99';

    if (!initialData?.imageUrl && !imageFile) next.image = 'Please upload a hotel image';

    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({ ...values, imageFile });
  }

  return (
    <form className="hotel-form" onSubmit={handleSubmit} noValidate>
      <h2>{initialData ? 'Edit Hotel' : 'Add a New Hotel'}</h2>
      <p className="form-intro">Add the details that help guests discover this stay. All fields are required.</p>

      <div
        className="image-upload-box"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload hotel image"
        role="button"
        tabIndex={0}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Hotel preview" className="image-preview" />
        ) : (
          <span><strong className="upload-title">Choose a hotel photo</strong><span>JPEG, PNG or WEBP · up to 5MB</span></span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
      {errors.image && <p className="error-text">{errors.image}</p>}

      <div className="form-grid" style={{ marginTop: 18 }}>
        <div className="field-group span-2">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className={`input ${errors.title ? 'input-error' : ''}`}
            value={values.title}
            onChange={handleChange}
            placeholder="e.g. Ocean View Resort"
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>

        <div className="field-group span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`input ${errors.description ? 'input-error' : ''}`}
            value={values.description}
            onChange={handleChange}
            placeholder="Describe the hotel..."
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>

        <div className="span-2 form-section-heading">Location <span>Use the hotel’s map coordinates.</span></div>
        <div className="field-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            className={`input ${errors.latitude ? 'input-error' : ''}`}
            value={values.latitude}
            onChange={handleChange}
            placeholder="e.g. 10.7905"
          />
          {errors.latitude && <p className="error-text">{errors.latitude}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            className={`input ${errors.longitude ? 'input-error' : ''}`}
            value={values.longitude}
            onChange={handleChange}
            placeholder="e.g. 78.7047"
          />
          {errors.longitude && <p className="error-text">{errors.longitude}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="price">Price (per night)</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            className={`input ${errors.price ? 'input-error' : ''}`}
            value={values.price}
            onChange={handleChange}
            placeholder="e.g. 4500"
          />
          {errors.price && <p className="error-text">{errors.price}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
