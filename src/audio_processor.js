// src/audio_processor.js

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ready = false;
    this.port.onmessage = this.handleMessage.bind(this);
    // Remove initWasm call from constructor
  }

  async initWasm(wasmBytes) {
    try {
      const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
      this.wasmInstance = wasmModule.instance;
      this.process_sample = this.wasmInstance.exports.process_sample;
      this.ready = true;
      this.port.postMessage({ type: 'wasm-ready' });
    } catch (e) {
      console.error('Error loading WASM module:', e);
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.ready) {
      return true; // Keep the processor alive
    }
    const output = outputs[0];
    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        outputChannel[i] = this.process_sample();
      }
    }
    return true;
  }

  handleMessage(event) {
    if (event.data.type === 'setParameter') {
      // Handle parameter updates
      this.someParameter = event.data.value;
    } else if (event.data.type === 'load-wasm') {
      // Receive the WASM bytes and initialize the module
      this.initWasm(event.data.wasmBytes);
    }
  }
}

registerProcessor('audio-processor', AudioProcessor);
