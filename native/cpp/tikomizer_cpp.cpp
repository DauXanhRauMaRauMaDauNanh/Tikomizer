/**
 * Tikomizer Native Performance Subsystem - C++ Implementation
 * Made by Mtienn
 * 
 * RAII-compliant buffer analyzer and memory latency estimator.
 * Explicit noexcept / catch-all boundary ensures zero exception leakage.
 */

#include "tikomizer_native.h"
#include <vector>
#include <cmath>
#include <algorithm>
#include <chrono>
#include <array>

extern "C" int32_t tikomizer_cpp_analyze_memory_pattern(
    const uint8_t* data,
    size_t size,
    double* out_entropy,
    double* out_latency_ns
) {
    if (!data || !out_entropy || !out_latency_ns) {
        return TIKOMIZER_ERR_NULL_PTR;
    }
    if (size == 0) {
        return TIKOMIZER_ERR_INVALID_SIZE;
    }

    try {
        // 1. Calculate Shannon entropy over byte frequency distribution
        std::array<size_t, 256> freq{};
        for (size_t i = 0; i < size; ++i) {
            freq[data[i]]++;
        }

        double entropy = 0.0;
        const double d_size = static_cast<double>(size);
        for (size_t count : freq) {
            if (count > 0) {
                double p = static_cast<double>(count) / d_size;
                entropy -= p * std::log2(p);
            }
        }
        *out_entropy = entropy;

        // 2. Measure pointer-chasing stride cache access latency
        // Sample 256 strides within the buffer if size permits
        size_t stride_count = std::min<size_t>(size / 64, 1024);
        if (stride_count < 4) {
            *out_latency_ns = 0.5; // Baseline register-resident estimate
            return TIKOMIZER_OK;
        }

        auto start = std::chrono::high_resolution_clock::now();
        volatile uint32_t sink = 0;
        size_t idx = 0;
        for (size_t s = 0; s < stride_count; ++s) {
            sink += data[idx];
            idx = (idx + 64) % size;
        }
        auto end = std::chrono::high_resolution_clock::now();

        std::chrono::duration<double, std::nano> elapsed = end - start;
        *out_latency_ns = elapsed.count() / static_cast<double>(stride_count);

        return TIKOMIZER_OK;
    } catch (...) {
        // Guarantee no C++ exception crosses C ABI boundary
        return TIKOMIZER_ERR_INTERNAL;
    }
}
