import React, { useEffect, useState } from "react";
import LandCard from "./LandCard";
import useBlockchain from "../hooks/useBlockchain";
import "../styles/LandMarketplace.css";
import axios from 'axios';
import { formatPrice } from "../utils/formatPrice";

const LandMarketplace = () => {
  const { account } = useBlockchain();
  const [marketplaceLands, setMarketplaceLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const PORT = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchMarketplaceLands = async () => {
      if (!account) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://localhost:${PORT}/api/lands/marketplace`,
          {
            params: { owner: account },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        console.log("response marketplaceLands",response.data)
        if (response.data && Array.isArray(response.data.data)) {
          // Format prices before setting state
          const formattedLands = response.data.data.map(land => ({
            ...land,
            price: land.price // Keep as wei - formatting happens in LandCard
          }));
          setMarketplaceLands(formattedLands);
          console.log("marketplaceLands",marketplaceLands)
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching marketplace lands:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceLands();
  }, [account, PORT]);

  return (
    <div className="land-marketplace">
      <h2>Available Properties</h2>
     
      
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      ) : marketplaceLands.length > 0 ? (
        <div className="lands-grid">
          {marketplaceLands.map((land) => (
            <LandCard 
              key={land.landId} 
              land={land}
              isMarketplace={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">No properties available</div>
      )}
    </div>
  );
};

export default LandMarketplace;