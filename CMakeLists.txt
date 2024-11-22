cmake_minimum_required(VERSION 3.10)
project(audio_worklet)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This project must be compiled with Emscripten")
endif()

set(CMAKE_EXECUTABLE_SUFFIX ".js")

# Set Emscripten linker flags
set(EMSCRIPTEN_LINK_FLAGS "\
    -sWASM=1 \
    -sAUDIO_WORKLET=1 \
    -sWASM_WORKERS=1 \
    -pthread \
    -sPTHREAD_POOL_SIZE=1 \
    -sALLOW_MEMORY_GROWTH=1 \
    -sWEBAUDIO_DEBUG=1 \
    -O3 \
    -sASSERTIONS=1 \
    --pre-js ${CMAKE_SOURCE_DIR}/src/pre.js \
    -sEXPORTED_RUNTIME_METHODS=['ccall','cwrap'] \
    -sEXPORTED_FUNCTIONS=['_main'] \
    -sENVIRONMENT='web,worker' \
    -sMODULARIZE=1 \
    -sEXPORT_NAME='createModule'")

# Add the executable
add_executable(audio_processor src/audio_processor.cpp)

# Apply linker flags
set_target_properties(audio_processor PROPERTIES LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS}")