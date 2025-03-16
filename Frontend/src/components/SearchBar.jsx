// src/components/SearchBar.jsx
import React, { useState } from 'react';
import useBlockchain from '../hooks/useBlockchain';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { userLands, setUserLands, fetchUserLands, account } = useBlockchain();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const filteredResults = userLands.filter(land => 
      land.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.registrationDate.includes(searchQuery) ||
      land.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setUserLands(filteredResults);
  };

  const resetSearch = () => {
    setSearchQuery('');
    fetchUserLands(account);
  };

  return (
    <div className="search-section">
      <div className="search-header">

      </div>
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by location, date, or status..."
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
        <button className="reset-button" onClick={resetSearch}>Reset</button>
      </div>
    </div>
  );
};

export default SearchBar;