import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BankingSystem = ({ user, socket }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [kycStatus, setKycStatus] = useState({
    level: 0,
    status: 'not_started',
    documents: [],
    limits: {
      deposit: 100,
      withdrawal: 50
    }
  });
  const [walletAddresses, setWalletAddresses] = useState({});
  const [bankAccounts, setBankAccounts] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const kycLevels = [
    {
      level: 0,
      name: 'Unverified',
      limits: { deposit: 100, withdrawal: 50 },
      requirements: ['Email verification'],
      color: 'from-gray-400 to-gray-600'
    },
    {
      level: 1,
      name: 'Basic',
      limits: { deposit: 1000, withdrawal: 500 },
      requirements: ['Phone verification', 'Identity document'],
      color: 'from-blue-400 to-blue-600'
    },
    {
      level: 2,
      name: 'Intermediate',
      limits: { deposit: 10000, withdrawal: 5000 },
      requirements: ['Address verification', 'Selfie verification'],
      color: 'from-green-400 to-green-600'
    },
    {
      level: 3,
      name: 'Advanced',
      limits: { deposit: 100000, withdrawal: 50000 },
      requirements: ['Bank statement', 'Source of funds'],
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const documentTypes = [
    { id: 'passport', name: 'Passport', required: true },
    { id: 'drivers_license', name: 'Driver\'s License', required: true },
    { id: 'national_id', name: 'National ID', required: true },
    { id: 'utility_bill', name: 'Utility Bill', required: false },
    { id: 'bank_statement', name: 'Bank Statement', required: false },
    { id: 'selfie', name: 'Selfie with ID', required: false }
  ];

  useEffect(() => {
    if (socket) {
      socket.on('kycStatusUpdate', (status) => {
        setKycStatus(status);
      });

      socket.on('walletAddressUpdate', (addresses) => {
        setWalletAddresses(addresses);
      });

      socket.on('bankAccountUpdate', (accounts) => {
        setBankAccounts(accounts);
      });

      socket.on('documentUploaded', (result) => {
        setUploadingDoc(false);
        if (result.success) {
          setKycStatus(prev => ({
            ...prev,
            documents: [...prev.documents, result.document]
          }));
        }
      });

      // Request initial data
      socket.emit('getKycStatus');
      socket.emit('getWalletAddresses');
      socket.emit('getBankAccounts');

      return () => {
        socket.off('kycStatusUpdate');
        socket.off('walletAddressUpdate');
        socket.off('bankAccountUpdate');
        socket.off('documentUploaded');
      };
    }
  }, [socket]);

  const handleDocumentUpload = (event, docType) => {
    const file = event.target.files[0];
    if (file && !uploadingDoc) {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', docType);
      
      // Simulate file upload
      socket.emit('uploadKycDocument', {
        type: docType,
        filename: file.name,
        size: file.size
      });
    }
  };

  const generateWalletAddress = (currency) => {
    socket.emit('generateWalletAddress', { currency });
  };

  const addBankAccount = (accountData) => {
    socket.emit('addBankAccount', accountData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const currentLevel = kycLevels.find(level => level.level === kycStatus.level) || kycLevels[0];

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Banking & KYC</h2>
        <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentLevel.color}`}>
          <span className="text-white font-bold">{currentLevel.name}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-gray-700">
        {['overview', 'kyc', 'wallets', 'bank-accounts'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeSection === section
                ? 'bg-blue-600 text-white border-b-2 border-blue-500'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* KYC Level Progress */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Verification Level</h3>
              <div className="space-y-4">
                {kycLevels.map((level, index) => (
                  <div key={level.level} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kycStatus.level >= level.level
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}>
                      {kycStatus.level >= level.level ? '✓' : level.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${
                          kycStatus.level >= level.level ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {level.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          Daily: {formatCurrency(level.limits.deposit)} / {formatCurrency(level.limits.withdrawal)}
                        </span>
                      </div>
                      {index < kycLevels.length - 1 && (
                        <div className="w-full bg-gray-600 h-1 mt-2">
                          <div
                            className="bg-green-500 h-1 transition-all duration-500"
                            style={{
                              width: kycStatus.level > level.level ? '100%' : '0%'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Daily Deposit Limit</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(currentLevel.limits.deposit)}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Daily Withdrawal Limit</div>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(currentLevel.limits.withdrawal)}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">KYC Status</div>
                <div className={`text-2xl font-bold capitalize ${
                  kycStatus.status === 'approved' ? 'text-green-400' :
                  kycStatus.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {kycStatus.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'kyc' && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Document Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTypes.map((docType) => {
                  const uploaded = kycStatus.documents.find(doc => doc.type === docType.id);
                  return (
                    <div key={docType.id} className="bg-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-medium">{docType.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          uploaded?.status === 'approved' ? 'bg-green-500 text-white' :
                          uploaded?.status === 'pending' ? 'bg-yellow-500 text-black' :
                          uploaded?.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {uploaded?.status || 'Not uploaded'}
                        </span>
                      </div>
                      
                      {!uploaded ? (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentUpload(e, docType.id)}
                            className="hidden"
                            id={`upload-${docType.id}`}
                            disabled={uploadingDoc}
                          />
                          <label
                            htmlFor={`upload-${docType.id}`}
                            className="block w-full p-3 border-2 border-dashed border-gray-500 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                          >
                            {uploadingDoc ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <div className="text-gray-400 mb-1">Click to upload</div>
                                <div className="text-xs text-gray-500">JPG, PNG, PDF (max 5MB)</div>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">
                            Uploaded: {new Date(uploaded.uploadedAt).toLocaleDateString()}
                          </div>
                          {uploaded.status === 'rejected' && uploaded.reason && (
                            <div className="text-sm text-red-400">
                              Reason: {uploaded.reason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
              <div className="space-y-3">
                {currentLevel.level < 3 && (
                  <div className="text-gray-300">
                    To reach <span className="text-green-400 font-bold">
                      {kycLevels[currentLevel.level + 1].name}
                    </span> level:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {kycLevels[currentLevel.level + 1].requirements.map((req, index) => (
                        <li key={index} className="text-gray-400">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'wallets' && (
          <motion.div
            key="wallets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Cryptocurrency Wallets</h3>
              <div className="space-y-4">
                {['BTC', 'ETH', 'USDT'].map((currency) => (
                  <div key={currency} className="bg-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">{currency} Wallet</div>
                        <div className="text-gray-400 text-sm">
                          {walletAddresses[currency] ? 'Address generated' : 'No address generated'}
                        </div>
                      </div>
                      {!walletAddresses[currency] ? (
                        <button
                          onClick={() => generateWalletAddress(currency)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Generate Address
                        </button>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs text-gray-400 mb-1">Deposit Address:</div>
                          <div className="text-sm text-green-400 font-mono break-all max-w-xs">
                            {walletAddresses[currency]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'bank-accounts' && (
          <motion.div
            key="bank-accounts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Bank Accounts</h3>
                <button
                  onClick={() => {/* Open add bank account modal */}}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Account
                </button>
              </div>
              
              <div className="space-y-3">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((account, index) => (
                    <div key={index} className="bg-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold">{account.bankName}</div>
                          <div className="text-gray-400">
                            ****{account.accountNumber.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs ${
                            account.verified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                          }`}>
                            {account.verified ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No bank accounts added yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BankingSystem;

