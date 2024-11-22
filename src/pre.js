// Define the global context safely
var globalContext =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof self !== 'undefined'
    ? self
    : typeof global !== 'undefined'
    ? global
    : {};

// Check execution context
var isAudioWorklet =
  typeof AudioWorkletGlobalScope !== 'undefined' &&
  globalContext instanceof AudioWorkletGlobalScope;
var isWorker =
  !isAudioWorklet &&
  typeof WorkerGlobalScope !== 'undefined' &&
  globalContext instanceof WorkerGlobalScope;
var isBrowser = !isAudioWorklet && !isWorker && typeof window !== 'undefined';

// Set up the appropriate scope
var scope = isBrowser ? window : globalContext;

// Audio worklet loading handler
var audioWorkletHandler = {
  loadedWorklets: new Map(),

  async loadWorklet(url) {
    if (this.loadedWorklets.has(url)) {
      return this.loadedWorklets.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to load worklet at ${url}: ${response.statusText}`
        );
      }
      return url;
    } catch (error) {
      console.error('Error loading audio worklet:', error);
      throw error;
    }
  },
};

// Define the readAsync function required by Emscripten
async function readAsync(url) {
  const context = isAudioWorklet
    ? 'AudioWorklet'
    : isWorker
    ? 'Worker'
    : 'Main';
  console.log(`readAsync called with URL: ${url} in ${context} context`);

  if (url.endsWith('.js') && url.includes('audioworklet')) {
    return audioWorkletHandler.loadWorklet(url);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Error in readAsync: ${error}`);
    throw error;
  }
}

// Error handling setup
if (isBrowser) {
  try {
    window.addEventListener('error', function (e) {
      if (e.message && e.message.includes('audioworklet')) {
        console.error('Audio Worklet loading error:', e);
      }
    });
  } catch (e) {
    console.warn('Could not set up error handler:', e);
  }
}

// Safe console logging
var log = function (msg) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(msg);
  }
};

// Context logging
var context = isAudioWorklet ? 'AudioWorklet' : isWorker ? 'Worker' : 'Main';
log('Running in ' + context + ' context');

// Export to global scope if needed
if (isBrowser) {
  window.readAsync = readAsync;
  window.audioWorkletHandler = audioWorkletHandler;
}

// If we're in a worker context, provide necessary globals
if (isWorker || isAudioWorklet) {
  if (typeof window === 'undefined') {
    globalContext.window = globalContext;
  }
}
