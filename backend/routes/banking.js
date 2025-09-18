const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
const kycData = new Map();
const bankAccounts = new Map();
const documents = new Map();

// KYC levels and their limits
const kycLevels = {
  0: { name: 'Unverified', limits: { deposit: 100, withdrawal: 50 } },
  1: { name: 'Basic', limits: { deposit: 1000, withdrawal: 500 } },
  2: { name: 'Intermediate', limits: { deposit: 10000, withdrawal: 5000 } },
  3: { name: 'Advanced', limits: { deposit: 100000, withdrawal: 50000 } }
};

// Initialize KYC data for a user
const initializeKyc = (userId) => {
  if (!kycData.has(userId)) {
    kycData.set(userId, {
      level: 0,
      status: 'not_started',
      documents: [],
      limits: kycLevels[0].limits,
      personalInfo: null,
      verificationHistory: []
    });
  }
  if (!bankAccounts.has(userId)) {
    bankAccounts.set(userId, []);
  }
  if (!documents.has(userId)) {
    documents.set(userId, []);
  }
};

// Process document upload
const processDocumentUpload = async (userId, documentData) => {
  const { type, filename, size } = documentData;
  
  // Simulate document processing
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
  
  const document = {
    id: Date.now().toString(),
    type,
    filename,
    size,
    status: Math.random() > 0.2 ? 'approved' : 'pending', // 80% approval rate
    uploadedAt: Date.now(),
    processedAt: Date.now(),
    reason: null
  };
  
  // Simulate rejection for some documents
  if (document.status === 'pending' && Math.random() > 0.7) {
    document.status = 'rejected';
    document.reason = 'Document quality too low or information not clearly visible';
  }
  
  const userDocuments = documents.get(userId);
  userDocuments.push(document);
  documents.set(userId, userDocuments);
  
  // Update KYC data
  const userKyc = kycData.get(userId);
  userKyc.documents = userDocuments;
  
  // Check if level should be upgraded
  const approvedDocs = userDocuments.filter(doc => doc.status === 'approved');
  const newLevel = calculateKycLevel(approvedDocs);
  
  if (newLevel > userKyc.level) {
    userKyc.level = newLevel;
    userKyc.limits = kycLevels[newLevel].limits;
    userKyc.verificationHistory.push({
      level: newLevel,
      achievedAt: Date.now(),
      reason: 'Document verification completed'
    });
  }
  
  // Update status
  if (userKyc.level > 0) {
    userKyc.status = 'approved';
  } else if (approvedDocs.length > 0) {
    userKyc.status = 'pending';
  }
  
  kycData.set(userId, userKyc);
  
  return document;
};

// Calculate KYC level based on approved documents
const calculateKycLevel = (approvedDocuments) => {
  const docTypes = approvedDocuments.map(doc => doc.type);
  
  if (docTypes.includes('bank_statement') && docTypes.includes('selfie')) {
    return 3; // Advanced
  }
  if (docTypes.includes('utility_bill') && docTypes.includes('national_id')) {
    return 2; // Intermediate
  }
  if (docTypes.includes('passport') || docTypes.includes('drivers_license')) {
    return 1; // Basic
  }
  
  return 0; // Unverified
};

// Generate mock wallet addresses
const generateWalletAddress = (currency) => {
  const generators = {
    BTC: () => '1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ETH: () => '0x' + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15),
    USDT: () => '0x' + Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15)
  };
  
  return generators[currency] ? generators[currency]() : null;
};

// Socket events for banking system
const setupBankingSockets = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.userId || socket.id;
    
    socket.on('getKycStatus', () => {
      initializeKyc(userId);
      const userKyc = kycData.get(userId);
      socket.emit('kycStatusUpdate', userKyc);
    });
    
    socket.on('uploadKycDocument', async (documentData) => {
      initializeKyc(userId);
      
      try {
        const document = await processDocumentUpload(userId, documentData);
        
        socket.emit('documentUploaded', {
          success: true,
          document
        });
        
        // Send updated KYC status
        const userKyc = kycData.get(userId);
        socket.emit('kycStatusUpdate', userKyc);
        
      } catch (error) {
        socket.emit('documentUploaded', {
          success: false,
          error: error.message
        });
      }
    });
    
    socket.on('generateWalletAddress', (data) => {
      const { currency } = data;
      const address = generateWalletAddress(currency);
      
      if (address) {
        // Store address (in production, this would be saved to database)
        socket.emit('walletAddressGenerated', {
          currency,
          address
        });
      }
    });
    
    socket.on('getWalletAddresses', () => {
      // Return stored addresses (mock implementation)
      const addresses = {
        BTC: generateWalletAddress('BTC'),
        ETH: generateWalletAddress('ETH'),
        USDT: generateWalletAddress('USDT')
      };
      
      socket.emit('walletAddressUpdate', addresses);
    });
    
    socket.on('addBankAccount', (accountData) => {
      initializeKyc(userId);
      
      const account = {
        id: Date.now().toString(),
        ...accountData,
        verified: false,
        addedAt: Date.now()
      };
      
      const userAccounts = bankAccounts.get(userId);
      userAccounts.push(account);
      bankAccounts.set(userId, userAccounts);
      
      socket.emit('bankAccountUpdate', userAccounts);
    });
    
    socket.on('getBankAccounts', () => {
      initializeKyc(userId);
      const userAccounts = bankAccounts.get(userId);
      socket.emit('bankAccountUpdate', userAccounts);
    });
  });
};

// REST API endpoints
router.get('/kyc/:userId', (req, res) => {
  const { userId } = req.params;
  initializeKyc(userId);
  
  const userKyc = kycData.get(userId);
  res.json(userKyc);
});

router.post('/kyc/:userId/document', async (req, res) => {
  const { userId } = req.params;
  const documentData = req.body;
  
  initializeKyc(userId);
  
  try {
    const document = await processDocumentUpload(userId, documentData);
    const userKyc = kycData.get(userId);
    
    res.json({
      success: true,
      document,
      kycStatus: userKyc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/kyc/:userId/documents', (req, res) => {
  const { userId } = req.params;
  initializeKyc(userId);
  
  const userDocuments = documents.get(userId);
  res.json(userDocuments);
});

router.post('/kyc/:userId/personal-info', (req, res) => {
  const { userId } = req.params;
  const personalInfo = req.body;
  
  initializeKyc(userId);
  
  const userKyc = kycData.get(userId);
  userKyc.personalInfo = {
    ...personalInfo,
    updatedAt: Date.now()
  };
  kycData.set(userId, userKyc);
  
  res.json({
    success: true,
    kycStatus: userKyc
  });
});

router.get('/bank-accounts/:userId', (req, res) => {
  const { userId } = req.params;
  initializeKyc(userId);
  
  const userAccounts = bankAccounts.get(userId);
  res.json(userAccounts);
});

router.post('/bank-accounts/:userId', (req, res) => {
  const { userId } = req.params;
  const accountData = req.body;
  
  initializeKyc(userId);
  
  const account = {
    id: Date.now().toString(),
    ...accountData,
    verified: false,
    addedAt: Date.now()
  };
  
  const userAccounts = bankAccounts.get(userId);
  userAccounts.push(account);
  bankAccounts.set(userId, userAccounts);
  
  res.json({
    success: true,
    account,
    accounts: userAccounts
  });
});

router.post('/wallet-address/:userId', (req, res) => {
  const { userId } = req.params;
  const { currency } = req.body;
  
  const address = generateWalletAddress(currency);
  
  if (address) {
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

// Get KYC levels and requirements
router.get('/kyc-levels', (req, res) => {
  const levels = Object.entries(kycLevels).map(([level, data]) => ({
    level: parseInt(level),
    ...data,
    requirements: getKycRequirements(parseInt(level))
  }));
  
  res.json(levels);
});

// Get KYC requirements for a specific level
const getKycRequirements = (level) => {
  const requirements = {
    0: ['Email verification'],
    1: ['Phone verification', 'Identity document'],
    2: ['Address verification', 'Selfie verification'],
    3: ['Bank statement', 'Source of funds']
  };
  
  return requirements[level] || [];
};

router.get('/kyc-requirements/:level', (req, res) => {
  const { level } = req.params;
  const requirements = getKycRequirements(parseInt(level));
  
  res.json({
    level: parseInt(level),
    requirements
  });
});

module.exports = {
  router,
  setupBankingSockets,
  processDocumentUpload,
  calculateKycLevel,
  kycLevels
};