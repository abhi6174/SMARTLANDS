import React, { useState } from 'react';
import '../styles/LandCard.css';
import useBlockchain from "../hooks/useBlockchain";
import { truncateHash } from "../utils/truncateHash";
import { formatPrice } from "../utils/formatPrice";
import axios from 'axios';

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
        <p>Price: {formatPrice(land.price)} MATIC</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Message to Owner:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to the property owner..."
              required
              rows={4}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const PORT = import.meta.env.VITE_PORT;

  const handleViewDocument = () => {
    if (!land.documentHash) {
      alert("No documents available for this property");
      return;
    }
    window.open(`https://gateway.pinata.cloud/ipfs/${land.documentHash}`, '_blank');
  };

  const handlePurchaseRequest = async (message) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/api/lands/purchase-request`,
        {
          landId: land.landId,
          buyerAddress: account,
          buyerName: currentUser?.name || "Anonymous Buyer",
          message
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Request failed");
      }

      alert(response.data.message);
      setShowPurchaseModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 
              err.response?.data?.message || 
              err.message || 
              "Failed to send request");
      console.error("Purchase request error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`land-card ${land.status?.toLowerCase()}`}>
      <div className="card-header">
        <h3>{land.district}, {land.village}</h3>
        <span className="status-badge">{land.status}</span>
        {land.price && (
          <span className="price-badge">{formatPrice(land.price)} MATIC</span>
        )}
      </div>

      <div className="card-body">
        <div className="land-details">
          <p><span>Owner:</span> {land.ownerName || truncateHash(land.walletAddress)}</p>
          <p><span>Area:</span> {land.landArea} sq.ft</p>
          <p><span>Location:</span> {land.taluk}</p>
          <p><span>Survey:</span> {land.blockNumber}/{land.surveyNumber}</p>
        </div>

        <div className="card-footer">
          {land.documentHash && (
            <button className="btn doc-btn" onClick={handleViewDocument}>
              View Documents
            </button>
          )}

          {isMarketplace && (
            <button 
              className="btn purchase-btn" 
              onClick={() => setShowPurchaseModal(true)}
              disabled={!account}
            >
              {account ? 'Request to Purchase' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

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