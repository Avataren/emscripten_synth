// src/audio_processor.cpp

#include <emscripten.h>
#include <stdint.h>

uint32_t seed = 123456789;

extern "C" {

    // Simple linear congruential generator for pseudo-random numbers
    EMSCRIPTEN_KEEPALIVE
        float process_sample() {
        seed = 1664525 * seed + 1013904223;
        uint32_t rand_uint = seed;
        float rand_float = (float)(rand_uint % 10000) / 10000.0f;
        return rand_float * 0.2f - 0.1f;
    }

}
