type Props = {
  open: boolean;
  onClose: () => void;
};

export function InstallHint({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>AUF DEM IPAD INSTALLIEREN</h2>
        <p>
          In Safari auf <strong>Teilen</strong> tippen, dann{' '}
          <strong>Zum Home-Bildschirm</strong>. Danach startet die App im Vollbild und
          funktioniert auch offline.
        </p>
        <div className="modal-actions">
          <button type="button" className="primary-btn" onClick={onClose}>
            VERSTANDEN
          </button>
        </div>
      </div>
    </div>
  );
}
