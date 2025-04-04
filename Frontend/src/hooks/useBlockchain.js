import { useState, useEffect } from 'react';
import axios from 'axios';
const PORT = import.meta.env.VITE_PORT;

export default function useBlockchain() {
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [userLands, setUserLands] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
   const PORT = import.meta.env.VITE_PORT;
  useEffect(() => {
    const initialize = async () => {
      const storedAccount = localStorage.getItem('connectedAccount');
      if (!storedAccount) {
        window.location.href = '/';
        return;
      }
      
      setAccount(storedAccount);
      await fetchAccountDetails(storedAccount);
      await fetchUserLands(storedAccount);
      setIsLoading(false);
    };

    initialize();
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
      setCurrentUser(user || null);
    } catch (error) {
      console.error('Error fetching account details:', error);
      setCurrentUser(null);
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
      localStorage.removeItem('connectedAccount');
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      console.error('Error logging out:', err);
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