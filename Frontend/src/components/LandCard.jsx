// src/components/LandCard.jsx
import React from 'react';
import '../styles/LandCard.css';
import useBlockchain from '../hooks/useBlockchain';
import { truncateHash } from '../utils/truncateHash'; // Import the utility function
const PORT = import.meta.env.VITE_PORT;

const LandCard = ({ land, isMarketplace }) => {
  const { account,currentUser } = useBlockchain();
  const viewLandDetails = (landId) => {
    alert(`Viewing details for property #${landId}`);
  };

  const handlePurchase = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/lands/purchase-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landId: land.landId, // Use land.landId (keccak hash)
          buyerAddress: account,
          buyerName: currentUser.name,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send purchase request");
      }
  
      const data = await response.json();
      alert(data.message); // Show success message
    } catch (error) {
      console.error("Error sending purchase request:", error);
      alert("Failed to send purchase request. Please try again.");
    }
  };

  return (
    <div className="land-card">
      {/* Truncate the landId using the utility function */}
      <h3 title={land.landId}>Property #{truncateHash(land.landId)}</h3>
      <div className="land-details">
        <p><strong>Owner:</strong> {land.ownerName}</p>
        <p><strong>Area:</strong> {land.landArea} {land.landUnit || 'SqFt'}</p>
        <p><strong>Location:</strong> {land.village}, {land.taluk}, {land.district}</p>
        <p><strong>Block/Survey:</strong> {land.blockNumber}/{land.surveyNumber}</p>
        <p><strong>Registration Date:</strong> {land.registrationDate}</p>
        <p><strong>Status:</strong> 
          <span className={`status-${land.status?.toLowerCase() || 'not-verified'}`}>
            {land.status || 'Not Verified'}
          </span>
        </p>
      </div>
      <button 
        className="view-details-button" 
        onClick={() => viewLandDetails(land._id)} 
      >
        View Complete Details
      </button>
      
      {/* Conditionally render the purchase button */}
      {isMarketplace && (
        <button 
          className="purchase-button" 
          onClick={handlePurchase}
        >
          Purchase Land
        </button>
      )}
    </div>
  );
};

export default LandCard;