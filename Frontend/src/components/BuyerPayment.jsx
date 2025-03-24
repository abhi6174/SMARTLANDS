import React, { useEffect, useState } from "react";
import useBlockchain from "../hooks/useBlockchain";
import { ethers } from "ethers";
import LandRegistryABI from "../contracts/LandRegistryABI";
import axios from "axios"; // Import axios
import "../styles/BuyerPayment.css"; // Import CSS file

const BuyerPayment = () => {
  const { account, currentUser } = useBlockchain();
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const PORT = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      try {
        if (!account) {
          console.error("Buyer address is not available.");
          return;
        }

        // Fetch lands where the buyer has an accepted purchase request
        const response = await axios.get(
          `http://localhost:${PORT}/api/lands/lands-for-payment`,
          {
            params: { buyer: account }, // Pass buyer address as query parameter
          }
        );

        setAcceptedRequests(response.data);
      } catch (error) {
        console.error("Error fetching accepted requests:", error);
        alert("Failed to fetch accepted requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedRequests();
  }, [account]); // Re-fetch when account changes

  const handlePayment = async (landId) => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("MetaMask is not installed!");
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const landRegistry = new ethers.Contract(
        contractAddress,
        LandRegistryABI,
        signer
      );

      const landIdBytes32 = landId; // Assuming landId is already a bytes32 value
      console.log("landId:", landIdBytes32);

      const tx = await landRegistry.transferLandOwnership(landIdBytes32, {
        value: ethers.parseEther("0.01"), // Buyer pays 0.01 MATIC
      });

      console.log("Transaction sent:", tx.hash);txHash: tx.hash
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Notify backend to update ownership
      const response = await axios.post(
        `http://localhost:${PORT}/api/lands/transfer`,
        {
          landId: landId,
          buyerAddress: account,
          buyerName: currentUser.name,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update ownership in database");
      }

      alert("Payment successful! Ownership transferred.");

      // Update UI by removing the paid request
      setAcceptedRequests((prev) =>
        prev.filter((land) => land.landId !== landId)
      );
    } catch (error) {
      console.error("Error completing payment:", error);
      alert(`Failed to complete payment: ${error.message}`);
    }
  };

  return (
    <div className="buyer-payment">
      {isLoading ? (
        <div className="loading-indicator">Loading accepted requests...</div>
      ) : acceptedRequests.length > 0 ? (
        <div className="requests-list">
          {acceptedRequests.map((land) => (
            <div key={land.landId} className="request-item">
              <h3>Property #{land.landId}</h3>
              <p>
                <strong>Owner:</strong> {land.ownerName}
              </p>
              <p>
                <strong>Location:</strong> {land.village}, {land.taluk},{" "}
                {land.district}
              </p>
              <button
                className="pay-button"
                onClick={() => handlePayment(land.landId)}
              >
                Pay 0.01 MATIC to Complete Purchase
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