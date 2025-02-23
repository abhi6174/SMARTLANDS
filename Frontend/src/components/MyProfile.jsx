// src/components/MyProfile.jsx
import React from 'react';
import useBlockchain from '../hooks/useBlockchain';
import mockUsers from '../data/mockUsers'
const MyProfile = () => {
  const { account, accountBalance } = useBlockchain();

  return (
    <div className="profile-content">
      <h2>My Profile</h2>
      
      <div className="profile-details">
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info">
            <p><strong>Wallet Address:</strong> 
              <span className="address">{account}</span>
            </p>
            <p><strong>Balance:</strong> 
              {accountBalance !== null ? `${accountBalance.toFixed(4)} ETH` : 'Loading...'}
            </p>
            <p><strong>Network:</strong> Ethereum Testnet</p>
            <p><strong>Account Status:</strong> Active</p>
          </div>
        </div>        
      </div>
    </div>
  );
};

export default MyProfile;