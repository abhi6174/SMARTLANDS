import React, { useState } from 'react';
import '../styles/SignUpPage.css';
import axios from 'axios'; // Import axios for backend API calls

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    walletAddress: "", // Will be populated by MetaMask
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Connect MetaMask wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install MetaMask!");
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setFormData((prev) => ({
          ...prev,
          walletAddress: accounts[0], // Set the wallet address
        }));
        setError("");
      } else {
        setError("No accounts found. Please try again.");
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate form data
    if (!formData.name || !formData.email || !formData.walletAddress) {
      setError("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send data to the backend
      const response = await axios.post("http://localhost:8001/api/users", formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        alert("Registration successful! Please log in.");
        // Reset form after successful registration
        setFormData({
          name: "",
          email: "",
          walletAddress: "",
        });
      } else {
        setError("Failed to register. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error); // Display backend error message
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="page-header">
        <h1>SmartLand - Sign Up</h1>
      </header>
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="walletAddress">Wallet Address</label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              placeholder="Connect your wallet"
              readOnly
              required
            />
            <button
              type="button"
              className="connect-wallet-button"
              onClick={connectWallet}
              disabled={isSubmitting}
            >
              Connect Wallet
            </button>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;