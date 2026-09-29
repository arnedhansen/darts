type Props = {
  open: boolean;
  onClose: () => void;
};

export function InstallHint({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>INSTALL ON IPAD</h2>
        <p>
          In Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
          The app opens fullscreen and works offline after the first visit.
        </p>
        <div className="modal-actions">
          <button type="button" className="primary-btn" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
