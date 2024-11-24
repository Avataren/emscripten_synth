// build.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function build() {
  // Define directories
  const buildDir = 'build';
  const publicDir = 'public';
  const srcDir = 'src';

  // Ensure the public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Run Emscripten's CMake to configure the build
  execSync('emcmake cmake -B build -S .', { stdio: 'inherit' });

  // Build the project
  execSync('cmake --build build', { stdio: 'inherit' });

  // Convert WASM binary to JavaScript array
  execSync('node src/wasm_to_js_array.cjs', { stdio: 'inherit' });

  // Read the WASM array JS
  const wasmArrayCode = fs.readFileSync(
    path.join(buildDir, 'wave_processor_wasm.js'),
    'utf8'
  );

  // Read our AudioWorkletProcessor code
  const workletCode = fs.readFileSync(
    path.join(srcDir, 'wave_processor_worklet.js'),
    'utf8'
  );

  // Combine the code
  const combinedCode = `${wasmArrayCode}\n${workletCode}`;

  // Write the combined code to public/wave_processor_worklet.js
  fs.writeFileSync(
    path.join(publicDir, 'wave_processor_worklet.js'),
    combinedCode
  );

  console.log('Build completed successfully.');
}

try {
  build();
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
