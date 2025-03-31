import React, { useEffect, useState } from "react";
import useBlockchain from "../hooks/useBlockchain";
import { ethers } from "ethers";
import LandRegistryABI from "../contracts/LandRegistryABI";
import axios from "axios";
import "../styles/BuyerPayment.css";
import { formatPrice } from "../utils/formatPrice";

const BuyerPayment = () => {
  const { account, currentUser } = useBlockchain();
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const PORT = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      try {
        if (!account) {
          console.error("Buyer address is not available.");
          return;
        }

        const response = await axios.get(
          `http://localhost:${PORT}/api/lands/lands-for-payment`,
          {
            params: { buyer: account },
          }
        );
        
        console.log("Accepted requests:", response.data);
        setAcceptedRequests(response.data);
      } catch (error) {
        console.error("Error fetching accepted requests:", error);
        setError("Failed to fetch accepted requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedRequests();
  }, [account, PORT]);

  const handlePayment = async (landId, price) => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("MetaMask is not installed!");
      }
  
      setError(null);
      setIsLoading(true);
  
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const landRegistry = new ethers.Contract(
        contractAddress,
        LandRegistryABI,
        signer
      );
  
      console.log("Initiating payment for land:", landId, "Price:", price);
      
      // Convert price to wei (1 MATIC = 10^18 wei)
      const priceInWei = ethers.parseEther(price.toString());
      
      const tx = await landRegistry.transferLandOwnership(
        landId,
        currentUser.name,
        {
          value: priceInWei,
          gasLimit: 500000
        }
      );
  
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
  
      // Update backend with proper headers and error handling
      try {
        const response = await axios.post(
          `http://localhost:${PORT}/api/lands/transfer`,
          {
            landId: landId,
            buyerAddress: account.toLowerCase(), // Ensure consistent case
            buyerName: currentUser.name,
            txHash: tx.hash,
            price: price // Include price for record keeping
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
            }
          }
        );
  
        if (!response.data || response.status !== 200) {
          throw new Error(response.data?.message || "Backend update failed");
        }
  
        alert("Payment successful! Ownership transferred.");
        setAcceptedRequests(prev => prev.filter(land => land.landId !== landId));
      } catch (backendError) {
        console.error("Backend update error:", backendError);
        // Transaction succeeded but backend failed - notify admin
        alert(`Payment succeeded but record update failed. Please contact support with TX hash: ${tx.hash}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to complete payment");
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="buyer-payment">
      {isLoading ? (
        <div className="loading-indicator">Loading accepted requests...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : acceptedRequests.length > 0 ? (
        <div className="requests-list">
          {acceptedRequests.map((land) => (
            <div key={land.landId} className="request-item">
              <h3>Property #{land.landId}</h3>
              <p><strong>Owner:</strong> {land.ownerName}</p>
              <p><strong>Location:</strong> {land.village}, {land.taluk}, {land.district}</p>
              <p><strong>Price:</strong> {formatPrice(land.price)} MATIC</p>
              <button 
                onClick={() => handlePayment(land.landId, land.price)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Pay ${formatPrice(land.price)} MATIC`}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-requests-message">
          <p>No accepted purchase requests available.</p>
        </div>
      )}
    </div>
  );
};

export default BuyerPayment;