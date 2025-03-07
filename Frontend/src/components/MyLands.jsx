// src/components/MyLands.jsx
import React from 'react';
import SearchBar from './SearchBar';
import LandCard from './LandCard';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/MyLands.css';

const MyLands = () => {
  const { userLands, isLoading, account } = useBlockchain();

  return (
    <>
      <SearchBar />
      
      <div className="registered-lands-section">
        {isLoading ? (
          <div className="loading-indicator">Loading your land records...</div>
        ) : userLands.length > 0 ? (
          <div className="lands-grid">
            {userLands.map(land => (
              <LandCard key={land.landId} land={land} /> 
            ))}
          </div>
        ) : (
          <div className="no-lands-message">
            <p>You don't have any registered lands yet.</p>
            <p>Click "Register New Land" in the sidebar to add your first property.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyLands;