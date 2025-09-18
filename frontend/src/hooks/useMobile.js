import { useState, useEffect } from 'react';

// Custom hook for mobile detection and responsive features
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');
  const [touchSupport, setTouchSupport] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device detection
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Screen size categorization
      if (width < 640) setScreenSize('mobile');
      else if (width < 768) setScreenSize('mobile-lg');
      else if (width < 1024) setScreenSize('tablet');
      else if (width < 1280) setScreenSize('desktop');
      else setScreenSize('desktop-lg');
      
      // Orientation detection
      setOrientation(height > width ? 'portrait' : 'landscape');
      
      // Touch support detection
      setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    orientation,
    touchSupport,
    // Utility functions
    getGridCols: () => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      return 3;
    },
    getCardSize: () => {
      if (isMobile) return 'sm';
      if (isTablet) return 'md';
      return 'lg';
    }
  };
};

// Custom hook for touch gestures
export const useTouch = (elementRef, options = {}) => {
  const [touchData, setTouchData] = useState({
    isTouching: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0
  });

  const {
    onTouchStart = () => {},
    onTouchMove = () => {},
    onTouchEnd = () => {},
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {},
    onTap = () => {},
    onLongPress = () => {},
    swipeThreshold = 50,
    longPressDelay = 500
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let longPressTimer = null;
    let isLongPress = false;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const data = {
        isTouching: true,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0
      };
      
      setTouchData(data);
      onTouchStart(data, e);
      
      // Start long press timer
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        onLongPress(data, e);
      }, longPressDelay);
    };

    const handleTouchMove = (e) => {
      if (!touchData.isTouching) return;
      
      const touch = e.touches[0];
      const data = {
        ...touchData,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: touch.clientX - touchData.startX,
        deltaY: touch.clientY - touchData.startY
      };
      
      setTouchData(data);
      onTouchMove(data, e);
      
      // Clear long press if moved too much
      if (Math.abs(data.deltaX) > 10 || Math.abs(data.deltaY) > 10) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
    };

    const handleTouchEnd = (e) => {
      const data = { ...touchData, isTouching: false };
      setTouchData(data);
      onTouchEnd(data, e);
      
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      // Handle swipes
      const { deltaX, deltaY } = data;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > swipeThreshold || absY > swipeThreshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0) onSwipeRight(data, e);
          else onSwipeLeft(data, e);
        } else {
          // Vertical swipe
          if (deltaY > 0) onSwipeDown(data, e);
          else onSwipeUp(data, e);
        }
      } else if (!isLongPress && absX < 10 && absY < 10) {
        // Tap
        onTap(data, e);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [elementRef, touchData, options]);

  return touchData;
};

// Custom hook for viewport detection
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY
      });
    };

    const handleScroll = () => {
      setViewport(prev => ({
        ...prev,
        scrollY: window.scrollY
      }));
    };

    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return viewport;
};

// Custom hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};