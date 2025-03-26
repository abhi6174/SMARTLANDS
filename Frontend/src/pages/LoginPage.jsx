import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";
import axios from "axios";
const PORT = import.meta.env.VITE_PORT;

const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      const storedAccount = localStorage.getItem("connectedAccount");

      if (accounts.length > 0 && storedAccount === accounts[0]) {
        await handleWalletConnect();
      }
    } catch (error) {
      console.error("Wallet connection check error:", error);
    }
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  const checkWalletAuthorization = async (walletAddress) => {
    try {
      const response = await axios.get('http://localhost:8002/api/auth/check-wallet', {
        params: { walletAddress }
      });
      
      if (response.data.success) {
        return {
          authorized: true,
          isAdmin: response.data.isAdmin,
          userData: response.data.user
        };
      }
      return { authorized: false };
    } catch (error) {
      console.error('Authorization error:', error);
      if (error.response?.status === 500) {
        throw new Error("Server error during authorization. Please try again later.");
      }
      return { authorized: false };
    }
  };

  const handleWalletConnect = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        
        const { authorized, isAdmin, userData } = await checkWalletAuthorization(walletAddress);
        
        if (authorized) {
          localStorage.setItem('connectedAccount', walletAddress);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
          
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        } else {
          setError(
            <div className="auth-error">
              <p>Wallet not authorized</p>
              <div className="auth-actions">
                <Link to="/register">Register new account</Link>
                <span> or </span>
                <a href="mailto:support@smartland.com">Contact support</a>
              </div>
            </div>
          );
          localStorage.removeItem('connectedAccount');
        }
      }
    } catch (error) {
      setError(
        <div className="connection-error">
          <p>{error.code === 4001 ? "Connection rejected" : error.message || "Connection failed"}</p>
          <p>Please try connecting again</p>
          {error.code !== 4001 && (
            <div className="auth-support">
              <a href="mailto:support@smartland.com">Contact support</a> if the problem persists
            </div>
          )}
        </div>
      );
      console.error("Wallet connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (e) => {
    e.preventDefault();
    await handleWalletConnect();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <header className="page-header">
          <h1>SmartLand</h1>
          <p className="subtitle">Land Registry System</p>
        </header>

        <main className="content-container">
          <form className="login-form" onSubmit={connectWallet}>
            <h2>Login with MetaMask</h2>
            
            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <div className="error-content">{error}</div>
              </div>
            )}

            <div className="metamask-section">
              {!account ? (
                <button
                  type="submit"
                  className="connect-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <img 
                        src="/metamask-icon.png" 
                        alt="MetaMask" 
                        className="metamask-icon"
                      />
                      Connect Wallet
                    </>
                  )}
                </button>
              ) : (
                <div className="account-info">
                  <p className="success-text">Connected!</p>
                  <p className="account-text">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</p>
                </div>
              )}
            </div>

            <div className="register-prompt">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;