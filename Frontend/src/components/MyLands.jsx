// src/components/MyLands.jsx
import React, { useState } from 'react';
import SearchBar from './SearchBar';
import LandCard from './LandCard';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/MyLands.css';
import { useLandContext } from '../context/LandContext';

const MyLands = () => {
  const { userLands: blockchainLands, isLoading, account } = useBlockchain();
  const { localLands } = useLandContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allLands = [...(blockchainLands || []), ...localLands];

  return (
    <>
      <SearchBar />
      
      <div className="registered-lands-section">
        <button 
          className="register-land-button"
          onClick={() => setIsModalOpen(true)}
          disabled={!account}
        >
          Register New Land
        </button>

        {isLoading ? (
          <div className="loading-indicator">Loading your land records...</div>
        ) : allLands.length > 0 ? (
          <div className="lands-grid">
            {allLands.map(land => (
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