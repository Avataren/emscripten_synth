#pragma once
#include <emscripten/bind.h>

class AudioProcessor {
public:
    AudioProcessor(float sampleRate);
    void processBlock(uintptr_t inputPtr, uintptr_t outputPtr, int numFrames);

private:
    float sampleRate;
};