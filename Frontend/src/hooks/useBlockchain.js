// src/hooks/useBlockchain.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useBlockchain() {
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [userLands, setUserLands] = useState([]);
  const [currentUser, setcurrentUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const PORT = import.meta.env.VITE_PORT;
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
      
      const response = await axios.get(`http://localhost:${PORT}/api/users`);
      // Ensure we handle the response data properly
      const allUsers = Array.isArray(response.data?.data) ? response.data.data : [];
      const user = allUsers.find(user => 
        user.walletAddress?.toLowerCase() === address.toLowerCase()
      );
      setcurrentUser(user || null);
    } catch (error) {
      console.error('Error fetching account details:', error);
      setcurrentUser(null);
    }
  };

  const fetchUserLands = async (address) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/lands`, {
        params: { owner: address }
      });
      
      // Ensure we always set an array, even if response structure is unexpected
      setUserLands(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching user lands:', error);
      setUserLands([]); // Set empty array on error
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