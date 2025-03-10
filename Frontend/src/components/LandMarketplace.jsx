// File: src/components/LandMarketplace.jsx

import React, { useEffect, useState } from "react";
import LandCard from "./LandCard";
import useBlockchain from "../hooks/useBlockchain";
import "../styles/LandMarketplace.css";

const LandMarketplace = () => {
  const { account } = useBlockchain();
  const [marketplaceLands, setMarketplaceLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplaceLands = async () => {
      try {
        const response = await fetch(
          `http://localhost:8001/api/lands/marketplace?owner=${account}`
        );
        console.log("fetching")
        const data = await response.json();
        console.log(data);
        setMarketplaceLands(data);
      } catch (error) {
        console.error("Error fetching marketplace lands:", error);
      } finally {
        setIsLoading(false);
      }
    };
    console.log(marketplaceLands)
    fetchMarketplaceLands();
  }, [account]);

  return (
    <div className="land-marketplace">
      <h2>Land Marketplace</h2>
      {isLoading ? (
        <div className="loading-indicator">Loading marketplace lands...</div>
      ) : marketplaceLands.length > 0 ? (
        <div className="lands-grid">
          {marketplaceLands.map((land) => (
            <LandCard key={land.landId} land={land} />
          ))}
        </div>
      ) : (
        <div className="no-lands-message">
          <p>No lands available in the marketplace.</p>
        </div>
      )}
    </div>
  );
};

export default LandMarketplace;