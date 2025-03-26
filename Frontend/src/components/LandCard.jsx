import React, { useState } from 'react';
import '../styles/LandCard.css';
import useBlockchain from "../hooks/useBlockchain";
import { truncateHash } from "../utils/truncateHash";
import DocumentViewerModal from "./DocumentViewerModal";
import PurchaseRequests from "./PurchaseRequests";

// Add this new component at the top of the file
const PurchaseRequestModal = ({ land, onClose, onSubmit, isProcessing, error }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message);
  };

  return (
    <div className="purchase-modal-overlay">
      <div className="purchase-modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Request to Purchase</h3>
        <p>Property: {land.district}, {land.village}</p>
        <p>Owner: {land.ownerName}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Message to Owner:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to the property owner..."
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LandCard = ({ land, isMarketplace }) => {
  const { account, currentUser } = useBlockchain();
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleViewDetails = () => {
    console.log("Viewing details for:", land.landId);
  };

  const handleViewDocument = () => {
    if (!land.documentHash) {
      alert("No documents available for this property");
      return;
    }
    setShowDocumentModal(true);
  };

  const handlePurchaseRequest = async (message) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lands/purchase-request', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landId: land.landId,
          buyerAddress: account,
          buyerName: currentUser?.name || "Anonymous Buyer",
          message
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      alert(`Request sent! ${data.message}`);
      setShowPurchaseModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`land-card ${land.status?.toLowerCase()}`}>
      <div className="card-header">
        <h3>{land.district}, {land.village}</h3>
        <span className="status-badge">{land.status}</span>
      </div>

      <div className="card-body">
        <div className="land-details">
          <p><span>Owner:</span> {land.ownerName || land.walletAddress}</p>
          <p><span>Area:</span> {land.landArea} sq.ft</p>
          <p><span>Location:</span> {land.taluk}</p>
          <p><span>Survey:</span> {land.blockNumber}/{land.surveyNumber}</p>
        </div>

        <div className="card-footer">
          <button className="btn view-btn" onClick={handleViewDetails}>
            Details
          </button>
          
          {land.documentHash && (
            <button className="btn doc-btn" onClick={handleViewDocument}>
              Documents
            </button>
          )}

          {isMarketplace && (
            <button 
              className="btn purchase-btn" 
              onClick={() => setShowPurchaseModal(true)}
              disabled={!account}
            >
              {account ? 'Purchase' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      {showDocumentModal && (
        <DocumentViewerModal
          ipfsHash={land.documentHash}
          onClose={() => setShowDocumentModal(false)}
        />
      )}

      {showPurchaseModal && (
        <PurchaseRequestModal
          land={land}
          onClose={() => setShowPurchaseModal(false)}
          onSubmit={handlePurchaseRequest}
          isProcessing={isProcessing}
          error={error}
        />
      )}
    </div>
  );
};

export default LandCard;