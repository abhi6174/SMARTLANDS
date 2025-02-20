import React, { useState, useEffect } from "react";
import "../styles/UserPage.css";
import RegisterLandModal from "../components/RegisterLandModal";

const UserPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [account, setAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(null);
    const [userLands, setUserLands] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

    useEffect(() => {
        const storedAccount = localStorage.getItem("connectedAccount");
        if (!storedAccount) {
            window.location.href = "/";
        } else {
            setAccount(storedAccount);
            fetchAccountDetails(storedAccount);
            fetchUserLands(storedAccount);
        }
    }, []);

    const fetchAccountDetails = async (address) => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const balance = await ethereum.request({
                    method: "eth_getBalance",
                    params: [address, "latest"]
                });
                // Convert balance from wei to ETH
                setAccountBalance(parseInt(balance, 16) / Math.pow(10, 18));
            }
        } catch (error) {
            console.error("Error fetching account details:", error);
        }
    };

    const fetchUserLands = async (address) => {
        setIsLoading(true);
        try {
            // Dummy data - replace with actual blockchain data
            const allLands = [
                {
                    id: 1,
                    owner: "0x1234567890123456789012345678901234567890",
                    location: "123 Blockchain Street",
                    area: "1000 sq ft",
                    price: "2.5 ETH",
                    registrationDate: "2024-02-18",
                    status: "Verified",
                    coordinates: "12.9716° N, 77.5946° E",
                    documentHash: "0x3a1c9d02e..."
                },
                {
                    id: 2,
                    owner: "0x1234567890123456789012345678901234567890",
                    location: "456 Crypto Avenue",
                    area: "1500 sq ft",
                    price: "3.2 ETH",
                    registrationDate: "2024-02-17",
                    status: "Pending",
                    coordinates: "13.0827° N, 80.2707° E",
                    documentHash: "0x8f1e6b43d..."
                },
                {
                    id: 3,
                    owner: "0x9876543210987654321098765432109876543210",
                    location: "789 Ethereum Road",
                    area: "2000 sq ft",
                    price: "4.0 ETH",
                    registrationDate: "2024-02-15",
                    status: "Verified",
                    coordinates: "28.7041° N, 77.1025° E",
                    documentHash: "0x5d2c8a17b..."
                }
            ];

            // Get from localStorage to persist new registrations during the session
            const newRegistrations = JSON.parse(localStorage.getItem('newLandRegistrations') || '[]');
            
            // Combine predefined lands with any new registrations
            const combinedLands = [...allLands, ...newRegistrations];

            // Filter lands by the connected address
            const filteredLands = combinedLands.filter(land => 
                land.owner.toLowerCase() === address.toLowerCase()
            );
            
            setUserLands(filteredLands);
        } catch (error) {
            console.error("Error fetching user lands:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        
        // Filter user lands based on search query
        const filteredResults = userLands.filter(land => 
            land.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            land.registrationDate.includes(searchQuery) ||
            land.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setUserLands(filteredResults);
    };

    const resetSearch = () => {
        setSearchQuery("");
        fetchUserLands(account);
    };

    const handleLogout = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                await ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [{ eth_accounts: {} }]
                });
            }
            localStorage.setItem("forceLogin", "true");
            localStorage.removeItem("connectedAccount");
            setAccount(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const viewLandDetails = (landId) => {
        // In a real app, this would navigate to a detailed view
        alert(`Viewing details for property #${landId}`);
    };

    const handleNewLandRegistration = () => {
        setIsModalOpen(true);
    };
    
    const handleRegistrationSuccess = async () => {
        // In a real application, this would trigger a blockchain transaction
        // For now, we'll simulate it by adding to localStorage
        
        // Get existing registrations or initialize empty array
        const existingRegistrations = JSON.parse(localStorage.getItem('newLandRegistrations') || '[]');
        
        // Create a new registration with dummy data
        const newRegistration = {
            id: existingRegistrations.length + 4, // Start after our dummy data
            owner: account,
            location: document.getElementById('location').value,
            area: document.getElementById('area').value + " sq ft",
            price: document.getElementById('price').value + " ETH",
            registrationDate: new Date().toISOString().split('T')[0],
            status: "Pending",
            coordinates: document.getElementById('coordinates').value,
            documentHash: document.getElementById('documentHash').value
        };
        
        // Add to existing registrations
        existingRegistrations.push(newRegistration);
        
        // Save back to localStorage
        localStorage.setItem('newLandRegistrations', JSON.stringify(existingRegistrations));
        
        // Refresh the lands display
        fetchUserLands(account);
    };

    // Render the Dashboard content
    const renderDashboard = () => (
        <>
            {/* Account Details Section */}
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
                
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>Total Properties</h3>
                        <p className="stat-value">{userLands.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Verified Properties</h3>
                        <p className="stat-value">
                            {userLands.filter(land => land.status === "Verified").length}
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending Verification</h3>
                        <p className="stat-value">
                            {userLands.filter(land => land.status === "Pending").length}
                        </p>
                    </div>
                </div>
                
                <h3>Recent Registrations</h3>
                {userLands.length > 0 ? (
                    <div className="recent-lands">
                        {userLands.slice(0, 3).map(land => (
                            <div key={land.id} className="recent-land-item">
                                <div>
                                    <h4>Property #{land.id}</h4>
                                    <p>{land.location}</p>
                                </div>
                                <span className={`status-${land.status.toLowerCase()}`}>
                                    {land.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No properties registered yet.</p>
                )}
            </div>
        </>
    );

    // Render the My Lands content
    const renderMyLands = () => (
        <>
            {/* Search Section */}
            <div className="search-section">
                <div className="search-header">
                    <h2>My Land Registry</h2>
                    <button 
                        className="register-button"
                        onClick={handleNewLandRegistration}
                    >
                        Register New Land
                    </button>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by location, date, or status..."
                    />
                    <button className="search-button" onClick={handleSearch}>Search</button>
                    <button className="reset-button" onClick={resetSearch}>Reset</button>
                </div>
            </div>

            {/* Registered Lands Section */}
            <div className="registered-lands-section">
                {isLoading ? (
                    <div className="loading-indicator">Loading your land records...</div>
                ) : userLands.length > 0 ? (
                    <div className="lands-grid">
                        {userLands.map(land => (
                            <div key={land.id} className="land-card">
                                <h3>Property #{land.id}</h3>
                                <div className="land-details">
                                    <p><strong>Location:</strong> {land.location}</p>
                                    <p><strong>Area:</strong> {land.area}</p>
                                    <p><strong>Price:</strong> {land.price}</p>
                                    <p><strong>Registration Date:</strong> {land.registrationDate}</p>
                                    <p><strong>Status:</strong> 
                                        <span className={`status-${land.status.toLowerCase()}`}>
                                            {land.status}
                                        </span>
                                    </p>
                                </div>
                                <button 
                                    className="view-details-button" 
                                    onClick={() => viewLandDetails(land.id)}
                                >
                                    View Complete Details
                                </button>
                            </div>
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

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>SmartLand</h1>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        <li 
                            className={activePage === "dashboard" ? "active" : ""}
                            onClick={() => setActivePage("dashboard")}
                        >
                            <i className="fas fa-chart-line"></i>
                            <span>Dashboard</span>
                        </li>
                        <li 
                            className={activePage === "mylands" ? "active" : ""}
                            onClick={() => setActivePage("mylands")}
                        >
                            <i className="fas fa-map-marked-alt"></i>
                            <span>My Properties</span>
                        </li>
                        <li 
                            className={activePage === "register" ? "active" : ""}
                            onClick={handleNewLandRegistration}
                        >
                            <i className="fas fa-plus-circle"></i>
                            <span>Register Land</span>
                        </li>
                        <li 
                            className={activePage === "marketplace" ? "active" : ""}
                            onClick={() => setActivePage("marketplace")}
                        >
                            <i className="fas fa-store"></i>
                            <span>Marketplace</span>
                        </li>
                        <li 
                            className={activePage === "settings" ? "active" : ""}
                            onClick={() => setActivePage("settings")}
                        >
                            <i className="fas fa-cog"></i>
                            <span>Settings</span>
                        </li>
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">
                            <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="user-details">
                            <p className="wallet-address">
                                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                            </p>
                            <p className="wallet-balance">
                                {accountBalance !== null ? `${accountBalance.toFixed(2)} ETH` : ''}
                            </p>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="content-header">
                    <h2>
                        {activePage === "dashboard" && "Dashboard"}
                        {activePage === "mylands" && "My Properties"}
                        {activePage === "marketplace" && "Land Marketplace"}
                        {activePage === "settings" && "Account Settings"}
                    </h2>
                    <p className="blockchain-network">Network: Ethereum Testnet</p>
                </header>

                <div className="content-container">
                    {/* Conditional rendering based on active page */}
                    {activePage === "dashboard" && renderDashboard()}
                    {activePage === "mylands" && renderMyLands()}
                    {activePage === "marketplace" && (
                        <div className="placeholder-content">
                            <h3>Land Marketplace</h3>
                            <p>Coming soon! Browse available land listings.</p>
                        </div>
                    )}
                    {activePage === "settings" && (
                        <div className="placeholder-content">
                            <h3>Account Settings</h3>
                            <p>Account preferences and blockchain settings.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Register Land Modal */}
            <RegisterLandModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                account={account}
                onSuccess={handleRegistrationSuccess}
            />
        </div>
    );
};

export default UserPage;