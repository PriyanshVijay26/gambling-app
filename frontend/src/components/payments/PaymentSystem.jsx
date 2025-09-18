import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentSystem = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [walletBalances, setWalletBalances] = useState({
    BTC: 0,
    ETH: 0,
    USDT: 0,
    USD: 0
  });

  const cryptoMethods = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      color: 'from-orange-400 to-yellow-500',
      minDeposit: 0.001,
      maxDeposit: 10,
      fees: { deposit: 0, withdrawal: 0.0005 },
      processingTime: '10-30 minutes'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'Ξ',
      color: 'from-blue-400 to-purple-500',
      minDeposit: 0.01,
      maxDeposit: 100,
      fees: { deposit: 0, withdrawal: 0.005 },
      processingTime: '2-15 minutes'
    },
    {
      id: 'usdt',
      name: 'Tether USDT',
      symbol: 'USDT',
      icon: '₮',
      color: 'from-green-400 to-green-600',
      minDeposit: 10,
      maxDeposit: 50000,
      fees: { deposit: 0, withdrawal: 1 },
      processingTime: '5-20 minutes'
    }
  ];

  const fiatMethods = [
    {
      id: 'visa',
      name: 'Visa',
      icon: '💳',
      color: 'from-blue-600 to-blue-800',
      minDeposit: 10,
      maxDeposit: 5000,
      fees: { deposit: 0.025, withdrawal: 0.03 },
      processingTime: 'Instant'
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      icon: '💳',
      color: 'from-red-600 to-orange-600',
      minDeposit: 10,
      maxDeposit: 5000,
      fees: { deposit: 0.025, withdrawal: 0.03 },
      processingTime: 'Instant'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      color: 'from-blue-400 to-blue-600',
      minDeposit: 5,
      maxDeposit: 2000,
      fees: { deposit: 0.035, withdrawal: 0.04 },
      processingTime: 'Instant'
    }
  ];

  useEffect(() => {
    if (socket) {
      socket.on('walletUpdate', (balances) => {
        setWalletBalances(balances);
      });

      socket.on('transactionUpdate', (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
      });

      socket.on('paymentProcessed', (result) => {
        setProcessing(false);
        if (result.success) {
          setAmount('');
          setSelectedMethod(null);
        }
      });

      // Request initial data
      socket.emit('getWalletBalances');
      socket.emit('getTransactionHistory');

      return () => {
        socket.off('walletUpdate');
        socket.off('transactionUpdate');
        socket.off('paymentProcessed');
      };
    }
  }, [socket]);

  const handlePayment = () => {
    if (!selectedMethod || !amount || processing) return;

    const numAmount = parseFloat(amount);
    if (numAmount < selectedMethod.minDeposit || numAmount > selectedMethod.maxDeposit) {
      alert(`Amount must be between ${selectedMethod.minDeposit} and ${selectedMethod.maxDeposit} ${selectedMethod.symbol || 'USD'}`);
      return;
    }

    setProcessing(true);
    socket.emit('processPayment', {
      type: activeTab,
      method: selectedMethod.id,
      amount: numAmount,
      currency: selectedMethod.symbol || 'USD'
    });
  };

  const calculateFees = (method, amount) => {
    const numAmount = parseFloat(amount) || 0;
    const feeRate = activeTab === 'deposit' ? method.fees.deposit : method.fees.withdrawal;
    return typeof feeRate === 'number' ? 
      (feeRate < 1 ? numAmount * feeRate : feeRate) : 0;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    }
    return `${amount.toFixed(8)} ${currency}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment Center</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'deposit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(walletBalances).map(([currency, balance]) => (
          <motion.div
            key={currency}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-700 rounded-lg p-4 text-center"
          >
            <div className="text-gray-400 text-sm">{currency}</div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(balance, currency)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Cryptocurrency</h3>
          <div className="space-y-3">
            {cryptoMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedMethod?.id === method.id
                    ? 'bg-gradient-to-r ' + method.color + ' shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-bold text-white">{method.name}</div>
                      <div className="text-sm text-gray-300">
                        {method.processingTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {activeTab === 'deposit' ? 'No fees' : `${method.fees.withdrawal} ${method.symbol} fee`}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="text-lg font-bold text-white mt-6">Traditional Methods</h3>
          <div className="space-y-3">
            {fiatMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedMethod?.id === method.id
                    ? 'bg-gradient-to-r ' + method.color + ' shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-bold text-white">{method.name}</div>
                      <div className="text-sm text-gray-300">
                        {method.processingTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {((activeTab === 'deposit' ? method.fees.deposit : method.fees.withdrawal) * 100).toFixed(1)}% fee
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h3>
          
          {selectedMethod ? (
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <div>
                  <div className="font-bold text-white">{selectedMethod.name}</div>
                  <div className="text-sm text-gray-400">
                    Min: {selectedMethod.minDeposit} {selectedMethod.symbol || 'USD'} | 
                    Max: {selectedMethod.maxDeposit} {selectedMethod.symbol || 'USD'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Amount ({selectedMethod.symbol || 'USD'})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ${selectedMethod.minDeposit}`}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 outline-none"
                />
              </div>

              {amount && (
                <div className="bg-gray-600 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {amount} {selectedMethod.symbol || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fees:</span>
                    <span className="text-red-400">
                      -{calculateFees(selectedMethod, amount).toFixed(8)} {selectedMethod.symbol || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-400">
                      {activeTab === 'deposit' ? 'You will receive:' : 'Total cost:'}
                    </span>
                    <span className="text-green-400">
                      {activeTab === 'deposit' 
                        ? (parseFloat(amount) - calculateFees(selectedMethod, amount)).toFixed(8)
                        : (parseFloat(amount) + calculateFees(selectedMethod, amount)).toFixed(8)
                      } {selectedMethod.symbol || 'USD'}
                    </span>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePayment}
                disabled={!amount || processing}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  amount && !processing
                    ? activeTab === 'deposit'
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `${activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount || '0'} ${selectedMethod.symbol || 'USD'}`
                )}
              </motion.button>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">Select a payment method</div>
              <div className="text-sm text-gray-500">
                Choose from cryptocurrency or traditional payment options
              </div>
            </div>
          )}

          {/* Quick Amount Buttons */}
          {selectedMethod && (
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Quick amounts:</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  selectedMethod.minDeposit,
                  selectedMethod.minDeposit * 5,
                  selectedMethod.minDeposit * 10,
                  selectedMethod.minDeposit * 25
                ].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    {quickAmount} {selectedMethod.symbol || 'USD'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">Recent Transactions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {transactions.slice(0, 10).map((tx, index) => (
              <motion.div
                key={tx.id || index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-between items-center p-3 bg-gray-600 rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500' :
                    tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="text-white font-medium">
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(tx.timestamp).toLocaleDateString()} - {tx.method}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                  </div>
                  <div className="text-gray-400 text-sm capitalize">
                    {tx.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {transactions.length === 0 && (
            <div className="text-gray-400 text-center py-4">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;

