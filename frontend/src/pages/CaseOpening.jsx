import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown,
  Coins,
  Trophy,
  Star,
  Zap,
  Crown,
  Gift,
  Play
} from 'lucide-react';
import { SafeCase3D } from '../components/SafeWebGL';
import CaseOpeningReel from '../components/CaseOpeningReel';
import { useNotification } from '../context/NotificationContext';
import { useAudio } from '../context/AudioContext';

const CaseOpening = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('HIGHEST PRICE FIRST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState(null);
  const [showReel, setShowReel] = useState(false);
  const [winningItemIndex, setWinningItemIndex] = useState(0);
  
  const { success, win } = useNotification();
  const { gameAudio } = useAudio();

  // Mock case data (similar to Harvester.GG)
  const cases = [
    {
      id: 1,
      name: "LIFE OR DEATH",
      rarity: "legendary",
      price: "797.32",
      image: "/images/cases/life-or-death.png",
      items: [
        { name: "AK-47 Redline", rarity: "legendary", value: "45.20" },
        { name: "AWP Dragon Lore", rarity: "mythical", value: "2500.00" },
        { name: "Glock Fade", rarity: "epic", value: "156.80" }
      ]
    },
    {
      id: 2,
      name: "TROPHY HUNTER",
      rarity: "epic",
      price: "657.19",
      image: "/images/cases/trophy-hunter.png",
      items: [
        { name: "M4A4 Howl", rarity: "legendary", value: "890.50" },
        { name: "Karambit Fade", rarity: "mythical", value: "1200.00" },
        { name: "Desert Eagle Blaze", rarity: "rare", value: "78.90" }
      ]
    },
    {
      id: 3,
      name: "NIK'S ELIXIR",
      rarity: "rare",
      price: "219.14",
      image: "/images/cases/niks-elixir.png",
      items: [
        { name: "AK-47 Vulcan", rarity: "epic", value: "125.40" },
        { name: "USP-S Kill Confirmed", rarity: "rare", value: "89.30" },
        { name: "Five-Seven Monkey Business", rarity: "common", value: "12.50" }
      ]
    },
    {
      id: 4,
      name: "CHROMA 4EVER",
      rarity: "rare",
      price: "185.78",
      image: "/images/cases/chroma-4ever.png",
      items: [
        { name: "Butterfly Knife Fade", rarity: "mythical", value: "945.00" },
        { name: "MAC-10 Neon Rider", rarity: "epic", value: "34.20" },
        { name: "Tec-9 Ice Cap", rarity: "rare", value: "8.90" }
      ]
    },
    {
      id: 5,
      name: "SHROOMS SURPRISE",
      rarity: "mythical",
      price: "169.88",
      image: "/images/cases/shrooms-surprise.png",
      items: [
        { name: "Bayonet Doppler", rarity: "mythical", value: "567.80" },
        { name: "AK-47 Fire Serpent", rarity: "legendary", value: "234.50" },
        { name: "Glock Water Elemental", rarity: "rare", value: "23.40" }
      ]
    },
    // Second row
    {
      id: 6,
      name: "TYCOON'S TRINKETS",
      rarity: "epic",
      price: "133.07",
      image: "/images/cases/tycoons-trinkets.png",
      items: [
        { name: "StatTrak AK-47 Redline", rarity: "legendary", value: "78.90" },
        { name: "M4A1-S Hot Rod", rarity: "epic", value: "45.60" },
        { name: "P250 Asiimov", rarity: "rare", value: "12.30" }
      ]
    },
    {
      id: 7,
      name: "TOXIC WASTE",
      rarity: "common",
      price: "90.64",
      image: "/images/cases/toxic-waste.png",
      items: [
        { name: "Flip Knife Gamma Doppler", rarity: "mythical", value: "345.20" },
        { name: "AK-47 Neon Revolution", rarity: "epic", value: "67.80" },
        { name: "Desert Eagle Kumicho Dragon", rarity: "rare", value: "15.90" }
      ]
    },
    {
      id: 8,
      name: "FLOW'S VAULT",
      rarity: "rare",
      price: "66.16",
      image: "/images/cases/flows-vault.png",
      items: [
        { name: "Huntsman Knife Fade", rarity: "legendary", value: "189.50" },
        { name: "SSG 08 Blood in the Water", rarity: "epic", value: "34.20" },
        { name: "Five-Seven Case Hardened", rarity: "rare", value: "8.70" }
      ]
    },
    {
      id: 9,
      name: "TERRIFIER",
      rarity: "legendary",
      price: "58.33",
      image: "/images/cases/terrifier.png",
      items: [
        { name: "Shadow Daggers Fade", rarity: "mythical", value: "123.40" },
        { name: "AK-47 Bloodsport", rarity: "epic", value: "45.80" },
        { name: "Glock Twilight Galaxy", rarity: "rare", value: "11.20" }
      ]
    },
    {
      id: 10,
      name: "10% CHROMA",
      rarity: "epic",
      price: "38.84",
      image: "/images/cases/10-chroma.png",
      items: [
        { name: "Gut Knife Doppler", rarity: "legendary", value: "89.30" },
        { name: "M4A4 Desolate Space", rarity: "epic", value: "23.40" },
        { name: "USP-S Orion", rarity: "rare", value: "7.80" }
      ]
    }
  ];

  const filters = ['All', 'New', 'High Risk', 'Low Risk', 'Cheap'];
  const sortOptions = [
    'HIGHEST PRICE FIRST',
    'LOWEST PRICE FIRST', 
    'NEWEST FIRST',
    'MOST POPULAR'
  ];

  const rarityColors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythical: 'text-red-400'
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
      (selectedFilter === 'High Risk' && ['legendary', 'mythical'].includes(caseItem.rarity)) ||
      (selectedFilter === 'Low Risk' && ['common', 'rare'].includes(caseItem.rarity)) ||
      (selectedFilter === 'Cheap' && parseFloat(caseItem.price) < 100);
    
    return matchesSearch && matchesFilter;
  });

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleOpenCase = () => {
    if (!selectedCase) return;
    
    // Determine winning item
    const randomIndex = Math.floor(Math.random() * selectedCase.items.length);
    setWinningItemIndex(randomIndex);
    
    setIsOpening(true);
    setShowReel(true);
    gameAudio.betPlaced();
  };

  const handleReelComplete = (wonItem) => {
    setOpenedItem(wonItem);
    setIsOpening(false);
    
    gameAudio.win(parseFloat(wonItem.value));
    win(`You won: ${wonItem.name}!`, `$${wonItem.value}`);
  };

  const handleCloseReel = () => {
    setShowReel(false);
    setSelectedCase(null);
    setOpenedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                              radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">CASES</h1>
            </div>
            
            {/* User Balance */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-bold">6.54</span>
                </div>
              </div>
              <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full text-white font-bold transition-colors">
                SIGN IN
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search a case"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-slate-500 focus:outline-none"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-white px-4 py-3 pr-10 rounded-lg focus:border-slate-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group cursor-pointer"
              onClick={() => handleCaseSelect(caseItem)}
            >
              <div className="bg-slate-800 rounded-xl border border-slate-700 group-hover:border-slate-500 transition-all duration-300 overflow-hidden">
                {/* Safe 3D Case Preview */}
                <div className="h-40 relative">
                  <SafeCase3D
                    caseType={caseItem.rarity}
                    glowIntensity={1.5}
                  />
                  
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Case Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-2 truncate">{caseItem.name}</h3>
                  
                  {/* Rarity Progress Bar */}
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                    <motion.div
                      className={`h-1.5 rounded-full ${
                        caseItem.rarity === 'common' ? 'bg-gray-500' :
                        caseItem.rarity === 'rare' ? 'bg-blue-500' :
                        caseItem.rarity === 'epic' ? 'bg-purple-500' :
                        caseItem.rarity === 'legendary' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-bold">{caseItem.price}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Opening Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => !isOpening && setSelectedCase(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedCase.name}</h2>
                
                {/* Safe 3D Case Display */}
                <div className="h-64 mb-6">
                  <SafeCase3D
                    caseType={selectedCase.rarity}
                    isOpening={isOpening}
                    glowIntensity={2}
                    onOpenComplete={() => {}}
                  />
                </div>
                
                {/* Case Info */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{selectedCase.price}</span>
                  </div>
                  <p className={`font-medium capitalize ${rarityColors[selectedCase.rarity]}`}>
                    {selectedCase.rarity} Case
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCase(null)}
                    disabled={isOpening}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOpenCase}
                    disabled={isOpening}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {isOpening ? 'Opening...' : 'Open Case'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Opening Reel Modal */}
      <AnimatePresence>
        {showReel && selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (!isOpening && e.target === e.currentTarget) {
                handleCloseReel();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedCase.name}</h2>
                <p className="text-slate-400">Watch the reel and see what you win!</p>
              </div>
              
              <CaseOpeningReel
                isOpening={isOpening}
                onComplete={handleReelComplete}
                caseItems={selectedCase.items}
                winningIndex={winningItemIndex}
                duration={4000}
              />
              
              {!isOpening && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleCloseReel}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win Modal */}
      <AnimatePresence>
        {openedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-8 text-center max-w-md w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 text-white mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">🎉 YOU WON! 🎉</h2>
              <h3 className="text-xl font-bold text-white mb-2">{openedItem.name}</h3>
              <p className={`text-lg font-medium mb-4 ${rarityColors[openedItem.rarity]}`}>
                {openedItem.rarity.charAt(0).toUpperCase() + openedItem.rarity.slice(1)}
              </p>
              <div className="text-3xl font-bold text-white mb-6">${openedItem.value}</div>
              
              <button
                onClick={() => setOpenedItem(null)}
                className="bg-white text-yellow-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Collect Prize
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaseOpening;