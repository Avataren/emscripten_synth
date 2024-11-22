#include <emscripten/webaudio.h>
#include <emscripten/em_math.h>
#include <emscripten/html5.h>
#include <emscripten/console.h>

#ifdef __EMSCRIPTEN_PTHREADS__
#include <pthread.h>
#endif

uint8_t audioThreadStack[4096];
EMSCRIPTEN_WEBAUDIO_T g_context = 0;

bool GenerateNoise(int numInputs, const AudioSampleFrame *inputs,
                  int numOutputs, AudioSampleFrame *outputs,
                  int numParams, const AudioParamFrame *params,
                  void *userData) {
    for(int i = 0; i < numOutputs; ++i) {
        for(int j = 0; j < outputs[i].samplesPerChannel * outputs[i].numberOfChannels; ++j) {
            outputs[i].data[j] = emscripten_random() * 0.2f - 0.1f;
        }
    }
    return true;
}

void AudioWorkletProcessorCreated(EMSCRIPTEN_WEBAUDIO_T audioContext, bool success, void *userData) {
    emscripten_console_log("Processor created callback");
    if (!success) {
        emscripten_console_error("Failed to create audio worklet processor");
        return;
    }

    int outputChannelCounts[1] = { 1 };
    EmscriptenAudioWorkletNodeCreateOptions options = {
        .numberOfInputs = 0,
        .numberOfOutputs = 1,
        .outputChannelCounts = outputChannelCounts
    };

    emscripten_console_log("Creating audio worklet node...");
    EMSCRIPTEN_AUDIO_WORKLET_NODE_T node = emscripten_create_wasm_audio_worklet_node(
        audioContext, "noise-generator", &options, &GenerateNoise, 0);
    
    if (node) {
        emscripten_console_log("Connecting audio node...");
        emscripten_audio_node_connect(node, audioContext, 0, 0);
    } else {
        emscripten_console_error("Failed to create audio worklet node");
    }
}

void AudioThreadInitialized(EMSCRIPTEN_WEBAUDIO_T audioContext, bool success, void *userData) {
    emscripten_console_log("Thread initialized callback");
    if (!success) {
        emscripten_console_error("Thread initialization failed");
        return;
    }

    emscripten_console_log("Creating worklet processor...");
    WebAudioWorkletProcessorCreateOptions opts = {
        .name = "noise-generator"
    };
    emscripten_create_wasm_audio_worklet_processor_async(audioContext, &opts, &AudioWorkletProcessorCreated, 0);
}

EM_BOOL OnCanvasClick(int eventType, const EmscriptenMouseEvent *mouseEvent, void *userData) {
    emscripten_console_log("Canvas clicked");
    if (g_context == 0) {
        emscripten_console_log("Creating audio context...");
        EmscriptenWebAudioCreateAttributes attrs = {
            .latencyHint = "interactive",
            .sampleRate = 48000
        };
        g_context = emscripten_create_audio_context(&attrs);
        
        emscripten_console_log("Starting audio worklet thread...");
        emscripten_start_wasm_audio_worklet_thread_async(
            g_context, audioThreadStack, sizeof(audioThreadStack), &AudioThreadInitialized, 0);
    } else if (emscripten_audio_context_state(g_context) != AUDIO_CONTEXT_STATE_RUNNING) {
        emscripten_console_log("Resuming audio context...");
        emscripten_resume_audio_context_sync(g_context);
    }
    return true;
}

int main() {
    emscripten_console_log("Setting up click handler...");
    emscripten_set_click_callback("#canvas", 0, false, OnCanvasClick);
    return 0;
}