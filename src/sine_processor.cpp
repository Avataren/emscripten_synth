// src/sine_processor.cpp

#include <emscripten.h>
#include <math.h>

extern "C" {

    // Constants
    const double TWO_PI = 6.283185307179586476925286766559;

    // Generate a block of samples
    EMSCRIPTEN_KEEPALIVE
        void process_block(float* outputBuffer, int numSamples, float frequency, double* phase, double sampleRate) {
        double phaseIncrement = (TWO_PI * frequency) / sampleRate;
        for (int i = 0; i < numSamples; ++i) {
            outputBuffer[i] = sin(*phase);
            *phase += phaseIncrement;
            if (*phase >= TWO_PI) {
                *phase -= TWO_PI;
            }
        }
    }

}
