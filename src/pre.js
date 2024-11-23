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

// Context logging
var context = isAudioWorklet ? 'AudioWorklet' : isWorker ? 'Worker' : 'Main';
console.log('Running in ' + context + ' context');

// If we're in a worker context, provide necessary globals
if (isWorker || isAudioWorklet) {
  if (typeof window === 'undefined') {
    globalContext.window = globalContext;
  }
}
