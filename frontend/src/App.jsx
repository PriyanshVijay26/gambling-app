import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/ui/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CaseOpening from './pages/CaseOpening';
import SocketTest from './pages/SocketTest';
import Mines from './pages/games/Mines';
import EnhancedMines from './pages/games/EnhancedMines';
import CoinFlip from './pages/games/CoinFlip';
import Limbo from './pages/games/Limbo';
import Crash from './pages/games/Crash';
import Upgrader from './pages/games/Upgrader';
import MurderMystery from './pages/games/MurderMystery';
import Dice from './pages/games/Dice';
import Plinko from './pages/games/Plinko';
import Towers from './pages/games/Towers';
import { StatsDashboard } from './components/dashboard/StatsDashboard';
import { ScrollToTopButton } from './components/ui/AnimatedComponents';
import GuestAuthModal from './components/GuestAuthModal';
import { useSocket } from './context/SocketContext';
import analytics from './utils/analytics';
import './index.css';
import './styles/themes.css';

function App() {
  // Initialize analytics
  React.useEffect(() => {
    analytics.trackEvent('app_loaded');
  }, []);

  return (
    <ThemeProvider>
      <AudioProvider>
        <NotificationProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </NotificationProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { authModalOpen, setAuthModalOpen } = useSocket();

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar />
                <AnimatePresence mode="wait">
                  <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home />
                </motion.div>
              } />
              <Route path="/dashboard" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard />
                </motion.div>
              } />
              <Route path="/stats" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StatsDashboard />
                </motion.div>
              } />
              <Route path="/settings" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Settings />
                </motion.div>
              } />
              <Route path="/cases" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CaseOpening />
                </motion.div>
              } />
              <Route path="/enhanced-mines" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <EnhancedMines />
                </motion.div>
              } />
              <Route path="/socket-test" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SocketTest />
                </motion.div>
              } />
              <Route path="/games/mines" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Mines />
                </motion.div>
              } />
              <Route path="/games/coinflip" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <CoinFlip />
                </motion.div>
              } />
              <Route path="/games/limbo" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Limbo />
                </motion.div>
              } />
              <Route path="/games/crash" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Crash />
                </motion.div>
              } />
              <Route path="/games/upgrader" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Upgrader />
                </motion.div>
              } />
              <Route path="/games/murder-mystery" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <MurderMystery />
                </motion.div>
              } />
              <Route path="/games/dice" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dice />
                </motion.div>
              } />
              <Route path="/games/plinko" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plinko />
                </motion.div>
              } />
              <Route path="/games/towers" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Towers />
                </motion.div>
              } />
              </Routes>
            </AnimatePresence>
            <ScrollToTopButton />
        </div>
        <GuestAuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />
      </Router>
    );
}

export default App;
