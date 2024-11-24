// src/main.js

async function initAudio() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Add the AudioWorklet module
    await audioContext.audioWorklet.addModule('wave_processor_worklet.js');

    // Create the Wave Oscillator Node
    const waveNode = new AudioWorkletNode(audioContext, 'wave-processor', {
      numberOfOutputs: 1,
      outputChannelCount: [1],
      parameterData: { frequency: 440.0 },
    });

    // Handle messages from the processor
    waveNode.port.onmessage = (event) => {
      if (event.data.type === 'wasm-ready') {
        console.log('Wave WASM module is ready in the processor');
      }
    };

    // Optionally automate the frequency parameter
    const now = audioContext.currentTime;
    const freqParam = waveNode.parameters.get('frequency');
    freqParam.setValueAtTime(220, now);
    freqParam.linearRampToValueAtTime(880, now + 5);

    // Connect the node to the destination
    waveNode.connect(audioContext.destination);
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

document.getElementById('startButton').addEventListener('click', () => {
  initAudio();
});
