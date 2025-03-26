import React from 'react';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/MyProfile.css';

const MyProfile = () => {
  const { account, accountBalance, currentUser } = useBlockchain();

  return (
    <div className="profile-content">
      <div className="profile-details">
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info">
            {currentUser ? (
              <>
                <p><strong>Name:</strong> 
                  <span className="name">{currentUser.name || 'Not available'}</span>
                </p>
                <p><strong>Email:</strong> 
                  <span className="email">{currentUser.email || 'Not available'}</span>
                </p>
              </>
            ) : (
              <p className="loading-text">Loading user data...</p>
            )}
            <p><strong>Wallet Address:</strong> 
              <span className="address">{account ? truncateHash(account) : 'Not connected'}</span>
            </p>
            <p><strong>Balance:</strong> 
              {accountBalance !== null ? `${accountBalance.toFixed(4)} ETH` : 'Loading...'}
            </p>
            <p><strong>Network:</strong> Ethereum Testnet</p>
            <p><strong>Account Status:</strong> 
              <span className="status-badge">Active</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;