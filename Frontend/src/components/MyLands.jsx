// src/components/MyLands.jsx
import React from 'react';
import SearchBar from './SearchBar';
import LandCard from './LandCard';
import useBlockchain from '../hooks/useBlockchain';

const MyLands = () => {
  const { userLands, isLoading } = useBlockchain();

  return (
    <>
      <SearchBar />
      
      <div className="registered-lands-section">
        {isLoading ? (
          <div className="loading-indicator">Loading your land records...</div>
        ) : userLands.length > 0 ? (
          <div className="lands-grid">
            {userLands.map(land => (
              <LandCard key={land.id} land={land} />
            ))}
          </div>
        ) : (
          <div className="no-lands-message">
            <p>You don't have any registered lands yet.</p>
            <p>Click "Register New Land" to add your first property.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyLands;