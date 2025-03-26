import React, { useEffect, useState } from "react";
import LandCard from "./LandCard";
import useBlockchain from "../hooks/useBlockchain";
import "../styles/LandMarketplace.css";

const LandMarketplace = () => {
  const { account } = useBlockchain();
  const [marketplaceLands, setMarketplaceLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketplaceLands = async () => {
      if (!account) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/lands/marketplace?owner=${encodeURIComponent(account)}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch lands");
        const data = await response.json();
        setMarketplaceLands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceLands();
  }, [account]);

  return (
    <div className="land-marketplace">
      <h2>Available Properties</h2>
      
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <div className="error-message">{error}</div>
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