// src/components/Dashboard.jsx
import React from 'react';
import AccountDetails from './AccountDetails';
import useBlockchain from '../hooks/useBlockchain';

// components/Dashboard.jsx
const Dashboard = () => {
  const { userLands = [], isLoading } = useBlockchain(); // Default to empty array

  // Safe array operations
  const totalProperties = userLands.length;
  const verifiedProperties = userLands.filter(land => land.status === 'Verified').length;
  const pendingProperties = userLands.filter(land => land.status === 'Pending').length;

  return (
    <div className="dashboard-content">
      <AccountDetails />
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <p className="stat-value">{totalProperties}</p>
        </div>
        <div className="stat-card">
          <h3>Verified Properties</h3>
          <p className="stat-value">{verifiedProperties}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Verification</h3>
          <p className="stat-value">{pendingProperties}</p>
        </div>
      </div>
      
      <h3>Recent Registrations</h3>
      {isLoading ? (
        <div className="loading-indicator">Loading properties...</div>
      ) : userLands.length > 0 ? (
        <div className="recent-lands">
          {userLands.slice(0, 3).map(land => (
            <div key={land.landId || land._id} className="recent-land-item">
              <div>
                <h4>Property #{land.landId || land._id}</h4>
                <p>{land.village}, {land.taluk}, {land.district}</p>
              </div>
              <span className={`status-${land.status?.toLowerCase() || 'pending'}`}>
                {land.status || 'Pending'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>No properties registered yet.</p>
      )}
    </div>
  );
};

export default Dashboard;