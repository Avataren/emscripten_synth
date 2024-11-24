// src/wave_processor_worklet.js

// `wasmBinary` is defined in the generated `wave_processor_wasm.js`

class WaveProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'frequency',
        defaultValue: 440.0,
        minValue: 20.0,
        maxValue: 20000.0,
        automationRate: 'a-rate',
      },
    ];
  }

  constructor() {
    super();

    this.port.onmessage = this.handleMessage.bind(this);
    this.sampleRate = sampleRate;
    this.ready = false;
    this.oscillatorId = null;

    this.initWasm();
  }

  initWasm() {
    try {
      // Instantiate the WASM module synchronously
      const wasmModule = new WebAssembly.Module(wasmBinary);

      const importObject = {
        env: {
          memory: new WebAssembly.Memory({
            initial: 256,
            maximum: 512,
            shared: true,
          }),
          // Add any other imports your WASM module requires
        },
      };

      this.wasmInstance = new WebAssembly.Instance(wasmModule, importObject);

      // Initialize wavetables
      this.wasmInstance.exports.initialize_wavetables();

      // Get wavetable data pointers
      const wavetableDataPtr =
        this.wasmInstance.exports.get_wavetable_data_ptr();
      const wavetableDataSize =
        this.wasmInstance.exports.get_wavetable_data_size();
      const waveTableLengthsPtr =
        this.wasmInstance.exports.get_wave_table_lengths_ptr();
      const numWaveTables = this.wasmInstance.exports.get_num_wave_tables();

      // Allocate output buffer
      this.outputBufferPtr = this.wasmInstance.exports.malloc(
        128 * Float32Array.BYTES_PER_ELEMENT
      );
      this.outputBuffer = new Float32Array(
        this.wasmInstance.exports.memory.buffer,
        this.outputBufferPtr,
        128
      );

      // Create oscillator instance
      this.oscillatorId = this.wasmInstance.exports.create_oscillator(
        wavetableDataPtr,
        waveTableLengthsPtr,
        numWaveTables,
        1 // Indicate using shared memory
      );

      this.ready = true;
      this.port.postMessage({ type: 'wasm-ready' });
    } catch (e) {
      console.error('Error initializing WASM module:', e);
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.ready) {
      // Return true to keep the processor alive
      return true;
    }

    const output = outputs[0];
    const numChannels = output.length;
    const numSamples = output[0].length;

    // Get frequency parameter
    const frequencyParam = parameters.frequency;
    let frequency;
    if (frequencyParam.length === 1) {
      frequency = frequencyParam[0];
    } else {
      // Handle per-sample frequency changes if needed
      frequency = frequencyParam[0]; // Simplification
    }

    // Set frequency in WASM
    this.wasmInstance.exports.set_frequency(
      this.oscillatorId,
      frequency,
      this.sampleRate
    );

    // Process block in WASM
    this.wasmInstance.exports.process_block(
      this.oscillatorId,
      this.outputBufferPtr,
      numSamples
    );

    // Copy output to audio buffer
    for (let channel = 0; channel < numChannels; ++channel) {
      output[channel].set(this.outputBuffer.subarray(0, numSamples));
    }

    return true;
  }

  handleMessage(event) {
    // Handle messages if needed
  }

  destructor() {
    if (this.oscillatorId !== null) {
      this.wasmInstance.exports.delete_oscillator(this.oscillatorId);
      this.oscillatorId = null;
    }
    if (this.outputBufferPtr) {
      this.wasmInstance.exports.free(this.outputBufferPtr);
    }
  }
}

registerProcessor('wave-processor', WaveProcessor);
