import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import MyLands from '../components/MyLands';
import MyProfile from '../components/MyProfile';
import RegisterLandModal from '../components/RegisterLandModal';
import PurchaseRequests from '../components/PurchaseRequests';
import '../styles/UserPage.css';
import useBlockchain from '../hooks/useBlockchain';
import LandMarketplace from "../components/LandMarketplace";

const UserPage = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { account, currentUser, isLoading, error } = useBlockchain();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading application data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error Loading Application</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="error-screen">
        <h2>User Not Found</h2>
        <p>No user data available for the connected wallet</p>
        <button onClick={() => window.location.href = '/'}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        setIsModalOpen={setIsModalOpen}
      />
      
      <main className="main-content">
        <header className="content-header">
          <h2>
            {activePage === 'dashboard' ? 'Dashboard' : 
             activePage === 'mylands' ? 'My Properties' : 
             activePage === 'profile' ? 'My Profile' : 
             activePage === 'marketplace' ? 'Land Marketplace' : 
             activePage === 'purchase-requests' ? 'Purchase Requests' : 
             'Account Settings'}
          </h2>
          <p className="blockchain-network">Network: Ethereum Testnet</p>
        </header>

        <div className="content-container">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'mylands' && <MyLands />}
          {activePage === 'profile' && <MyProfile />}
          {activePage === 'marketplace' && <LandMarketplace />}
          {activePage === 'purchase-requests' && <PurchaseRequests />}
        </div>
      </main>

      <RegisterLandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={account}
        fetchUserLands={() => fetchUserLands(account)}
      />
    </div>
  );
};

export default UserPage;