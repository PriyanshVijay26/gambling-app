import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage?.getItem('guestUser');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  });

  // Initialize socket connection
  useEffect(() => {
    try {
      console.log('🔌 Initializing Socket.IO connection...');
      
      let serverUrl;
      try {
        serverUrl = import.meta.env?.VITE_SERVER_URL || 'http://localhost:3001';
      } catch (error) {
        console.warn('Failed to read environment variable, using default:', error);
        serverUrl = 'http://localhost:3001';
      }
      console.log('🌐 Connecting to server:', serverUrl);
      
      const newSocket = io(serverUrl, {
        transports: ['polling', 'websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxHttpBufferSize: 1e8,
        autoConnect: true,
        forceNew: false,
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        console.log('🚀 Transport:', newSocket.io.engine.transport.name);
        setConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('🚫 Socket connection error:', error.message);
        console.error('🔍 Error details:', error);
        setConnected(false);
        setError(error.message);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setConnected(true);
        setError(null);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt', attemptNumber);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('🚫 Reconnection failed:', error.message);
        setError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('💀 Reconnection failed permanently');
        setError('Connection failed permanently');
      });

      newSocket.io.on('upgrade', () => {
        console.log('⬆️ Transport upgraded to:', newSocket.io.engine.transport.name);
      });

      newSocket.io.on('upgradeError', (error) => {
        console.warn('⚠️ Transport upgrade failed:', error);
      });

      newSocket.on('test:pong', (data) => {
        console.log('🏓 Pong received:', data);
      });

      setSocket(newSocket);

      return () => {
        console.log('🧹 Cleaning up socket connection...');
        if (newSocket) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('🔥 Fatal error initializing socket:', error);
      setError(`Fatal error: ${error.message}`);
    }
  }, []);

  // User management
  const updateUser = useCallback((userData) => {
    setUser(userData);
    try {
      localStorage.setItem('guestUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }, []);

  // Test connection function
  const testConnection = useCallback(() => {
    if (socket?.connected) {
      console.log('🧪 Testing connection...');
      socket.emit('test:ping', { 
        timestamp: Date.now(),
        message: 'Hello from frontend!' 
      });
      return true;
    } else {
      console.error('❌ Cannot test - socket not connected');
      return false;
    }
  }, [socket]);

  const contextValue = {
    socket,
    connected,
    user,
    setUser: updateUser,
    updateUser,
    testConnection,
    error,
    authModalOpen,
    setAuthModalOpen,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};