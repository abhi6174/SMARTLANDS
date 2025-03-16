// src/components/MyProfile.jsx
import React from 'react';
import useBlockchain from '../hooks/useBlockchain';

const MyProfile = () => {
  const { account, accountBalance,currentUser } = useBlockchain();

  return (
    <div className="profile-content">

      
      <div className="profile-details">
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info">
            <p><strong>Name:</strong> 
              <span className="name">{currentUser.name}</span>
            </p>
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