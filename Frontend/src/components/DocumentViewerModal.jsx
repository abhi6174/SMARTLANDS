import React from 'react';
import '../styles/DocumentViewerModal.css';
const DocumentViewerModal = ({ ipfsHash, onClose }) => {
    console.log(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
  return (
    <div className="document-modal-overlay">
      <div className="document-modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h3>Property Documents</h3>
        <iframe 
          src={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
          title="Property Document"
          className="document-viewer"
        />
        <div className="document-actions">
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="open-external"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;