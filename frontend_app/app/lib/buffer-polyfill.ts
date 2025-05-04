// Buffer polyfill for browser environments
if (typeof window !== 'undefined') {
  try {
    // Attempt to polyfill Buffer globally
    if (!window.Buffer) {
      // Import the buffer package
      import('buffer').then(({ Buffer }) => {
        (window as any).Buffer = Buffer;
        console.log('Buffer polyfill loaded');
      }).catch(err => {
        console.warn('Failed to load Buffer polyfill:', err);
      });
    }

    // Handle dynamic requires by adding a global error handler
    const originalRequire = (window as any).require;
    (window as any).require = function(moduleName: string) {
      if (moduleName === 'buffer' || moduleName === 'Buffer') {
        const bufferModule = require('buffer');
        return bufferModule;
      }
      // Fall back to the original require if it exists
      if (originalRequire) {
        return originalRequire(moduleName);
      }
      // If there's no require function, just return an empty object
      console.warn(`Mock require called for: ${moduleName}`);
      return {};
    };
  } catch (error) {
    console.warn('Error setting up Buffer polyfill:', error);
  }
} 