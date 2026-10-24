/**
 * Tikomizer Native Performance Subsystem - Dispatcher & Fallback
 * Made by Mtienn
 */

#include "tikomizer_native.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <time.h>
#endif

static double get_time_ms_dispatch(void) {
#ifdef _WIN32
    LARGE_INTEGER freq, counter;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&counter);
    return ((double)counter.QuadPart * 1000.0) / (double)freq.QuadPart;
#else
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (double)ts.tv_sec * 1000.0 + (double)ts.tv_nsec / 1e6;
#endif
}

int32_t tikomizer_asm_process_buffer(
    const uint8_t* data,
    size_t size,
    size_t iterations,
    TikomizerBenchResult* result
) {
    if (!data || !result) return TIKOMIZER_ERR_NULL_PTR;
    if (size == 0 || iterations == 0) return TIKOMIZER_ERR_INVALID_SIZE;

    uint32_t features = tikomizer_detect_cpu_features();

    // If AVX2 is not supported, safely fall back to pure C reference
    if (!(features & TIKOMIZER_CPU_FEATURE_AVX2)) {
        int32_t ret = tikomizer_c_process_buffer(data, size, iterations, result);
        if (ret == TIKOMIZER_OK) {
            result->cpu_features_used = 0; // Pure scalar fallback
        }
        return ret;
    }

    const size_t u64_count = size / sizeof(uint64_t);
    const uint64_t* u64_data = (const uint64_t*)data;

    double t_start = get_time_ms_dispatch();
    uint64_t checksum = 0;

    for (size_t it = 0; it < iterations; ++it) {
        checksum ^= tikomizer_asm_kernel_avx2(u64_data, u64_count);
    }

    double t_end = get_time_ms_dispatch();
    double elapsed = t_end - t_start;
    if (elapsed < 0.001) elapsed = 0.001;

    double total_bytes = (double)size * (double)iterations;
    double throughput_mb = (total_bytes / (1024.0 * 1024.0)) / (elapsed / 1000.0);

    result->elapsed_ms = elapsed;
    result->throughput_mb_s = throughput_mb;
    result->checksum = checksum;
    result->cpu_features_used = TIKOMIZER_CPU_FEATURE_AVX2;

    return TIKOMIZER_OK;
}
