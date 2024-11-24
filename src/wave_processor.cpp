// wave_processor.cpp

#include <emscripten.h>
#include <emscripten/threading.h>
#include <vector>
#include <map>
#include <cstring>
#include "WaveTableOsc.h"
#include "WaveUtils.h"

using namespace std; // You can add this line if you prefer not to prefix std::

static vector<float> wavetables;
static vector<int> waveTableLengths;
static int numWaveTables = 0;
static bool wavetablesInitialized = false;

static map<int, WaveTableOsc*> oscillators;
static int nextOscillatorId = 1;

extern "C" {

    EMSCRIPTEN_KEEPALIVE
        void initialize_wavetables() {
        if (wavetablesInitialized) {
            return;
        }

        generateWavetables(wavetables, waveTableLengths, numWaveTables);
        wavetablesInitialized = true;
    }

    EMSCRIPTEN_KEEPALIVE
        uint8_t* get_wavetable_data_ptr() {
        return reinterpret_cast<uint8_t*>(wavetables.data());
    }

    EMSCRIPTEN_KEEPALIVE
        size_t get_wavetable_data_size() {
        return wavetables.size() * sizeof(float);
    }

    EMSCRIPTEN_KEEPALIVE
        int* get_wave_table_lengths_ptr() {
        return waveTableLengths.data();
    }

    EMSCRIPTEN_KEEPALIVE
        int get_num_wave_tables() {
        return numWaveTables;
    }

    EMSCRIPTEN_KEEPALIVE
        int create_oscillator(uint8_t* wavetableDataPtr, int* waveTableLengthsPtr, int numTables, int usingSharedMemory) {
        int id = nextOscillatorId++;

        float* wavetableData;
        int* waveTableLengths;

        if (usingSharedMemory) {
            // Use the shared wavetable data
            wavetableData = reinterpret_cast<float*>(wavetableDataPtr);
            waveTableLengths = waveTableLengthsPtr;
        }
        else {
            // Copy the wavetable data into the instance's memory
            size_t dataSize = wavetables.size() * sizeof(float);
            wavetableData = new float[wavetables.size()];
            memcpy(wavetableData, wavetableDataPtr, dataSize);

            // Copy the wave table lengths
            waveTableLengths = new int[numTables];
            memcpy(waveTableLengths, waveTableLengthsPtr, numTables * sizeof(int));
        }

        oscillators[id] = new WaveTableOsc(wavetableData, waveTableLengths, numTables, usingSharedMemory);
        return id;
    }

    EMSCRIPTEN_KEEPALIVE
        void set_frequency(int oscillatorId, double frequency, double sampleRate) {
        if (oscillators.find(oscillatorId) != oscillators.end()) {
            oscillators[oscillatorId]->SetFrequency(frequency, sampleRate);
        }
    }

    EMSCRIPTEN_KEEPALIVE
        void process_block(int oscillatorId, float* outputBuffer, int numSamples) {
        if (oscillators.find(oscillatorId) != oscillators.end()) {
            WaveTableOsc* osc = oscillators[oscillatorId];
            for (int i = 0; i < numSamples; ++i) {
                outputBuffer[i] = osc->Process();
            }
        }
    }

    EMSCRIPTEN_KEEPALIVE
        void delete_oscillator(int oscillatorId) {
        if (oscillators.find(oscillatorId) != oscillators.end()) {
            if (!oscillators[oscillatorId]->isUsingSharedMemory()) {
                delete[] oscillators[oscillatorId]->getWavetableData();
            }
            delete oscillators[oscillatorId];
            oscillators.erase(oscillatorId);
        }
    }

}
