import React, { useEffect } from 'react';
import { Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WalletWidget = () => {
  const { user, walletBalance, fetchWalletBalance } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchWalletBalance(user._id);
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-2">
        <WalletIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900">${walletBalance.toFixed(2)}</p>
      <p className="text-sm text-gray-500">Available Balance</p>
    </div>
  );
};

export default WalletWidget;
