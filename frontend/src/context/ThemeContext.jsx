import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Predefined themes
const themes = {
  dark: {
    name: 'Dark',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8'
      }
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#e2e8f0'
      },
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        tertiary: '#64748b'
      }
    }
  },
  neon: {
    name: 'Neon',
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#00ff88',
        600: '#00cc6a',
        700: '#009951',
        800: '#007a40',
        900: '#005c30'
      },
      background: {
        primary: '#000011',
        secondary: '#111133',
        tertiary: '#222255'
      },
      text: {
        primary: '#00ff88',
        secondary: '#88ffcc',
        tertiary: '#ccffee'
      }
    }
  },
  casino: {
    name: 'Casino',
    colors: {
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      },
      background: {
        primary: '#1a0000',
        secondary: '#330000',
        tertiary: '#4d0000'
      },
      text: {
        primary: '#ffd700',
        secondary: '#ffeb99',
        tertiary: '#fff2cc'
      }
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${category}-${shade}`, value);
        });
      }
    });

    // Apply theme class
    root.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const changeTheme = async (themeName) => {
    if (themeName === currentTheme || !themes[themeName]) return;

    setIsTransitioning(true);
    
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transitioning');
    
    // Small delay for transition effect
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setCurrentTheme(themeName);
    localStorage.setItem('app-theme', themeName);
    
    // Remove transition class after theme change
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  };

  const value = {
    currentTheme,
    changeTheme,
    isTransitioning,
    themes,
    theme: themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Selector Component
export const ThemeSelector = ({ className = '' }) => {
  const { currentTheme, changeTheme, themes, isTransitioning } = useTheme();

  return (
    <div className={`bg-slate-800 p-6 rounded-xl border border-slate-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Choose Theme</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(themes).map(([key, theme]) => (
          <motion.button
            key={key}
            onClick={() => changeTheme(key)}
            disabled={isTransitioning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${currentTheme === key 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-slate-600 hover:border-slate-500'
              }
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Theme Preview */}
            <div className="flex gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: theme.colors.primary[500] }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: theme.colors.background.secondary }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: theme.colors.text.primary }}
              />
            </div>
            
            <span className="text-white text-sm font-medium">{theme.name}</span>
            
            {currentTheme === key && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {isTransitioning && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Applying theme...
          </div>
        </div>
      )}
    </div>
  );
};

// Theme transition wrapper component
export const ThemeTransition = ({ children }) => {
  const { isTransitioning } = useTheme();

  return (
    <motion.div
      animate={isTransitioning ? { opacity: 0.7 } : { opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};