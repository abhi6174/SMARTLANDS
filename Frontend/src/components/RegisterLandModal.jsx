// src/components/RegisterLandModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/RegisterLandModal.css";
import useBlockchain from "../hooks/useBlockchain";
import axios from 'axios';
import {ethers} from 'ethers';
import LandRegistryABI from '../contracts/LandRegistryABI';
const PORT = import.meta.env.VITE_PORT;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const RegisterLandModal = ({ isOpen, onClose, account, fetchUserLands }) => {
  const { currentUser } = useBlockchain();
  const [formData, setFormData] = useState({
    ownerName: "",
    landArea: "",
    landUnit: "SqFt",
    district: "",
    taluk: "",
    village: "",
    blockNumber: "",
    surveyNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sync ownerName with currentUser.name when currentUser is available
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setFormData(prev => ({
        ...prev,
        ownerName: currentUser.name,
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    setFormData({
      ...formData,
      [name]: value,
    });
  };
// File: src/components/RegisterLandModal.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submission triggered");
  setIsSubmitting(true);
  setError(null);

  const newLand = {
    ownerName: formData.ownerName,
    landArea: formData.landArea,
    district: formData.district,
    taluk: formData.taluk,
    village: formData.village,
    blockNumber: formData.blockNumber,
    surveyNumber: formData.surveyNumber,
    registrationDate: new Date().toISOString().split('T')[0],
    status: "not verified",
    walletAddress: account, // Use the connected wallet address
  };

  console.log("Form Data Submitted:", newLand);

  try {
    const { ethereum } = window;

    if (!ethereum) {
      throw new Error("MetaMask is not installed!");
    }
  
    // Connect to the smart contract
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const landRegistry = new ethers.Contract(
      contractAddress, // Use environment variable for contract address
      LandRegistryABI, // Ensure the ABI is imported
      signer
    );

    // Call the registerLand function
    const tx = await landRegistry.registerLand(
      newLand.ownerName,
      newLand.landArea,
      newLand.district,
      newLand.taluk,
      newLand.village,
      newLand.blockNumber,
      newLand.surveyNumber,
      { gasLimit: 500000 }
    );

    // Wait for the transaction to be mined
    await tx.wait();

    console.log("Land registered successfully on the blockchain!");

    // Save land details to the backend database
    const response = await axios.post(`http://localhost:${PORT}/api/lands`, newLand, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Land saved to database:', response.data);
    await fetchUserLands(account); // Refresh the user's lands
    onClose();
  } catch (error) {
    console.error("Error registering land:", error);
    setError(error.message || "Failed to register land. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Register New Land</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Loading name..."
              required
              readOnly // Make uneditable
            />
          </div>

          <div className="form-group">
            <label htmlFor="landArea">Land Area</label>
            <div className="land-area-group">
              <input
                type="text"
                id="landArea"
                name="landArea"
                value={formData.landArea}
                onChange={handleChange}
                placeholder="Enter land area"
                required
              />
              <select
                name="landUnit"
                value={formData.landUnit}
                onChange={handleChange}
              >
                <option value="SqFt">Square Feet</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter district"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="taluk">Taluk</label>
            <input
              type="text"
              id="taluk"
              name="taluk"
              value={formData.taluk}
              onChange={handleChange}
              placeholder="Enter taluk"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="village">Village</label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="Enter village"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="blockNo">Block Number</label>
            <input
              type="text"
              id="blockNo"
              name="blockNumber"
              value={formData.blockNumber}
              onChange={handleChange}
              placeholder="Enter block number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="surveyNo">Survey Number</label>
            <input
              type="text"
              id="surveyNo"
              name="surveyNumber"
              value={formData.surveyNumber}
              onChange={handleChange}
              placeholder="Enter survey number"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Land"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterLandModal;