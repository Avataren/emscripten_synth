cmake_minimum_required(VERSION 3.10)
project(audio_worklet)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This project must be compiled with Emscripten")
endif()

# Build the audio processor WASM module
add_executable(audio_processor src/audio_processor.cpp)
set_target_properties(audio_processor PROPERTIES LINK_FLAGS "\
    -s STANDALONE_WASM=1 \
    --no-entry \
    -O3 \
    -sEXPORTED_FUNCTIONS=\"['_process_sample']\" \
    ")

# Set output name
set_target_properties(audio_processor PROPERTIES OUTPUT_NAME "audio_processor")

# Build the sine processor WASM module
add_executable(sine_processor src/sine_processor.cpp)
set_target_properties(sine_processor PROPERTIES LINK_FLAGS "\
    -s STANDALONE_WASM=1 \
    --no-entry \
    -O3 \
    -sEXPORTED_FUNCTIONS=\"['_process_block']\" \
    -sEXPORT_ALL \
    ")

# Set output name
set_target_properties(sine_processor PROPERTIES OUTPUT_NAME "sine_processor")

# Set output directory
set_target_properties(audio_processor PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}")
set_target_properties(sine_processor PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}")
