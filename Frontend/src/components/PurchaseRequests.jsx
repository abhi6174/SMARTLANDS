import React, { useEffect, useState } from 'react';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/PurchaseRequests.css';
import axios from 'axios'; // Import axios
const PORT = import.meta.env.VITE_PORT;

const PurchaseRequests = () => {
  const { account } = useBlockchain();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseRequests = async () => {
      try {
        if (!account) {
          console.error("Account is not available.");
          return;
        }

        // Fetch lands with purchase requests for the seller
        const response = await axios.get(
          `http://localhost:${PORT}/api/lands/getpurchase-requests`,
          {
            params: { owner: account }, // Pass owner address as query parameter
          }
        );

        const lands = response.data;
        console.log("Lands fetched from MongoDB:", lands);

        // Process the purchase requests
        const requests = lands.flatMap((land) =>
          (land.purchaseRequests || []).map((request) => ({
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
        alert("Failed to fetch purchase requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseRequests();
  }, [account]);

  // Seller accepts the purchase request
  const handleAcceptRequest = async (landId, buyerAddress, buyerName) => {
    try {
      // Notify the backend to accept the request
      const response = await axios.post(
        `http://localhost:${PORT}/api/lands/accept-purchase-request`,
        {
          landId,
          buyerAddress,
          buyerName,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to accept purchase request");
      }

      alert(response.data.message); // Show success message

      // Notify the buyer to pay for the transaction
      notifyBuyer(buyerAddress, landId);
    } catch (error) {
      console.error("Error accepting purchase request:", error);
      alert("Failed to accept purchase request. Please try again.");
    }
  };

  // Notify the buyer to pay for the transaction
  const notifyBuyer = (buyerAddress, landId) => {
    // In a real app, this would trigger a UI prompt for the buyer to pay
    console.log(`Notifying buyer ${buyerAddress} to pay for land ${landId}`);
    alert(`Buyer ${buyerAddress} has been notified to pay for land ${landId}`);
  };

  return (
    <div className="purchase-requests">
      {isLoading ? (
        <div className="loading-indicator">Loading purchase requests...</div>
      ) : purchaseRequests.length > 0 ? (
        <div className="requests-list">
          {purchaseRequests.map((request) => (
            <div
              key={`${request.landId}-${request.buyerAddress}`}
              className="request-item"
            >
              <h3>Property #{request.landId}</h3>
              <p>
                <strong>Buyer:</strong> {request.buyerName} ({request.buyerAddress})
              </p>
              <p>
                <strong>Land Details:</strong> {request.landDetails.village},{" "}
                {request.landDetails.taluk}, {request.landDetails.district}
              </p>
              <button
                className="accept-button"
                onClick={() =>
                  handleAcceptRequest(request.landId, request.buyerAddress, request.buyerName)
                }
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