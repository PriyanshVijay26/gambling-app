import React from 'react';

// Performance monitoring and analytics system
class AnalyticsManager {
  constructor() {
    this.enabled = true;
    this.events = [];
    this.errors = [];
    this.performance = {
      pageLoadTime: 0,
      renderTimes: {},
      memoryUsage: {},
      networkTimes: {}
    };
    
    // Backend API URL
    this.apiBaseUrl = 'http://localhost:3001';
    
    this.init();
  }

  init() {
    // Track page load performance
    this.trackPageLoad();
    
    // Set up error tracking
    this.setupErrorTracking();
    
    // Monitor memory usage
    this.monitorMemory();
    
    // Track network performance
    this.trackNetworkPerformance();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();
  }

  // Event tracking
  trackEvent(eventName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      timestamp: Date.now(),
      name: eventName,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      }
    };

    this.events.push(event);
    
    // Log important events immediately
    if (this.isImportantEvent(eventName)) {
      this.sendEventImmediate(event);
    }

    // Limit stored events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }

    console.log('Analytics Event:', eventName, properties);
  }

  // Error tracking
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      });
    });

    // React error boundary integration
    this.setupReactErrorTracking();
  }

  setupReactErrorTracking() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      const errorMessage = args[0];
      if (typeof errorMessage === 'string' && errorMessage.includes('React')) {
        this.trackError({
          type: 'react_error',
          message: errorMessage,
          details: args.slice(1)
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  trackError(error) {
    if (!this.enabled) return;

    const errorData = {
      timestamp: Date.now(),
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    this.errors.push(errorData);
    
    // Send critical errors immediately
    if (this.isCriticalError(error)) {
      this.sendErrorImmediate(errorData);
    }

    console.error('Analytics Error:', errorData);
  }

  // Performance tracking
  trackPageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        this.performance.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        this.trackEvent('page_load_complete', {
          loadTime: this.performance.pageLoadTime,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstContentfulPaint: this.getFirstContentfulPaint()
        });
      }, 0);
    });
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  // Component render time tracking
  trackRenderTime(componentName, startTime) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (!this.performance.renderTimes[componentName]) {
      this.performance.renderTimes[componentName] = [];
    }
    
    this.performance.renderTimes[componentName].push(renderTime);
    
    // Track slow renders
    if (renderTime > 100) {
      this.trackEvent('slow_component_render', {
        component: componentName,
        renderTime: renderTime
      });
    }
  }

  // Memory monitoring
  monitorMemory() {
    if (!performance.memory) return;

    setInterval(() => {
      const memory = performance.memory;
      this.performance.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      // Alert on high memory usage
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usagePercent > 90) {
        this.trackEvent('high_memory_usage', {
          usagePercent,
          usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024)
        });
      }
    }, 30000); // Check every 30 seconds
  }

  // Network performance tracking
  trackNetworkPerformance() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      return originalFetch.apply(window, args)
        .then(response => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.trackEvent('network_request', {
            url: typeof url === 'string' ? url : url.url,
            method: args[1]?.method || 'GET',
            status: response.status,
            duration,
            size: response.headers.get('content-length')
          });

          // Track slow requests
          if (duration > 3000) {
            this.trackEvent('slow_network_request', {
              url: typeof url === 'string' ? url : url.url,
              duration
            });
          }

          return response;
        })
        .catch(error => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.trackError({
            type: 'network_error',
            url: typeof url === 'string' ? url : url.url,
            message: error.message,
            duration
          });
          
          throw error;
        });
    };
  }

  // Game-specific analytics
  trackGameEvent(game, event, data = {}) {
    this.trackEvent(`game_${game}_${event}`, {
      game,
      ...data
    });
  }

  trackGamePerformance(game, metrics) {
    this.trackEvent('game_performance', {
      game,
      ...metrics
    });
  }

  // User session tracking
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  // Utility methods
  isImportantEvent(eventName) {
    const importantEvents = [
      'game_started',
      'game_won',
      'game_lost',
      'payment_completed',
      'user_registered'
    ];
    return importantEvents.includes(eventName);
  }

  isCriticalError(error) {
    const criticalTypes = [
      'payment_error',
      'game_crash',
      'data_loss'
    ];
    return criticalTypes.includes(error.type) || error.message?.includes('payment');
  }

  // Data reporting
  setupPeriodicReporting() {
    // Send analytics data every 5 minutes
    setInterval(() => {
      this.sendAnalyticsData();
    }, 5 * 60 * 1000);

    // Send data before page unload
    window.addEventListener('beforeunload', () => {
      this.sendAnalyticsData(true);
    });
  }

  sendAnalyticsData(immediate = false) {
    if (!this.enabled || (this.events.length === 0 && this.errors.length === 0)) return;

    const data = {
      events: this.events.splice(0), // Remove sent events
      errors: this.errors.splice(0), // Remove sent errors
      performance: this.performance,
      session: {
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
        timestamp: Date.now(),
        url: window.location.href
      }
    };

    if (immediate && navigator.sendBeacon) {
      // Use sendBeacon for reliable delivery during page unload
      navigator.sendBeacon(`${this.apiBaseUrl}/api/analytics`, JSON.stringify(data));
    } else {
      // Regular fetch for normal reporting
      fetch(`${this.apiBaseUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Failed to send analytics data:', error);
        // Put events back if sending failed
        this.events = [...data.events, ...this.events];
        this.errors = [...data.errors, ...this.errors];
      });
    }
  }

  sendEventImmediate(event) {
    fetch(`${this.apiBaseUrl}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).catch(error => {
      console.warn('Failed to send immediate event:', error);
    });
  }

  sendErrorImmediate(error) {
    fetch(`${this.apiBaseUrl}/api/analytics/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(error)
    }).catch(err => {
      console.warn('Failed to send immediate error:', err);
    });
  }

  // Performance measurement helpers
  startTiming(label) {
    performance.mark(`${label}_start`);
    return () => {
      performance.mark(`${label}_end`);
      performance.measure(label, `${label}_start`, `${label}_end`);
      
      const measurement = performance.getEntriesByName(label)[0];
      this.trackEvent('performance_timing', {
        label,
        duration: measurement.duration
      });
      
      return measurement.duration;
    };
  }

  // A/B testing support
  getVariant(testName, variants = ['A', 'B']) {
    const userId = this.getUserId();
    const hash = this.hashCode(userId + testName);
    const variantIndex = Math.abs(hash) % variants.length;
    const variant = variants[variantIndex];
    
    this.trackEvent('ab_test_assignment', {
      test: testName,
      variant,
      userId
    });
    
    return variant;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Configuration
  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  // Get analytics data for debugging
  getAnalyticsData() {
    return {
      events: this.events,
      errors: this.errors,
      performance: this.performance,
      enabled: this.enabled
    };
  }
}

// Create global instance
const analytics = new AnalyticsManager();

// Export for use in components
export default analytics;

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackGameEvent: analytics.trackGameEvent.bind(analytics),
    trackGamePerformance: analytics.trackGamePerformance.bind(analytics),
    startTiming: analytics.startTiming.bind(analytics),
    getVariant: analytics.getVariant.bind(analytics)
  };
};