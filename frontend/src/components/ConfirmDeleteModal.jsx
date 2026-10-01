export default function ConfirmDeleteModal({ hotel, onConfirm, onCancel, deleting }) {
  if (!hotel) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Delete hotel?</h3>
        <p>
          Are you sure you want to delete <strong>{hotel.title}</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={() => onConfirm(hotel.id)} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
