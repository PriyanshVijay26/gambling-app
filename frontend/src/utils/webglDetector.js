// WebGL detection and fallback utilities

/**
 * Check if WebGL is supported by the browser and hardware
 */
export const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return false;
    }
    
    // Test basic WebGL functionality
    const program = gl.createProgram();
    const vertex = gl.createShader(gl.VERTEX_SHADER);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    
    if (!program || !vertex || !fragment) {
      return false;
    }
    
    // Clean up
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    
    return true;
  } catch (error) {
    console.warn('WebGL detection failed:', error);
    return false;
  }
};

/**
 * Get WebGL information for debugging
 */
export const getWebGLInfo = () => {
  if (!isWebGLSupported()) {
    return null;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    };
  } catch (error) {
    console.warn('Failed to get WebGL info:', error);
    return null;
  }
};

/**
 * Check if the current hardware/browser combination is problematic
 */
export const isProblematicWebGL = () => {
  const info = getWebGLInfo();
  if (!info) return true;
  
  // Known problematic combinations
  const problematicPatterns = [
    /Intel.*HD Graphics.*Direct3D9/i,
    /Microsoft Basic Render Driver/i,
    /ANGLE.*Direct3D9/i,
    /Software.*Renderer/i
  ];
  
  return problematicPatterns.some(pattern => 
    pattern.test(info.renderer) || pattern.test(info.vendor)
  );
};

/**
 * Storage key for WebGL preference
 */
const WEBGL_PREFERENCE_KEY = 'webgl_enabled_preference';

/**
 * Get user's WebGL preference
 */
export const getWebGLPreference = () => {
  try {
    const stored = localStorage.getItem(WEBGL_PREFERENCE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    
    // Default: enable WebGL if supported and not problematic
    return isWebGLSupported() && !isProblematicWebGL();
  } catch {
    return false;
  }
};

/**
 * Set user's WebGL preference
 */
export const setWebGLPreference = (enabled) => {
  try {
    localStorage.setItem(WEBGL_PREFERENCE_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.warn('Failed to save WebGL preference:', error);
  }
};

/**
 * Should we use WebGL based on support and user preference?
 */
export const shouldUseWebGL = () => {
  return isWebGLSupported() && getWebGLPreference();
};