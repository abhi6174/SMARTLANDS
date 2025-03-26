import React, { useEffect, useState } from "react";
import LandCard from "./LandCard";
import useBlockchain from "../hooks/useBlockchain";
import "../styles/LandMarketplace.css";
const PORT = import.meta.env.VITE_PORT;
const LandMarketplace = () => {
  const { account } = useBlockchain();
  const [marketplaceLands, setMarketplaceLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplaceLands = async () => {
      if (!account) {
        console.log("Account is not available.");
        return;
      }

      try {
        console.log("Fetching marketplace lands for account:", account);
        const response = await fetch(
          `http://localhost:${PORT}/api/lands/marketplace?owner=${encodeURIComponent(account)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch marketplace lands");
        }

        const data = await response.json();
        console.log("Marketplace lands fetched:", data);
        setMarketplaceLands(data);
      } catch (error) {
        console.error("Error fetching marketplace lands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceLands();
  }, [account]);

  return (
    <div className="land-marketplace">
      {isLoading ? (
        <div className="loading-indicator">Loading marketplace lands...</div>
      ) : marketplaceLands.length > 0 ? (
        <div className="lands-grid">
          {marketplaceLands.map((land) => (
            <LandCard key={land.landId} land={land} isMarketplace={true} />
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