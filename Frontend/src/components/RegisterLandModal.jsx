import React, { useState } from "react";
import  "../styles/RegisterLandModal.css"; 


const RegisterLandModal = ({ isOpen, onClose, account, onSuccess }) => {
  const [formData, setFormData] = useState({
    location: "",
    area: "",
    price: "",
    coordinates: "",
    documentHash: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real application, you would send this data to your smart contract
      console.log("Submitting new land registration:", {
        ...formData,
        owner: account,
        registrationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // If successful, call onSuccess callback to refresh user lands
      onSuccess();
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
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Property Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter full property address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Area (sq ft)</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter property area"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (ETH)</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter property value in ETH"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">Geographic Coordinates</label>
            <input
              type="text"
              id="coordinates"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleChange}
              placeholder="Format: XX.XXXX° N, XX.XXXX° E"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="documentHash">Document Hash</label>
            <input
              type="text"
              id="documentHash"
              name="documentHash"
              value={formData.documentHash}
              onChange={handleChange}
              placeholder="IPFS hash or document identifier"
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