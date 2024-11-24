// WaveTableOsc.cpp

#include "WaveTableOsc.h"
#include <cmath>

WaveTableOsc::WaveTableOsc(float* wavetableData, int* waveTableLengths, int numWaveTables, bool usingSharedMemory)
    : mWavetableData(wavetableData),
    mWaveTableLengths(waveTableLengths),
    mNumWaveTables(numWaveTables),
    mUsingSharedMemory(usingSharedMemory) {
}

WaveTableOsc::~WaveTableOsc() {
    if (!mUsingSharedMemory) {
        delete[] mWavetableData;
        delete[] mWaveTableLengths;
    }
}

void WaveTableOsc::SetFrequency(double frequency, double sampleRate) {
    mPhaseIncrement = frequency / sampleRate;

    // Update the current wavetable index based on frequency
    // For simplicity, assume equally spaced tables
    double freqRatio = frequency / (sampleRate / 2.0);
    mCurrentWaveTable = static_cast<int>(freqRatio * (mNumWaveTables - 1));
    if (mCurrentWaveTable >= mNumWaveTables) {
        mCurrentWaveTable = mNumWaveTables - 1;
    }

    // Calculate the offset to the current table in the wavetable data
    mCurrentTableOffset = 0;
    for (int i = 0; i < mCurrentWaveTable; ++i) {
        mCurrentTableOffset += mWaveTableLengths[i];
    }
}

float WaveTableOsc::Process() {
    mPhase += mPhaseIncrement;
    if (mPhase >= 1.0)
        mPhase -= 1.0;

    int tableLen = mWaveTableLengths[mCurrentWaveTable];
    float* table = &mWavetableData[mCurrentTableOffset];

    float index = mPhase * tableLen;
    int idx0 = static_cast<int>(index);
    float frac = index - idx0;
    idx0 %= tableLen;
    int idx1 = (idx0 + 1) % tableLen;

    float sample = table[idx0] + frac * (table[idx1] - table[idx0]);
    return sample;
}

bool WaveTableOsc::isUsingSharedMemory() const {
    return mUsingSharedMemory;
}

float* WaveTableOsc::getWavetableData() const {
    return mWavetableData;
}
