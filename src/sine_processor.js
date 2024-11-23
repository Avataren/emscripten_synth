// src/sine_processor.js

class SineProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'frequency',
        defaultValue: 440.0,
        minValue: 0.0,
        maxValue: 20000.0,
        automationRate: 'a-rate',
      },
    ];
  }

  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.phase = 0.0;
    this.ready = false;
    this.sampleRate = sampleRate; // Use the sampleRate provided by the AudioWorkletGlobalScope
  }

  async initWasm(wasmBytes) {
    try {
      const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
      this.wasmInstance = wasmModule.instance;
      this.processBlock = this.wasmInstance.exports.process_block;

      // Get the memory buffer
      this.memory = this.wasmInstance.exports.memory;
      if (!this.memory) {
        throw new Error('WebAssembly memory is not exported.');
      }

      // Allocate space in the WASM memory
      this.bufferPtr = 0; // We'll allocate starting at offset 0
      this.phasePtr = 1024; // Offset for the phase (8 bytes for double)

      // Initialize phase in WASM memory
      new Float64Array(this.memory.buffer, this.phasePtr, 1)[0] = this.phase;

      this.ready = true;
      this.port.postMessage({ type: 'wasm-ready' });
    } catch (e) {
      console.error('Error loading WASM module:', e);
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.ready) {
      return true;
    }

    const output = outputs[0];
    const numChannels = output.length;
    const numSamples = output[0].length;

    // Ensure the buffer is large enough
    if (this.bufferLength !== numSamples) {
      this.bufferLength = numSamples;
      this.outputBuffer = new Float32Array(
        this.memory.buffer,
        this.bufferPtr,
        numSamples
      );
    }

    // Get the frequency parameter
    const frequencyParam = parameters.frequency;
    let frequency =
      frequencyParam.length === 1 ? frequencyParam[0] : frequencyParam;

    // Handle frequency automation (simplified for per-block frequency)
    if (frequencyParam.length === 1) {
      // Constant frequency
      this.processBlock(
        this.bufferPtr,
        numSamples,
        frequency,
        this.phasePtr,
        this.sampleRate
      );
    } else {
      // For per-sample frequency, you would need to adjust the C++ code
      // For simplicity, we'll use the first frequency value
      frequency = frequencyParam[0];
      this.processBlock(
        this.bufferPtr,
        numSamples,
        frequency,
        this.phasePtr,
        this.sampleRate
      );
    }

    // Write the output to all channels
    for (let channel = 0; channel < numChannels; ++channel) {
      output[channel].set(this.outputBuffer);
    }

    return true;
  }

  handleMessage(event) {
    if (event.data.type === 'load-wasm') {
      this.initWasm(event.data.wasmBytes);
    }
  }
}

registerProcessor('sine-processor', SineProcessor);
