const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function build() {
  // Define directories
  const buildDir = 'build';
  const publicDir = 'public';
  const srcDir = 'src';

  // Define file paths
  const buildWasmPath1 = path.join(buildDir, 'audio_processor.wasm');
  const buildWasmPath2 = path.join(buildDir, 'sine_processor.wasm');

  const publicWasmPath1 = path.join(publicDir, 'audio_processor.wasm');
  const publicWasmPath2 = path.join(publicDir, 'sine_processor.wasm');

  const publicAudioProcessorJsPath = path.join(publicDir, 'audio_processor.js');
  const publicSineProcessorJsPath = path.join(publicDir, 'sine_processor.js');

  const publicMainJsPath = path.join(publicDir, 'main.js');
  const publicIndexPath = path.join(publicDir, 'index.html');

  // Create the public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Run Emscripten's CMake to configure the build
  execSync('emcmake cmake -B build -S .', { stdio: 'inherit' });

  // Build the project
  execSync('cmake --build build', { stdio: 'inherit' });

  // Copy WASM files
  fs.copyFileSync(buildWasmPath1, publicWasmPath1);
  fs.copyFileSync(buildWasmPath2, publicWasmPath2);

  // Copy JavaScript and HTML files
  fs.copyFileSync(
    path.join(srcDir, 'audio_processor.js'),
    publicAudioProcessorJsPath
  );
  fs.copyFileSync(
    path.join(srcDir, 'sine_processor.js'),
    publicSineProcessorJsPath
  );
  fs.copyFileSync(path.join(srcDir, 'main.js'), publicMainJsPath);
  fs.copyFileSync('index.html', publicIndexPath);

  console.log('Build completed successfully.');
}

try {
  build();
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
