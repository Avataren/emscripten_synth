// src/main.js

async function initAudio() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Add the AudioWorklet modules
    await audioContext.audioWorklet.addModule('audio_processor.js');
    await audioContext.audioWorklet.addModule('sine_processor.js');

    // Create the Noise Node
    const noiseNode = new AudioWorkletNode(audioContext, 'audio-processor');

    // Fetch the noise WASM module and send it to the processor
    let response = await fetch('audio_processor.wasm');
    let moduleBytes = await response.arrayBuffer();
    noiseNode.port.postMessage({ type: 'load-wasm', wasmBytes: moduleBytes });

    // Create the Sine Oscillator Node
    const sineNode = new AudioWorkletNode(audioContext, 'sine-processor', {
      numberOfOutputs: 1,
      outputChannelCount: [1],
      parameterData: { frequency: 440.0 },
    });

    // Fetch the sine WASM module and send it to the processor
    response = await fetch('sine_processor.wasm');
    moduleBytes = await response.arrayBuffer();
    sineNode.port.postMessage({ type: 'load-wasm', wasmBytes: moduleBytes });

    // Handle messages from the processors
    sineNode.port.onmessage = (event) => {
      if (event.data.type === 'wasm-ready') {
        console.log('Sine WASM module is ready in the processor');
      }
    };

    // Optionally automate the frequency parameter
    // For example, sweep from 220 Hz to 880 Hz over 5 seconds
    const now = audioContext.currentTime;
    const freqParam = sineNode.parameters.get('frequency');
    freqParam.setValueAtTime(220, now);
    freqParam.linearRampToValueAtTime(880, now + 5);

    // Connect the nodes
    sineNode.connect(audioContext.destination);
    // noiseNode.connect(audioContext.destination); // If you want to use the noise node as well
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

document.getElementById('startButton').addEventListener('click', () => {
  initAudio();
});
