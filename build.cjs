const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function build() {
  // Define directories
  const buildDir = 'build';
  const publicDir = 'public';

  // Define file paths
  const srcPreJsPath = path.join('src', 'pre.js');
  const buildAudioJsPath = path.join(buildDir, 'audio_processor.js');
  const buildAwJsPath = path.join(buildDir, 'audio_processor.aw.js');
  const buildWasmPath = path.join(buildDir, 'audio_processor.wasm');

  const publicAudioJsPath = path.join(publicDir, 'audio_processor.js');
  const publicAwJsPath = path.join(publicDir, 'audio_processor.aw.js'); // Changed back to original name
  const publicWasmPath = path.join(publicDir, 'audio_processor.wasm');

  // Create the public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Run Emscripten's CMake to configure the build
  execSync('emcmake cmake -B build -S .', { stdio: 'inherit' });

  // Build the project
  execSync('cmake --build build', { stdio: 'inherit' });

  // Read the generated files
  const preJsContent = fs.readFileSync(srcPreJsPath, 'utf8');
  const audioJsContent = fs.readFileSync(buildAudioJsPath, 'utf8');
  const awJsContent = fs.readFileSync(buildAwJsPath, 'utf8');

  // Write the processed files
  fs.writeFileSync(
    publicAudioJsPath,
    `${preJsContent}\n${audioJsContent}`,
    'utf8'
  );
  fs.writeFileSync(publicAwJsPath, `${awJsContent}`, 'utf8');

  // Copy WASM file
  fs.copyFileSync(buildWasmPath, publicWasmPath);

  console.log('Build completed successfully.');
}

try {
  build();
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
