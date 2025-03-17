import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem('user')) || null;
  const storedWallet = JSON.parse(localStorage.getItem('walletBalance')) || 0;

  const [user, setUser] = useState(storedUser);
  const [walletBalance, setWalletBalance] = useState(storedWallet);

  useEffect(() => {
    if (user?._id) {
      fetchWalletBalance(user._id);
    }
  }, [user]);

  const login = (userData) => {
    if (!userData?._id) return;

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    fetchWalletBalance(userData._id);
  };

  const logout = () => {
    setUser(null);
    setWalletBalance(0);
    localStorage.removeItem('user');
    localStorage.removeItem('walletBalance');
  };

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await api.get(`/wallet/${userId}`);
      const balance = response.data.balance || 0;
      
      setWalletBalance(balance);
      localStorage.setItem('walletBalance', JSON.stringify(balance));
      return balance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      walletBalance, 
      fetchWalletBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
