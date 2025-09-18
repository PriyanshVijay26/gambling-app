import { createContext, useContext, useState } from 'react';

const SimpleSocketContext = createContext();

export const useSimpleSocket = () => {
  const context = useContext(SimpleSocketContext);
  if (!context) {
    throw new Error('useSimpleSocket must be used within a SimpleSocketProvider');
  }
  return context;
};

export const SimpleSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  
  console.log('🔧 SimpleSocketProvider rendering...');

  const contextValue = {
    connected,
    setConnected,
    test: () => console.log('Simple test works!')
  };

  return (
    <SimpleSocketContext.Provider value={contextValue}>
      {children}
    </SimpleSocketContext.Provider>
  );
};