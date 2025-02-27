// src/components/RegisterLandModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/RegisterLandModal.css";
import useBlockchain from "../hooks/useBlockchain";
import axios from 'axios';

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
      walletAddress: account,
    };

    console.log("Form Data Submitted:", { ...newLand, walletAddress: account });

    try {
      const response = await axios.post("http://localhost:8001/api/lands", newLand, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Land registered successfully:', response.data);
      await fetchUserLands(account);
      onClose();
    } catch (error) {
      console.error("Error registering land:", error);
      setError(error.response?.data?.error || "Failed to register land. Please try again.");
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