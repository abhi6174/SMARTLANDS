// src/components/LandCard.jsx
import React from 'react';

const LandCard = ({ land }) => {
  const viewLandDetails = (landId) => {
    alert(`Viewing details for property #${landId}`);
  };

  return (
    <div className="land-card">
      <h3>Property </h3>
      <div className="land-details">
        <p><strong>Location:</strong> {land.location}</p>
        <p><strong>Area:</strong> {land.area}</p>
        <p><strong>Price:</strong> {land.price}</p>
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