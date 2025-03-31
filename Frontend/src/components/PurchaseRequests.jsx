import React, { useEffect, useState } from 'react';
import useBlockchain from '../hooks/useBlockchain';
import '../styles/PurchaseRequests.css';
import axios from 'axios';
import { truncateHash } from "../utils/truncateHash";
import { formatPrice } from "../utils/formatPrice";

const PurchaseRequests = () => {
  const { account } = useBlockchain();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null); // Track which request is being accepted
  const PORT = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchPurchaseRequests = async () => {
      try {
        if (!account) {
          console.error("Account is not available.");
          return;
        }
  
        const response = await axios.get(
          `http://localhost:${PORT}/api/lands/getpurchase-requests`,
          {
            params: { owner: account },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("API Response:", response.data);
        const lands = response.data;
  
        // Process the purchase requests
        const requests = lands.flatMap(land => 
          (land.purchaseRequests || [])
            .filter(request => request.status !== 'accepted')
            .map(request => ({
              ...request,
              landId: land.landId,
              landDetails: {
                ownerName: land.ownerName,
                district: land.district,
                taluk: land.taluk,
                village: land.village,
                price: land.price
              },
            }))
        );
        console.log("Processed requests:", requests);
        setPurchaseRequests(requests);
      } catch (error) {
        console.error("Error fetching purchase requests:", error);
        setError(error.response?.data?.message || "Failed to load purchase requests");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPurchaseRequests();
  }, [account, PORT]);

  const handleAcceptRequest = async (landId, buyerAddress, buyerName) => {
    try {
      setIsLoading(true);
      setAcceptingId(landId);
      setError(null);

      console.log("Sending accept request for:", { landId, buyerAddress, buyerName });
      
      const response = await axios.post(
        `http://localhost:${PORT}/api/lands/accept-purchase-request`,
        {
          landId,
          buyerAddress,
          buyerName,
          sellerAddress: account // Include seller address for verification
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
          }
        }
      );

      console.log("Accept response:", response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to accept request");
      }

      alert(response.data.message || "Purchase request accepted. The buyer can now complete the payment.");
      
      // Update the UI by filtering out the accepted request
      setPurchaseRequests(prev => 
        prev.filter(request => 
          !(request.landId === landId && request.buyerAddress === buyerAddress)
        )
      );
    } catch (error) {
      console.error("Detailed error:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      setError(error.response?.data?.message || 
              error.message || 
              "Failed to accept request. Please try again.");
    } finally {
      setIsLoading(false);
      setAcceptingId(null);
    }
  };

  return (
    <div className="purchase-requests">
      {isLoading && !acceptingId ? (
        <div className="loading-indicator">Loading purchase requests...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Refresh
          </button>
        </div>
      ) : purchaseRequests.length > 0 ? (
        <div className="requests-list">
          {purchaseRequests.map((request) => (
            <div key={`${request.landId}-${request.buyerAddress}`} className="request-item">
              <h3>Property #{request.landId}</h3>
              <p><strong>Buyer:</strong> {request.buyerName} ({truncateHash(request.buyerAddress)})</p>
              <p><strong>Land Details:</strong> {request.landDetails.village}, {request.landDetails.taluk}, {request.landDetails.district}</p>
              <p><strong>Price:</strong> {formatPrice(request.landDetails.price)} MATIC</p>
              <button 
                className="accept-button" 
                onClick={() => handleAcceptRequest(
                  request.landId, 
                  request.buyerAddress, 
                  request.buyerName
                )}
                disabled={isLoading && acceptingId === request.landId}
              >
                {isLoading && acceptingId === request.landId ? 'Accepting...' : 'Accept Request'}
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