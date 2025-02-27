// src/components/LandCard.jsx
import React from 'react';
import '../styles/LandCard.css';

const LandCard = ({ land }) => {
  const viewLandDetails = (landId) => {
    alert(`Viewing details for property #${landId}`);
  };

  return (
    <div className="land-card">
      <h3>Property #{land._id}</h3> {/* Use _id */}
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
    </div>
  );
};

export default LandCard;