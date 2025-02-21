// src/components/AccountDetails.jsx
import React from 'react';
import useBlockchain from '../hooks/useBlockchain';

const AccountDetails = () => {
  const { account, accountBalance } = useBlockchain();

  return (
    <div className="account-details-section">
      <h2>Account Overview</h2>
      <div className="account-info-card">
        <div>
          <p><strong>Connected Address:</strong> 
            <span className="address">{account}</span>
          </p>
          {accountBalance !== null && (
            <p><strong>Balance:</strong> {accountBalance.toFixed(4)} ETH</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;