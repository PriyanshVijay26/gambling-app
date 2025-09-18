import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const SocketTest = () => {
  const { socket, connected, testConnection } = useSocket();
  const [logs, setLogs] = useState([]);
  const [pingResult, setPingResult] = useState(null);

  useEffect(() => {
    if (socket) {
      const onPong = (data) => {
        console.log('🏓 Pong received:', data);
        setPingResult(data);
        addLog(`Pong received: ${JSON.stringify(data)}`);
      };

      socket.on('test:pong', onPong);
      return () => socket.off('test:pong', onPong);
    }
  }, [socket]);

  const addLog = (message) => {
    setLogs(prev => [
      ...prev.slice(-9), // Keep last 9 logs
      { id: Date.now(), message, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const handleTestConnection = () => {
    addLog('Testing connection...');
    const success = testConnection();
    if (!success) {
      addLog('Test failed - not connected');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setPingResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket.IO Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className="text-lg font-medium">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="border-t border-gray-700 pt-3">
                <div className="text-sm text-gray-400">Socket ID</div>
                <div className="font-mono text-sm">
                  {socket?.id || 'Not connected'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Transport</div>
                <div className="font-mono text-sm">
                  {socket?.io?.engine?.transport?.name || 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={handleTestConnection}
                disabled={!connected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
              >
                Send Ping Test
              </button>
              
              <button 
                onClick={clearLogs}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
              >
                Clear Logs
              </button>
              
              <a 
                href="/games/mines"
                className="block w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-center transition-colors"
              >
                Test Mines Game
              </a>
            </div>
          </div>
        </div>

        {/* Ping Result */}
        {pingResult && (
          <div className="mt-6 bg-green-900 border border-green-700 p-4 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">Latest Ping Result</h3>
            <pre className="text-sm text-green-300 overflow-x-auto">
              {JSON.stringify(pingResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Connection Logs</h3>
          <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex space-x-2">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900 border border-blue-700 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">Instructions</h3>
          <ol className="text-sm text-blue-300 space-y-1">
            <li>1. Make sure your backend server is running on port 3001</li>
            <li>2. Check that the connection status shows "Connected"</li>
            <li>3. Click "Send Ping Test" to verify bi-directional communication</li>
            <li>4. Check browser console for detailed logs</li>
            <li>5. If connected, try the "Test Mines Game" link</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SocketTest;