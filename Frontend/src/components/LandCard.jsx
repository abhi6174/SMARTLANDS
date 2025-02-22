// src/components/LandCard.jsx
import React from 'react';
import '../styles/LandCard.css';
const LandCard = ({ land }) => {
  const viewLandDetails = (landId) => {
    alert(`Viewing details for property #${landId}`);
  };

  return (
    <div className="land-card">
      <h3>Property </h3>
      <div className="land-details">
        <p><strong>Owner:</strong> {land.ownerName}</p>
        <p><strong>Area:</strong> {land.landArea} sqft</p>
        <p><strong>Location:</strong> {land.village}, {land.taluk}, {land.district}</p>
        <p><strong>Block/Survey:</strong> {land.blockNo}/{land.surveyNo}</p>
        <p><strong>Registration Date:</strong> {land.registrationDate}</p>
        <p><strong>Status:</strong> 
          <span className={`status-${land.status.toLowerCase()}`}>
            {land.status}
          </span>
        </p>
      </div>
      <button 
        className="view-details-button" 
        onClick={() => viewLandDetails(land.id)}
      >
        View Complete Details
      </button>
    </div>
  );
};

export default LandCard;