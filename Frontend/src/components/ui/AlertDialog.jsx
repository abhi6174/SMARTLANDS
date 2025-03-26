
import React from 'react';
import '@/styles/ui.css';

export default function AlertDialog({ 
  open, 
  onClose, 
  title, 
  children,
  actions
}) {
  if (!open) return null;

  return (
    <div className="alert-dialog-overlay">
      <div className="alert-dialog">
        <h3>{title}</h3>
        <div className="alert-dialog-content">{children}</div>
        <div className="alert-dialog-actions">
          {actions || (
            <button onClick={onClose} className="dialog-close-btn">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}