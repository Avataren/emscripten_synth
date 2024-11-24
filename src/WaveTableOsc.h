// WaveTableOsc.h

#ifndef WAVETABLEOSC_H
#define WAVETABLEOSC_H

class WaveTableOsc {
public:
    WaveTableOsc(float* wavetableData, int* waveTableLengths, int numWaveTables, bool usingSharedMemory);
    ~WaveTableOsc();

    void SetFrequency(double frequency, double sampleRate);
    float Process();

    bool isUsingSharedMemory() const;
    float* getWavetableData() const;

private:
    float* mWavetableData;
    int* mWaveTableLengths;
    int mNumWaveTables;
    bool mUsingSharedMemory;

    double mPhase = 0.0;
    double mPhaseIncrement = 0.0;
    int mCurrentWaveTable = 0;
    int mCurrentTableOffset = 0;
};

#endif // WAVETABLEOSC_H
