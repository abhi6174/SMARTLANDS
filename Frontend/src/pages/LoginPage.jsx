import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import mockUsers from "../data/mockUsers"; // Import mock wallet addresses

const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Check if the wallet is already connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      const storedAccount = localStorage.getItem("connectedAccount");

      if (accounts.length > 0 && storedAccount === accounts[0]) {
        if (isAuthorized(accounts[0])) {
          setAccount(accounts[0]);
          navigate("/user");
        } else {
          localStorage.removeItem("connectedAccount");
          setError("Unauthorized wallet! Access denied.");
        }
      }
    } catch (error) {
      setError("Error checking MetaMask connection");
      console.error(error);
    }
  };

  // Check if the wallet is in mock data
  const isAuthorized = (walletAddress) => {
    return mockUsers.some(user => user.wallet.toLowerCase() === walletAddress.toLowerCase());
  };

  // Connect MetaMask and verify wallet
  const connectWallet = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];

        if (isAuthorized(walletAddress)) {
          setAccount(walletAddress);
          localStorage.setItem("connectedAccount", walletAddress);
          setTimeout(() => navigate("/user"), 500);
        } else {
          setError("Unauthorized wallet! Access denied.");
        }
      } else {
        setError("No accounts found. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setError("Error connecting to MetaMask");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "login":
        return (
          <form className="login-form" onSubmit={connectWallet}>
            <h2>Login with MetaMask</h2>
            {error && <div className="error-alert">{error}</div>}
            <div className="metamask-section">
              {!account ? (
                <button
                  type="submit"
                  className="action-button metamask-button"
                  disabled={isLoading}
                >
                  <svg className="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  {isLoading ? "Connecting..." : "Connect with MetaMask"}
                </button>
              ) : (
                <div className="account-info">
                  <p className="success-text">Connected!</p>
                  <p className="account-text">{account}</p>
                </div>
              )}
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="login-page">
      <header className="page-header">
        <h1>SmartLand</h1>
      </header>
      <div className="navbar">
        <button onClick={() => setActiveTab("login")} className={activeTab === "login" ? "active" : ""}>
          Login
        </button>
      </div>
      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

export default LoginPage;
