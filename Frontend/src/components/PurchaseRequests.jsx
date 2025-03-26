// src/components/PurchaseRequests.jsx
import React, { useEffect, useState } from 'react';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/PurchaseRequests.css';
<<<<<<< HEAD
const PORT = import.meta.env.VITE_PORT;
=======
import LandRegistryABI from '../contracts/LandRegistryABI';
import { ethers } from 'ethers';
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const PORT = import.meta.env.VITE_PORT;

>>>>>>> 7356e4f5c6b9567b73156dfe8a869941b55c9058
const PurchaseRequests = () => {
  const { account } = useBlockchain();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseRequests = async () => {
      try {
<<<<<<< HEAD
        const response = await fetch(`http://localhost:${PORT}/api/lands/purchase-requests?owner=${encodeURIComponent(account)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch purchase requests");
=======
        if (!account) {
          console.error("Account is not available.");
          return;
>>>>>>> 7356e4f5c6b9567b73156dfe8a869941b55c9058
        }
  
        // Fetch lands with purchase requests for the seller
        const response = await fetch(`http://localhost:${PORT}/api/lands/getpurchase-requests?owner=${account}`);
        if (!response.ok) {
          throw new Error("Failed to fetch lands with purchase requests");
        }
  
        const lands = await response.json();
        console.log("Lands fetched from MongoDB:", lands);
  
        // Process the purchase requests
        const requests = lands.flatMap(land => 
          (land.purchaseRequests || []).map(request => ({
            ...request,
            landId: land.landId,
            landDetails: {
              ownerName: land.ownerName,
              district: land.district,
              taluk: land.taluk,
              village: land.village,
            },
          }))
        );
  
        console.log("Purchase requests:", requests);
        setPurchaseRequests(requests);
      } catch (error) {
        console.error("Error fetching purchase requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPurchaseRequests();
  }, [account]);
  // Rest of the code (handleAcceptRequest, JSX) remains unchanged
  // ...
  const handleAcceptRequest = async (landId, buyerAddress, buyerName) => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("MetaMask is not installed!");
      }
  
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const landRegistry = new ethers.Contract(
        contractAddress, // Shared contract address
        LandRegistryABI, // Shared ABI
        signer
      );
  
      // Use the landId directly (it's already a keccak256 hash)
      const landIdBytes32 = landId; // No need to hash again
  
      console.log("Calling transferOwnership with:", { landIdBytes32, buyerAddress });
  
      const tx = await landRegistry.transferOwnership(landIdBytes32, buyerAddress, {
        value: ethers.parseEther("0.01"), // Payment amount (0.01 MATIC)
        gasLimit: 300000, // Adjust gas limit as needed
      });
  
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
  
      // Notify the backend to update the database
      const response = await fetch(`http://localhost:${PORT}/api/lands/accept-purchase-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landId,
          buyerAddress,
          buyerName, // Send buyerName to the backend
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update the database");
      }
  
      const data = await response.json();
      alert(data.message); // Show success message
      setPurchaseRequests(purchaseRequests.filter(request => request.landId !== landId)); // Remove accepted request from the list
    } catch (error) {
      console.error("Error accepting purchase request:", error);
      alert("Failed to accept purchase request. Please try again.");
    }
  };
  return (
    <div className="purchase-requests">
      {isLoading ? (
        <div className="loading-indicator">Loading purchase requests...</div>
      ) : purchaseRequests.length > 0 ? (
        <div className="requests-list">
          {purchaseRequests.map((request) => (
            <div key={`${request.landId}-${request.buyerAddress}`} className="request-item">
              <h3>Property #{request.landId}</h3>
              <p><strong>Buyer:</strong> {request.buyerName} ({request.buyerAddress})</p>
              <p><strong>Land Details:</strong> {request.landDetails.village}, {request.landDetails.taluk}, {request.landDetails.district}</p>
              <button 
                className="accept-button" 
                onClick={() => handleAcceptRequest(request.landId, request.buyerAddress,request.buyerName)}
              >
                Accept Request
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-requests-message">
          <p>No purchase requests available.</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;