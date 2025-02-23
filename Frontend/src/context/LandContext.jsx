// src/context/LandContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LandContext = createContext();

export const LandProvider = ({ children }) => {
  const [localLands, setLocalLands] = useState([]);

  const addLand = (newLand) => {
    setLocalLands(prevLands => [...prevLands, newLand]);
  };

  return (
    <LandContext.Provider value={{ localLands, addLand }}>
      {children}
    </LandContext.Provider>
  );
};

export const useLandContext = () => {
  const context = useContext(LandContext);
  if (!context) {
    throw new Error("useLandContext must be used within a LandProvider");
  }
  return context;
};