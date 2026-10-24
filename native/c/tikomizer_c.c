/**
 * Tikomizer Native Performance Subsystem - C Implementation
 * Made by Mtienn
 */

#include "tikomizer_native.h"
#include <string.h>

#ifdef _WIN32
#include <windows.h>
#else
#include <time.h>
#endif

#if defined(_MSC_VER)
#include <intrin.h>
#elif defined(__GNUC__) || defined(__clang__)
#include <cpuid.h>
#endif

static double get_time_ms(void) {
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

uint32_t tikomizer_detect_cpu_features(void) {
    uint32_t features = 0;
    int info[4] = {0, 0, 0, 0};

#if defined(_MSC_VER)
    __cpuid(info, 0);
    int nIds = info[0];
    if (nIds >= 1) {
        __cpuid(info, 1);
        if (info[3] & (1 << 26)) features |= TIKOMIZER_CPU_FEATURE_SSE2;
        if (info[2] & (1 << 19)) features |= TIKOMIZER_CPU_FEATURE_SSE41;
        if (info[2] & (1 << 12)) features |= TIKOMIZER_CPU_FEATURE_FMA;
        if (info[2] & (1 << 28)) features |= TIKOMIZER_CPU_FEATURE_AVX;
    }
    if (nIds >= 7) {
        __cpuidex(info, 7, 0);
        if (info[1] & (1 << 5)) features |= TIKOMIZER_CPU_FEATURE_AVX2;
        if (info[1] & (1 << 16)) features |= TIKOMIZER_CPU_FEATURE_AVX512;
    }
#elif defined(__GNUC__) || defined(__clang__)
    unsigned int eax, ebx, ecx, edx;
    if (__get_cpuid(0, &eax, &ebx, &ecx, &edx)) {
        if (eax >= 1) {
            __get_cpuid(1, &eax, &ebx, &ecx, &edx);
            if (edx & (1 << 26)) features |= TIKOMIZER_CPU_FEATURE_SSE2;
            if (ecx & (1 << 19)) features |= TIKOMIZER_CPU_FEATURE_SSE41;
            if (ecx & (1 << 12)) features |= TIKOMIZER_CPU_FEATURE_FMA;
            if (ecx & (1 << 28)) features |= TIKOMIZER_CPU_FEATURE_AVX;
        }
        if (eax >= 7) {
            __get_cpuid_count(7, 0, &eax, &ebx, &ecx, &edx);
            if (ebx & (1 << 5)) features |= TIKOMIZER_CPU_FEATURE_AVX2;
            if (ebx & (1 << 16)) features |= TIKOMIZER_CPU_FEATURE_AVX512;
        }
    }
#endif

    return features;
}

uint64_t tikomizer_portable_kernel(const uint64_t* data, size_t count) {
    if (!data || count == 0) return 0;
    
    uint64_t acc0 = 0xCBF29CE484222325ULL;
    uint64_t acc1 = 0x100000001B3ULL;
    uint64_t acc2 = 0x9E3779B97F4A7C15ULL;
    uint64_t acc3 = 0x5851F42D4C957F2DULL;

    size_t i = 0;
    size_t unrolled = count & ~3ULL;

    for (; i < unrolled; i += 4) {
        acc0 = (acc0 ^ data[i]) * 0x100000001B3ULL;
        acc1 = (acc1 + data[i + 1]) ^ 0x9E3779B97F4A7C15ULL;
        acc2 = (acc2 ^ data[i + 2]) + 0x5851F42D4C957F2DULL;
        acc3 = (acc3 * 31) ^ data[i + 3];
    }

    for (; i < count; ++i) {
        acc0 = (acc0 ^ data[i]) * 0x100000001B3ULL;
    }

    return acc0 ^ acc1 ^ acc2 ^ acc3;
}

int32_t tikomizer_c_process_buffer(
    const uint8_t* data,
    size_t size,
    size_t iterations,
    TikomizerBenchResult* result
) {
    if (!data || !result) return TIKOMIZER_ERR_NULL_PTR;
    if (size == 0 || iterations == 0) return TIKOMIZER_ERR_INVALID_SIZE;

    const size_t u64_count = size / sizeof(uint64_t);
    const uint64_t* u64_data = (const uint64_t*)data;

    double t_start = get_time_ms();
    uint64_t checksum = 0;

    for (size_t it = 0; it < iterations; ++it) {
        checksum ^= tikomizer_portable_kernel(u64_data, u64_count);
    }

    double t_end = get_time_ms();
    double elapsed = t_end - t_start;
    if (elapsed < 0.001) elapsed = 0.001;

    double total_bytes = (double)size * (double)iterations;
    double throughput_mb = (total_bytes / (1024.0 * 1024.0)) / (elapsed / 1000.0);

    result->elapsed_ms = elapsed;
    result->throughput_mb_s = throughput_mb;
    result->checksum = checksum;
    result->cpu_features_used = 0; // Pure scalar C baseline

    return TIKOMIZER_OK;
}
