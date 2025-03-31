import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { uploadToIPFS, getIPFSGatewayUrl } from '../services/ipfsService';
import '../styles/RegisterLandModal.css';
import axios from 'axios';
import useBlockchain from '../hooks/useBlockchain';

const PORT = import.meta.env.VITE_PORT;

const RegisterLandModal = ({ isOpen, onClose, fetchUserLands }) => {
  // Import account and currentUser directly from useBlockchain
  const { account, currentUser } = useBlockchain();
  
  const [formData, setFormData] = useState({
    ownerName: currentUser?.name || "",
    landArea: "",
    landUnit: "Cent",
    district: "",
    taluk: "",
    village: "",
    blockNumber: "",
    surveyNumber: "",
    documentHash: ""
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        ownerName: currentUser?.name || "",
        landArea: "",
        landUnit: "Cent",
        district: "",
        taluk: "",
        village: "",
        blockNumber: "",
        surveyNumber: "",
        price: "",
        documentHash: ''
      });
      setFile(null);
      setError(null);
      setSuccess(null);
    } else {
      // When modal opens, update the ownerName with current user's name
      setFormData(prev => ({
        ...prev,
        ownerName: currentUser?.name || ""
      }));
    }
  }, [isOpen, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 
                         'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const isValidType = validTypes.includes(selectedFile.type);
      const isValidSize = selectedFile.size <= 10 * 1024 * 1024;
      
      if (isValidType && isValidSize) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid file type or size (>10MB)');
      }
    }
  };

  const uploadDocumentToIPFS = async () => {
    if (!file) return null;
    
    setIsUploading(true);
    setError(null);
    try {
      const cid = await uploadToIPFS(file);
      setFormData(prev => ({ ...prev, documentHash: cid }));
      return cid;
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Document upload failed. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let documentHash = formData.documentHash;
      if (file && !documentHash) {
        documentHash = await uploadDocumentToIPFS();
      }

      const landId = ethers.solidityPackedKeccak256(
        ["uint256", "string", "string", "string", "uint256", "uint256"],
        [
          formData.landArea,
          formData.district,
          formData.taluk,
          formData.village,
          formData.blockNumber,
          formData.surveyNumber,
        ]
      );

      const newLand = {
        ownerName: formData.ownerName,
        landArea: formData.landArea,
        district: formData.district,
        taluk: formData.taluk,
        village: formData.village,
        blockNumber: formData.blockNumber,
        surveyNumber: formData.surveyNumber,
        registrationDate: new Date().toISOString().split('T')[0],
        status: "Pending",
        documentHash: documentHash,
        walletAddress: account,
        landId: landId,
        price:formData.price
      };


      
      const response = await axios.post(`http://localhost:${PORT}/api/lands`, newLand, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Land temporarily saved to database:', response.data);
      await fetchUserLands(account);
      
      setTimeout(() => {
        onClose();
      }, 2000);
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
              readOnly
              className="read-only-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="landArea">Land Area</label>
              <input
                type="number"
                id="landArea"
                name="landArea"
                value={formData.landArea}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="landUnit">Unit</label>
              <select
                id="landUnit"
                name="landUnit"
                value={formData.landUnit}
                onChange={handleChange}
              >
                <option value="SqFt">Cent</option>
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
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blockNumber">Block Number</label>
              <input
                type="number"
                id="blockNumber"
                name="blockNumber"
                value={formData.blockNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="surveyNumber">Survey Number</label>
              <input
                type="number"
                id="surveyNumber"
                name="surveyNumber"
                value={formData.surveyNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (MATIC)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="landDocument">Land Document </label>
            <input
              type="file"
              id="landDocument"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {file && (
              <div className="file-info">
                <span>{file.name}</span>
                {!formData.documentHash && (
                  <button
                    type="button"
                    onClick={uploadDocumentToIPFS}
                    disabled={isUploading}
                    className="upload-button"
                  >
                    {isUploading ? 'Uploading...' : 'Upload to IPFS'}
                  </button>
                )}
              </div>
            )}
            {formData.documentHash && (
              <div className="ipfs-success">
                <p>Document stored on IPFS!</p>
                <a 
                  href={getIPFSGatewayUrl(formData.documentHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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
              disabled={isSubmitting || (file && !formData.documentHash)}
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