import React, { useState, useEffect, Suspense } from 'react';
import { shouldUseWebGL, setWebGLPreference, getWebGLInfo, isProblematicWebGL } from '../utils/webglDetector';
import { FallbackCase, WebGLNotSupported } from './FallbackComponents';

// Simple error boundary class component
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebGL Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error, () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) this.props.onReset();
      });
    }

    return this.props.children;
  }
}

// Error fallback component
const WebGLErrorFallback = ({ error, resetErrorBoundary, onDisableWebGL }) => (
  <div className="w-full h-40 bg-slate-800 border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-4 text-center">
    <div className="text-red-400 text-sm mb-2">3D Graphics Error</div>
    <div className="text-slate-400 text-xs mb-3 max-w-xs">
      {error.message.includes('WebGL') ? 'WebGL initialization failed' : 'Graphics rendering error'}
    </div>
    <div className="flex gap-2">
      <button
        onClick={resetErrorBoundary}
        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
      >
        Retry
      </button>
      <button
        onClick={onDisableWebGL}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
      >
        Disable 3D
      </button>
    </div>
  </div>
);

// Loading component for Suspense
const WebGLLoading = () => (
  <div className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full"></div>
  </div>
);

// Lazy load the 3D components to avoid loading them if WebGL is not supported
const LazyCanvas = React.lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })));
const LazyEnvironment = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.Environment })));
const LazyOrbitControls = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.OrbitControls })));
const LazyProfessionalCase = React.lazy(() => 
  import('./3d/Game3DComponents').then(module => ({ default: module.ProfessionalCase }))
);

// Wrapper component for 3D case with fallback
export const SafeCase3D = ({ 
  caseType, 
  isOpening = false, 
  glowIntensity = 1.0,
  onOpenComplete = () => {} 
}) => {
  const [useWebGL, setUseWebGL] = useState(shouldUseWebGL());
  const [key, setKey] = useState(0); // For resetting error boundary

  useEffect(() => {
    // Check if WebGL is problematic and show warning
    if (useWebGL && isProblematicWebGL()) {
      console.warn('WebGL may be unstable on this system. Consider disabling 3D graphics for better performance.');
    }
  }, [useWebGL]);

  const handleDisableWebGL = () => {
    setWebGLPreference(false);
    setUseWebGL(false);
    console.log('WebGL disabled by user preference');
  };

  const handleEnableWebGL = () => {
    setWebGLPreference(true);
    setUseWebGL(true);
    setKey(prev => prev + 1); // Reset error boundary
    console.log('WebGL enabled by user preference');
  };

  const handleError = (error) => {
    console.error('WebGL Error:', error);
    
    // Auto-disable WebGL if we get certain types of errors
    if (error.message.includes('WebGL') || error.message.includes('context')) {
      handleDisableWebGL();
    }
  };

  if (!useWebGL) {
    return <FallbackCase caseType={caseType} isOpening={isOpening} glowIntensity={glowIntensity} />;
  }

  return (
    <ErrorBoundary
      key={key}
      FallbackComponent={(props) => (
        <WebGLErrorFallback {...props} onDisableWebGL={handleDisableWebGL} />
      )}
      onError={handleError}
      onReset={() => setKey(prev => prev + 1)}
    >
      <Suspense fallback={<WebGLLoading />}>
        <LazyCanvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <LazyEnvironment preset="warehouse" />
          <LazyProfessionalCase
            caseType={caseType}
            isOpening={isOpening}
            glowIntensity={glowIntensity}
            onOpenComplete={onOpenComplete}
          />
          <LazyOrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={3}
          />
        </LazyCanvas>
      </Suspense>
    </ErrorBoundary>
  );
};

// Wrapper for full Canvas scenes
export const SafeCanvas3D = ({ children, fallback, ...canvasProps }) => {
  const [useWebGL, setUseWebGL] = useState(shouldUseWebGL());
  const [key, setKey] = useState(0);

  const handleDisableWebGL = () => {
    setWebGLPreference(false);
    setUseWebGL(false);
  };

  const handleEnableWebGL = () => {
    setWebGLPreference(true);
    setUseWebGL(true);
    setKey(prev => prev + 1);
  };

  if (!useWebGL) {
    return fallback || <WebGLNotSupported onEnableWebGL={handleEnableWebGL} />;
  }

  return (
    <WebGLErrorBoundary
      key={key}
      fallback={(error, resetErrorBoundary) => (
        <WebGLErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} onDisableWebGL={handleDisableWebGL} />
      )}
      onReset={() => setKey(prev => prev + 1)}
    >
      <Suspense fallback={<WebGLLoading />}>
        <LazyCanvas {...canvasProps}>
          {children}
        </LazyCanvas>
      </Suspense>
    </WebGLErrorBoundary>
  );
};

// Settings component for WebGL preferences
export const WebGLSettings = () => {
  const [useWebGL, setUseWebGL] = useState(shouldUseWebGL());
  const [webglInfo, setWebglInfo] = useState(null);

  useEffect(() => {
    setWebglInfo(getWebGLInfo());
  }, []);

  const handleToggle = () => {
    const newValue = !useWebGL;
    setWebGLPreference(newValue);
    setUseWebGL(newValue);
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h3 className="text-white font-semibold mb-3">3D Graphics Settings</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white text-sm">Enable 3D Graphics</div>
          <div className="text-slate-400 text-xs">Use WebGL for enhanced visual effects</div>
        </div>
        <button
          onClick={handleToggle}
          className={`w-12 h-6 rounded-full transition-colors ${
            useWebGL ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            useWebGL ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {webglInfo && (
        <div className="text-xs text-slate-400 space-y-1">
          <div>GPU: {webglInfo.renderer}</div>
          <div>WebGL: {webglInfo.version}</div>
          {isProblematicWebGL() && (
            <div className="text-yellow-400">⚠️ Limited 3D support detected</div>
          )}
        </div>
      )}
    </div>
  );
};