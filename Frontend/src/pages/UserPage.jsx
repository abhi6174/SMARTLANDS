// src/pages/UserPage.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import MyLands from '../components/MyLands';
import MyProfile from '../components/MyProfile';
import RegisterLandModal from '../components/RegisterLandModal';
import '../styles/UserPage.css';
import useBlockchain from '../hooks/useBlockchain';
import LandMarketplace from "../components/LandMarketplace";

const UserPage = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { account, fetchUserLands } = useBlockchain(); // Add fetchUserLands

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
               'Account Settings'}</h2>
          <p className="blockchain-network">Network: Ethereum Testnet</p>
        </header>

        <div className="content-container">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'mylands' && <MyLands />}
          {activePage === 'profile' && <MyProfile />}
          {activePage === 'marketplace' && <LandMarketplace/>}
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
        fetchUserLands={fetchUserLands} // Pass fetchUserLands
      />
    </div>
  );
};

export default UserPage;