import { useEffect } from 'react'

export default function Modal({ show, onClose, title, children, size = '' }) {
  useEffect(() => {
    // Close modal on ESC key
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (show) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onClose} style={{ zIndex: 1060 }}>
      <div
        className={`modal-dialog modal-dialog-centered ${size}`}
        role="document"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 1061 }}
      >
        <div className="modal-content border-0 shadow" style={{ borderRadius: 16, position: 'relative', zIndex: 1062 }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
    </div>
  )
}

