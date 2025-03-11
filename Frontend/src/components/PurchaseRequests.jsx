import React, { useEffect, useState } from 'react';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/PurchaseRequests.css';

const PurchaseRequests = () => {
  const { account } = useBlockchain();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseRequests = async () => {
      try {
        const response = await fetch(`http://localhost:8002/api/lands/purchase-requests?owner=${encodeURIComponent(account)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch purchase requests");
        }

        const data = await response.json();
        setPurchaseRequests(data);
      } catch (error) {
        console.error("Error fetching purchase requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseRequests();
  }, [account]);

  const handleAcceptRequest = async (landId, buyerAddress) => {
    try {
      const response = await fetch("http://localhost:8002/api/lands/accept-purchase-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landId,
          buyerAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept purchase request");
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
      <h2>Purchase Requests</h2>
      {isLoading ? (
        <div className="loading-indicator">Loading purchase requests...</div>
      ) : purchaseRequests.length > 0 ? (
        <div className="requests-list">
          {purchaseRequests.map((request) => (
            <div key={request.landId} className="request-item">
              <h3>Property #{request.landId}</h3>
              <p><strong>Buyer:</strong> {request.buyerAddress}</p>
              <button 
                className="accept-button" 
                onClick={() => handleAcceptRequest(request.landId, request.buyerAddress)}
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