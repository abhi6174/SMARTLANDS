// src/components/Dashboard.jsx
import React from 'react';
import AccountDetails from './AccountDetails';
import useBlockchain from '../hooks/useBlockchain';

const Dashboard = () => {
  const { userLands } = useBlockchain();

  return (
    <div className="dashboard-content">
      
      <AccountDetails />
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <p className="stat-value">{userLands.length}</p>
        </div>
        <div className="stat-card">
          <h3>Verified Properties</h3>
          <p className="stat-value">
            {userLands.filter(land => land.status === 'Verified').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Pending Verification</h3>
          <p className="stat-value">
            {userLands.filter(land => land.status === 'Pending').length}
          </p>
        </div>
      </div>
      
      <h3>Recent Registrations</h3>
      {userLands.length > 0 ? (
        <div className="recent-lands">
          {userLands.slice(0, 3).map(land => (
            <div key={land.landId} className="recent-land-item"> {/* Use _id */}
              <div>
                <h4>Property #{land.landId}</h4>
                <p>{land.village}, {land.taluk}, {land.district}</p>
              </div>
              <span className={`status-${land.status.toLowerCase()}`}>
                {land.status}
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