import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  Calendar, 
  KeyRound, 
  ArrowUpCircle, 
  ArrowDownCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {children}
  </button>
);

const Wallet = () => {
  const [activeTab, setActiveTab] = useState('add-funds');
  const [formData, setFormData] = useState({
    amount: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localWalletBalance, setLocalWalletBalance] = useState(0);
  const { user, fetchWalletBalance } = useAuth();

  const fetchWalletData = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.get(`/wallet/${user._id}`);
      if (response.data) {
        setTransactions(response.data.transactions || []);
        setLocalWalletBalance(response.data.balance);
        fetchWalletBalance(user._id);
      }
    } catch (err) {
      setError('Error fetching wallet details');
    } finally {
      setLoading(false);
    }
  }, [user?._id, fetchWalletBalance]);

  useEffect(() => {
    if (!user?._id) return;
    fetchWalletData();
    const pollInterval = setInterval(fetchWalletData, 30000);
    return () => clearInterval(pollInterval);
  }, [user?._id, fetchWalletData]);

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const matches = cleaned.match(/(\d{1,4})/g);
    return matches ? matches.join(' ').substr(0, 19) : '';
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      // Only allow numbers and format with spaces
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 16) {
        formattedValue = formatCardNumber(numericValue);
      } else {
        return; // Don't update if exceeding 16 digits
      }
    }
    
    if (name === 'expiryDate') {
      // Remove any non-digits first
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        formattedValue = formatExpiryDate(numericValue);
      } else {
        return; // Don't update if exceeding 4 digits
      }
    }
    
    if (name === 'cvv') {
      // Only allow numbers for CVV
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        formattedValue = numericValue;
      } else {
        return; // Don't update if exceeding 4 digits
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      const response = await api.post('/wallet/add-funds', {
        userId: user._id,
        amount: parseFloat(formData.amount),
        // Remove spaces from card number before sending
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        // Remove slash from expiry date
        expiryDate: formData.expiryDate.replace('/', ''),
        cvv: formData.cvv,
      });
      
      if (response.data) {
        setLocalWalletBalance(response.data.balance);
        await fetchWalletData();
        setFormData({ amount: '', cardNumber: '', expiryDate: '', cvv: '' });
      }
    } catch (err) {
      // More specific error handling based on status codes
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add funds. Please try again.');
      }
    }
  };

  const TransactionCard = ({ transaction }) => (
    <div className="group flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className={`p-2 rounded-lg ${
        transaction.type === 'credit' 
          ? 'bg-green-50 group-hover:bg-green-100' 
          : 'bg-red-50 group-hover:bg-red-100'
      }`}>
        {transaction.type === 'credit' ? (
          <ArrowUpCircle className="h-5 w-5 text-green-500" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{transaction.description || (transaction.type === 'credit' ? 'Deposit' : 'Withdrawal')}</p>
        <p className="text-xs text-gray-500">
          {new Date(transaction.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      <p className={`font-semibold ${
        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
      </p>
    </div>
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Section Title */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-blue-600" />
          Digital Wallet
        </h2>
        <p className="text-gray-600 text-sm mt-1">Manage your funds and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Available Balance</p>
            <p className="text-2xl font-bold mt-1">${localWalletBalance.toFixed(2)}</p>
          </div>
          <WalletIcon className="h-10 w-10 opacity-50" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex space-x-2 p-4 border-b border-gray-100">
          <TabButton 
            active={activeTab === 'add-funds'} 
            onClick={() => setActiveTab('add-funds')}
          >
            Add Funds
          </TabButton>
          <TabButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </TabButton>
        </div>

        <div className="p-4">
          {activeTab === 'add-funds' && (
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">USD</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength="19"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <CreditCard className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <input
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                      maxLength="5"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      name="cvv"
                      type="password"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <KeyRound className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Funds
              </button>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                  {error}
                </div>
              )}
            </form>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TransactionCard key={transaction._id || index} transaction={transaction} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-base">No transactions yet</p>
                  <p className="text-xs mt-1">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;