import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// Sound configuration
const SOUNDS = {
  // UI Sounds
  click: { src: '/sounds/ui/click.mp3', volume: 0.6 },
  hover: { src: '/sounds/ui/hover.mp3', volume: 0.4 },
  error: { src: '/sounds/ui/error.mp3', volume: 0.7 },
  success: { src: '/sounds/ui/success.mp3', volume: 0.8 },
  
  // Game Sounds
  bet_placed: { src: '/sounds/game/bet-placed.mp3', volume: 0.7 },
  win_small: { src: '/sounds/game/win-small.mp3', volume: 0.8 },
  win_medium: { src: '/sounds/game/win-medium.mp3', volume: 0.9 },
  win_big: { src: '/sounds/game/win-big.mp3', volume: 1.0 },
  lose: { src: '/sounds/game/lose.mp3', volume: 0.6 },
  
  // Mines Game
  mines_reveal_safe: { src: '/sounds/mines/reveal-safe.mp3', volume: 0.7 },
  mines_reveal_mine: { src: '/sounds/mines/reveal-mine.mp3', volume: 0.9 },
  mines_cashout: { src: '/sounds/mines/cashout.mp3', volume: 0.8 },
  
  // Crash Game
  crash_rising: { src: '/sounds/crash/rising.mp3', volume: 0.6, loop: true },
  crash_crashed: { src: '/sounds/crash/crashed.mp3', volume: 0.9 },
  crash_cashout: { src: '/sounds/crash/cashout.mp3', volume: 0.8 },
  
  // Coin Flip
  coin_flip: { src: '/sounds/coinflip/flip.mp3', volume: 0.7 },
  coin_land: { src: '/sounds/coinflip/land.mp3', volume: 0.8 },
  
  // Ambient Music
  lobby_ambient: { src: '/sounds/ambient/lobby.mp3', volume: 0.3, loop: true },
  game_ambient: { src: '/sounds/ambient/game.mp3', volume: 0.2, loop: true }
};

// Create placeholder audio files in memory (will need actual files)
const createSilentAudio = (duration = 0.1) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  return source;
};

export const AudioProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  
  const audioRefs = useRef({});
  const currentMusic = useRef(null);

  // Initialize audio files
  const initializeAudio = useCallback(() => {
    Object.entries(SOUNDS).forEach(([key, config]) => {
      if (!audioRefs.current[key]) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.volume = config.volume * masterVolume;
          audio.loop = config.loop || false;
          
          // For now, we'll create silent audio objects
          // In production, you'd load actual audio files
          audioRefs.current[key] = audio;
        } catch (error) {
          console.warn(`Failed to load audio: ${key}`, error);
        }
      }
    });
  }, [masterVolume]);

  // Play sound effect
  const playSFX = useCallback((soundKey, options = {}) => {
    if (!isEnabled) return;
    
    const audio = audioRefs.current[soundKey];
    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.volume = (SOUNDS[soundKey]?.volume || 0.7) * sfxVolume * masterVolume * (options.volume || 1);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Audio play failed: ${soundKey}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundKey}`, error);
    }
  }, [isEnabled, sfxVolume, masterVolume]);

  // Play background music
  const playMusic = useCallback((musicKey) => {
    if (!isEnabled) return;

    // Stop current music
    if (currentMusic.current) {
      currentMusic.current.pause();
      currentMusic.current.currentTime = 0;
    }

    const audio = audioRefs.current[musicKey];
    if (!audio) return;

    try {
      audio.volume = (SOUNDS[musicKey]?.volume || 0.3) * musicVolume * masterVolume;
      audio.loop = true;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          currentMusic.current = audio;
        }).catch(error => {
          console.warn(`Music play failed: ${musicKey}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing music: ${musicKey}`, error);
    }
  }, [isEnabled, musicVolume, masterVolume]);

  // Stop music
  const stopMusic = useCallback(() => {
    if (currentMusic.current) {
      currentMusic.current.pause();
      currentMusic.current.currentTime = 0;
      currentMusic.current = null;
    }
  }, []);

  // Game-specific sound helpers
  const gameAudio = {
    // UI interactions
    click: () => playSFX('click'),
    hover: () => playSFX('hover'),
    error: () => playSFX('error'),
    success: () => playSFX('success'),
    
    // Betting
    betPlaced: () => playSFX('bet_placed'),
    
    // Wins/Losses
    win: (amount) => {
      if (amount > 1000) playSFX('win_big');
      else if (amount > 100) playSFX('win_medium');
      else playSFX('win_small');
    },
    lose: () => playSFX('lose'),
    
    // Mines game
    minesRevealSafe: () => playSFX('mines_reveal_safe'),
    minesRevealMine: () => playSFX('mines_reveal_mine'),
    minesCashout: () => playSFX('mines_cashout'),
    
    // Crash game
    crashRising: () => playSFX('crash_rising'),
    crashCrashed: () => {
      // Stop rising sound first
      if (audioRefs.current.crash_rising) {
        audioRefs.current.crash_rising.pause();
        audioRefs.current.crash_rising.currentTime = 0;
      }
      playSFX('crash_crashed');
    },
    crashCashout: () => playSFX('crash_cashout'),
    
    // Coin flip
    coinFlip: () => playSFX('coin_flip'),
    coinLand: () => playSFX('coin_land'),
    
    // Background music
    startLobbyMusic: () => playMusic('lobby_ambient'),
    startGameMusic: () => playMusic('game_ambient'),
    stopMusic: stopMusic
  };

  // Initialize audio on mount
  React.useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  // Update volumes when settings change
  React.useEffect(() => {
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (audio && SOUNDS[key]) {
        const config = SOUNDS[key];
        if (config.loop) {
          // Music
          audio.volume = config.volume * musicVolume * masterVolume;
        } else {
          // SFX
          audio.volume = config.volume * sfxVolume * masterVolume;
        }
      }
    });
  }, [masterVolume, musicVolume, sfxVolume]);

  const value = {
    isEnabled,
    setIsEnabled,
    masterVolume,
    setMasterVolume,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    playSFX,
    playMusic,
    stopMusic,
    gameAudio
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Audio settings component
export const AudioSettings = () => {
  const {
    isEnabled,
    setIsEnabled,
    masterVolume,
    setMasterVolume,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    gameAudio
  } = useAudio();

  return (
    <div className="bg-slate-800 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Audio Settings</h3>
      
      {/* Master Enable/Disable */}
      <div className="flex items-center justify-between">
        <label className="text-white">Audio Enabled</label>
        <button
          onClick={() => {
            setIsEnabled(!isEnabled);
            if (!isEnabled) gameAudio.click();
          }}
          className={`w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
      
      {/* Volume Sliders */}
      {isEnabled && (
        <>
          <div>
            <label className="text-white block mb-2">
              Master Volume ({Math.round(masterVolume * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-white block mb-2">
              Music Volume ({Math.round(musicVolume * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-white block mb-2">
              SFX Volume ({Math.round(sfxVolume * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={(e) => {
                setSfxVolume(parseFloat(e.target.value));
                gameAudio.click(); // Test sound
              }}
              className="w-full"
            />
          </div>
        </>
      )}
      
      {/* Test Buttons */}
      {isEnabled && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={gameAudio.success}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Test Success
          </button>
          <button
            onClick={gameAudio.error}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Test Error
          </button>
          <button
            onClick={() => gameAudio.win(500)}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Test Win
          </button>
        </div>
      )}
    </div>
  );
};