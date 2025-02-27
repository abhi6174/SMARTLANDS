// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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
          console.log("authorized")
          setAccount(accounts[0]);
          navigate("/user");
        } else {
          console.log("not auth")
          localStorage.removeItem("connectedAccount");
          setAccount(null);
          setError("Unauthorized wallet detected. Please connect an authorized account.");
        }
      } else {
        localStorage.removeItem("connectedAccount");
        setAccount(null);
      }
    } catch (error) {
      setError("Error checking MetaMask connection");
      console.error(error);
    }
  };

  const isAuthorized = async(walletAddress) => {
    try{
      let response= await axios.get("http://localhost:8001/api/users");
      let allUsers=response.data;
      return allUsers.some(user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    }catch(error){
      console.error("some error occured",error)
    }
  };

  const connectWallet = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      setAccount(null);
      localStorage.removeItem("connectedAccount");

      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];

        if (await isAuthorized(walletAddress)) {
          setAccount(walletAddress);
          localStorage.setItem("connectedAccount", walletAddress);
          setTimeout(() => navigate("/user"), 500);
        } else {
          localStorage.removeItem("connectedAccount");
          setAccount(null);
          setError("Unauthorized wallet! Access denied. Please try another account.");
        }
      } else {
        setError("No accounts found. Please try again.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Error connecting to MetaMask. Please try again.");
      localStorage.removeItem("connectedAccount");
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/register"); // Already navigates to /register
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
      <nav className="navbar">
        <button 
          onClick={() => setActiveTab("login")} 
          className={activeTab === "login" ? "active" : ""}
        >
          Login
        </button>
      </nav>
      <div className="login-container">
        <header className="page-header">
          <h1>SmartLand</h1>
        </header>
        <main className="content-container">
          {renderContent()}
        </main>
      </div>
      <button 
        className="signup-button" 
        onClick={handleSignUp}
      >
        Sign Up
      </button>
    </div>
  );
};

export default LoginPage;