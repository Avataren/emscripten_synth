// WaveUtils.cpp

#include "WaveUtils.h"
#include <vector>
#include <cmath>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

void generateWavetables(std::vector<float>& wavetableData,
    std::vector<int>& waveTableLengths,
    int& numWaveTables) {
    const int maxHarmonics = 1024;
    const int tableSize = 2048;
    const int numTables = 10;

    numWaveTables = numTables;

    for (int t = 0; t < numTables; ++t) {
        int harmonics = maxHarmonics / (t + 1);
        int len = tableSize;
        std::vector<float> table(len);

        for (int i = 0; i < len; ++i) {
            double sample = 0.0;
            double phase = (static_cast<double>(i) / len) * 2.0 * M_PI;
            for (int h = 1; h <= harmonics; ++h) {
                sample += (1.0 / h) * sin(h * phase);
            }
            table[i] = static_cast<float>(sample);
        }

        // Normalize the table
        float maxVal = *std::max_element(table.begin(), table.end(),
            [](float a, float b) { return std::fabs(a) < std::fabs(b); });
        for (auto& sample : table) {
            sample /= maxVal;
        }

        // Append table data
        wavetableData.insert(wavetableData.end(), table.begin(), table.end());
        waveTableLengths.push_back(len);
    }
}
