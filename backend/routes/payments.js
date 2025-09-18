const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
const walletBalances = new Map();
const transactions = new Map();
const walletAddresses = new Map();

// Initialize wallet for a user
const initializeWallet = (userId) => {
  if (!walletBalances.has(userId)) {
    walletBalances.set(userId, {
      BTC: 0,
      ETH: 0,
      USDT: 0,
      USD: 0
    });
  }
  if (!transactions.has(userId)) {
    transactions.set(userId, []);
  }
  if (!walletAddresses.has(userId)) {
    walletAddresses.set(userId, {});
  }
};

// Generate mock wallet addresses
const generateWalletAddress = (currency) => {
  const addresses = {
    BTC: () => '1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ETH: () => '0x' + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15),
    USDT: () => '0x' + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15)
  };
  
  return addresses[currency] ? addresses[currency]() : null;
};

// Process payment (mock implementation)
const processPayment = async (userId, paymentData) => {
  const { type, method, amount, currency } = paymentData;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
  
  const transaction = {
    id: Date.now().toString(),
    type,
    method,
    amount,
    currency,
    status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
    timestamp: Date.now(),
    fees: calculateFees(method, amount, type)
  };
  
  // Add to transaction history
  const userTransactions = transactions.get(userId);
  userTransactions.unshift(transaction);
  transactions.set(userId, userTransactions);
  
  // Update balance if successful
  if (transaction.status === 'completed') {
    const balances = walletBalances.get(userId);
    if (type === 'deposit') {
      balances[currency] += amount - transaction.fees;
    } else {
      balances[currency] -= amount + transaction.fees;
    }
    walletBalances.set(userId, balances);
  }
  
  return transaction;
};

// Calculate fees based on payment method and type
const calculateFees = (method, amount, type) => {
  const feeStructure = {
    bitcoin: { deposit: 0, withdrawal: 0.0005 },
    ethereum: { deposit: 0, withdrawal: 0.005 },
    usdt: { deposit: 0, withdrawal: 1 },
    visa: { deposit: 0.025, withdrawal: 0.03 },
    mastercard: { deposit: 0.025, withdrawal: 0.03 },
    paypal: { deposit: 0.035, withdrawal: 0.04 }
  };
  
  const methodFees = feeStructure[method] || { deposit: 0, withdrawal: 0 };
  const feeRate = methodFees[type] || 0;
  
  return feeRate < 1 ? amount * feeRate : feeRate;
};

// Socket events for payment system
const setupPaymentSockets = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.userId || socket.id;
    
    socket.on('getWalletBalances', () => {
      initializeWallet(userId);
      const balances = walletBalances.get(userId);
      socket.emit('walletUpdate', balances);
    });
    
    socket.on('getTransactionHistory', () => {
      initializeWallet(userId);
      const userTransactions = transactions.get(userId);
      socket.emit('transactionHistory', userTransactions.slice(0, 50));
    });
    
    socket.on('processPayment', async (paymentData) => {
      initializeWallet(userId);
      
      try {
        const transaction = await processPayment(userId, paymentData);
        
        socket.emit('paymentProcessed', {
          success: transaction.status === 'completed',
          transaction
        });
        
        if (transaction.status === 'completed') {
          const balances = walletBalances.get(userId);
          socket.emit('walletUpdate', balances);
        }
        
        socket.emit('transactionUpdate', transaction);
        
      } catch (error) {
        socket.emit('paymentProcessed', {
          success: false,
          error: error.message
        });
      }
    });
    
    socket.on('generateWalletAddress', (data) => {
      const { currency } = data;
      const address = generateWalletAddress(currency);
      
      if (address) {
        const addresses = walletAddresses.get(userId);
        addresses[currency] = address;
        walletAddresses.set(userId, addresses);
        
        socket.emit('walletAddressUpdate', addresses);
      }
    });
    
    socket.on('getWalletAddresses', () => {
      initializeWallet(userId);
      const addresses = walletAddresses.get(userId);
      socket.emit('walletAddressUpdate', addresses);
    });
  });
};

// REST API endpoints
router.get('/balances/:userId', (req, res) => {
  const { userId } = req.params;
  initializeWallet(userId);
  
  const balances = walletBalances.get(userId);
  res.json(balances);
});

router.get('/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  initializeWallet(userId);
  const userTransactions = transactions.get(userId);
  
  res.json({
    transactions: userTransactions.slice(offset, offset + parseInt(limit)),
    total: userTransactions.length
  });
});

router.post('/deposit/:userId', async (req, res) => {
  const { userId } = req.params;
  const paymentData = { ...req.body, type: 'deposit' };
  
  initializeWallet(userId);
  
  try {
    const transaction = await processPayment(userId, paymentData);
    res.json({
      success: transaction.status === 'completed',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/withdraw/:userId', async (req, res) => {
  const { userId } = req.params;
  const paymentData = { ...req.body, type: 'withdrawal' };
  
  initializeWallet(userId);
  
  // Check if user has sufficient balance
  const balances = walletBalances.get(userId);
  const requiredAmount = paymentData.amount + calculateFees(paymentData.method, paymentData.amount, 'withdrawal');
  
  if (balances[paymentData.currency] < requiredAmount) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient balance'
    });
  }
  
  try {
    const transaction = await processPayment(userId, paymentData);
    res.json({
      success: transaction.status === 'completed',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/address/:userId', (req, res) => {
  const { userId } = req.params;
  const { currency } = req.body;
  
  initializeWallet(userId);
  
  const address = generateWalletAddress(currency);
  if (address) {
    const addresses = walletAddresses.get(userId);
    addresses[currency] = address;
    walletAddresses.set(userId, addresses);
    
    res.json({
      success: true,
      currency,
      address
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Unsupported currency'
    });
  }
});

router.get('/addresses/:userId', (req, res) => {
  const { userId } = req.params;
  initializeWallet(userId);
  
  const addresses = walletAddresses.get(userId);
  res.json(addresses);
});

// Get payment methods and their limits
router.get('/methods', (req, res) => {
  const methods = {
    crypto: [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        minDeposit: 0.001,
        maxDeposit: 10,
        fees: { deposit: 0, withdrawal: 0.0005 },
        processingTime: '10-30 minutes'
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        minDeposit: 0.01,
        maxDeposit: 100,
        fees: { deposit: 0, withdrawal: 0.005 },
        processingTime: '2-15 minutes'
      },
      {
        id: 'usdt',
        name: 'Tether USDT',
        symbol: 'USDT',
        minDeposit: 10,
        maxDeposit: 50000,
        fees: { deposit: 0, withdrawal: 1 },
        processingTime: '5-20 minutes'
      }
    ],
    fiat: [
      {
        id: 'visa',
        name: 'Visa',
        minDeposit: 10,
        maxDeposit: 5000,
        fees: { deposit: 0.025, withdrawal: 0.03 },
        processingTime: 'Instant'
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        minDeposit: 10,
        maxDeposit: 5000,
        fees: { deposit: 0.025, withdrawal: 0.03 },
        processingTime: 'Instant'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        minDeposit: 5,
        maxDeposit: 2000,
        fees: { deposit: 0.035, withdrawal: 0.04 },
        processingTime: 'Instant'
      }
    ]
  };
  
  res.json(methods);
});

module.exports = {
  router,
  setupPaymentSockets,
  processPayment,
  calculateFees
};