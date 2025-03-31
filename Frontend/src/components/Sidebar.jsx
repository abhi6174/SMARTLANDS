import React from 'react';
import useBlockchain from '../hooks/useBlockchain';

const Sidebar = ({ activePage, setActivePage, setIsModalOpen }) => {
  const { account, accountBalance, handleLogout } = useBlockchain();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>SmartLands</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => setActivePage('dashboard')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </li>
          <li 
            className={activePage === 'mylands' ? 'active' : ''} 
            onClick={() => setActivePage('mylands')}
          >
            <i className="fas fa-map-marked-alt"></i>
            <span>My Properties</span>
          </li>
          <li 
            className={activePage === 'profile' ? 'active' : ''} 
            onClick={() => setActivePage('profile')}
          >
            <i className="fas fa-user"></i>
            <span>My Profile</span>
          </li>
          <li onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus-circle"></i>
            <span>Register Land</span>
          </li>
          <li 
            className={activePage === 'marketplace' ? 'active' : ''} 
            onClick={() => setActivePage('marketplace')}
          >
            <i className="fas fa-store"></i>
            <span>Marketplace</span>
          </li>
          <li 
            className={activePage === 'purchase-requests' ? 'active' : ''} 
            onClick={() => setActivePage('purchase-requests')}
          >
            <i className="fas fa-handshake"></i>
            <span>Purchase Requests</span>
          </li>
          
          <li 
            className={activePage === 'buyer-payment' ? 'active' : ''} 
            onClick={() => setActivePage('buyer-payment')}
            
          >
            <i className="fas fa-credit-card"></i>
            <span>Payment</span>
          </li>
          <li 
            className={activePage === 'settings' ? 'active' : ''} 
            onClick={() => setActivePage('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;