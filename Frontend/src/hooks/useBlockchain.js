// src/hooks/useBlockchain.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useBlockchain() {
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [userLands, setUserLands] = useState([]);
  const [currentUser, setcurrentUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAccount = localStorage.getItem('connectedAccount');
    if (!storedAccount) {
      window.location.href = '/';
    } else {
      setAccount(storedAccount);
      fetchAccountDetails(storedAccount);
      fetchUserLands(storedAccount);
    }
  }, []);

  const fetchAccountDetails = async (address) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const balance = await ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        setAccountBalance(parseInt(balance, 16) / Math.pow(10, 18));
      }
      let response= await axios.get("http://localhost:8001/api/users");
      let allUsers=response.data;
      let user= allUsers.find(user => user.walletAddress.toLowerCase() === address.toLowerCase());
      setcurrentUser(user||null);
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
    
  };

  const fetchUserLands = async (address) => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8001/api/lands", {
        params: { owner: address } // Filter by owner
      });
      setUserLands(response.data);
    } catch (error) {
      console.error('Error fetching user lands:', error);
      setUserLands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        await ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }
      localStorage.setItem('forceLogin', 'true');
      localStorage.removeItem('connectedAccount');
      setAccount(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    account,
    accountBalance,
    userLands,
    isLoading,
    currentUser,
    fetchUserLands,
    handleLogout,
    setUserLands
  };
}