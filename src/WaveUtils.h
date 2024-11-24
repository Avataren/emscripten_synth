// WaveUtils.h

#ifndef WAVEUTILS_H
#define WAVEUTILS_H

#include <vector>           // Include vector
#include "WaveTableOsc.h"

void generateWavetables(std::vector<float>& wavetableData,
    std::vector<int>& waveTableLengths,
    int& numWaveTables);

#endif // WAVEUTILS_H
