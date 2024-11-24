// wasm_to_js_array.js

const fs = require('fs');
const path = require('path');

function wasmToJsArray() {
  const wasmFile = path.join('build', 'wave_processor.wasm');
  const wasmData = fs.readFileSync(wasmFile);

  const wasmArray = Array.from(wasmData);
  const wasmArrayString = JSON.stringify(wasmArray);

  const jsContent = `const wasmBinary = new Uint8Array(${wasmArrayString});\n`;

  fs.writeFileSync(path.join('build', 'wave_processor_wasm.js'), jsContent);
}

wasmToJsArray();
