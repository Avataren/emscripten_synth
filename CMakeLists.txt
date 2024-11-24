# CMakeLists.txt

cmake_minimum_required(VERSION 3.10)
project(audio_worklet)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This project must be compiled with Emscripten")
endif()

# List of exported functions without quotes
set(EXPORTED_FUNCTIONS_LIST
    _initialize_wavetables
    _get_wavetable_data_ptr
    _get_wavetable_data_size
    _get_wave_table_lengths_ptr
    _get_num_wave_tables
    _create_oscillator
    _set_frequency
    _process_block
    _delete_oscillator
    _malloc
    _free
)

# Convert the list to a comma-separated string
string(REPLACE ";" "," EXPORTED_FUNCTIONS_COMMA "${EXPORTED_FUNCTIONS_LIST}")

# Build the wave processor module
add_executable(wave_processor
    src/wave_processor.cpp
    src/WaveTableOsc.cpp
    src/WaveUtils.cpp
)

# Set linker flags
set_target_properties(wave_processor PROPERTIES LINK_FLAGS "\
    -O3 \
    -s EXPORTED_FUNCTIONS=[${EXPORTED_FUNCTIONS_COMMA}] \
    -s STANDALONE_WASM=1 \
    --no-entry \
    -s ALLOW_MEMORY_GROWTH=0 \
    -s TOTAL_MEMORY=33554432 \
    ")

set_target_properties(wave_processor PROPERTIES OUTPUT_NAME "wave_processor")
set_target_properties(wave_processor PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}")
