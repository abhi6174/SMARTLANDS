// src/components/RegisterLandModal.jsx
import React, { useState } from "react";
import "../styles/RegisterLandModal.css";
import { useLandContext } from '../context/LandContext';

const RegisterLandModal = ({ isOpen, onClose, account }) => {
  const { addLand } = useLandContext();
  const [formData, setFormData] = useState({
    ownerName: "",
    landArea: "",
    landUnit: "SqFt",
    district: "",
    taluk: "",
    village: "",
    blockNo: "",
    surveyNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      landUnit: formData.landUnit,
      district: formData.district,
      taluk: formData.taluk,
      village: formData.village,
      blockNo: formData.blockNo,
      surveyNo: formData.surveyNo,
      registrationDate: new Date().toISOString().split('T')[0],
      status: "Registered",
      id: Date.now(),
    };

    console.log("Form Data Submitted:", { ...newLand, walletAddress: account });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLand(newLand); // Use context to add land
      onClose();
    } catch (error) {
      console.error("Error registering land:", error);
      setError("Failed to register land. Please try again.");
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
              placeholder="Owner name"
              required
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
              name="blockNo"
              value={formData.blockNo}
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
              name="surveyNo"
              value={formData.surveyNo}
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