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
import BuyerPayment from "../components/BuyerPayment";

const UserPage = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { account, fetchUserLands } = useBlockchain();

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        setIsModalOpen={setIsModalOpen}
      />
      
      <main className="main-content">
        <header className="content-header">
          <h2>{activePage === 'dashboard' ? 'Dashboard' : 
               activePage === 'mylands' ? 'My Properties' : 
               activePage === 'profile' ? 'My Profile' : 
               activePage === 'marketplace' ? 'Land Marketplace' : 
               activePage === 'purchase-requests' ? 'Purchase Requests' : 
               activePage === 'buyer-payment'?'Payment section':
               'Account Settings'}</h2>
          <p className="blockchain-network">Network: Amoy Testnet</p>
        </header>

        <div className="content-container">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'mylands' && <MyLands />}
          {activePage === 'profile' && <MyProfile />}
          {activePage === 'marketplace' && <LandMarketplace />}
          {activePage === 'purchase-requests' && <PurchaseRequests />}
          {activePage === 'buyer-payment' && <BuyerPayment />}
          {activePage === 'settings' && (
            <div className="placeholder-content">
              <h3>Account Settings</h3>
              <p>Account preferences and blockchain settings.</p>
            </div>
          )}
        </div>
      </main>

      <RegisterLandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={account}
        fetchUserLands={fetchUserLands}
      />
    </div>
  );
};

export default UserPage;