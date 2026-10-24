/**
 * Tikomizer Native Performance Subsystem
 * Made by Mtienn
 * 
 * Stable C ABI for native high-performance computation, memory benchmarking,
 * CPUID feature detection, and SIMD acceleration.
 * 
 * Strict ownership rules:
 * - Buffers allocated by caller remain owned by caller.
 * - Out pointers must be valid and non-null.
 * - Return codes: 0 = SUCCESS, negative = ERROR CODE.
 */

#ifndef TIKOMIZER_NATIVE_H
#define TIKOMIZER_NATIVE_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Status Codes */
#define TIKOMIZER_OK 0
#define TIKOMIZER_ERR_NULL_PTR -1
#define TIKOMIZER_ERR_INVALID_SIZE -2
#define TIKOMIZER_ERR_UNSUPPORTED_HW -3
#define TIKOMIZER_ERR_INTERNAL -4

/* CPU Feature Flags (Detected via CPUID) */
#define TIKOMIZER_CPU_FEATURE_SSE2   (1 << 0)
#define TIKOMIZER_CPU_FEATURE_SSE41  (1 << 1)
#define TIKOMIZER_CPU_FEATURE_AVX    (1 << 2)
#define TIKOMIZER_CPU_FEATURE_AVX2   (1 << 3)
#define TIKOMIZER_CPU_FEATURE_FMA    (1 << 4)
#define TIKOMIZER_CPU_FEATURE_AVX512 (1 << 5)

/**
 * Benchmark Results Structure
 */
typedef struct {
    double elapsed_ms;
    double throughput_mb_s;
    uint64_t checksum;
    int32_t cpu_features_used;
} TikomizerBenchResult;

/**
 * Detect available CPU SIMD features via CPUID instruction.
 * Safe to call on any x86/x64 platform.
 */
uint32_t tikomizer_detect_cpu_features(void);

/**
 * Pure C reference implementation for memory bandwidth and checksum.
 * Used as fallback and for baseline comparison against assembly SIMD.
 */
int32_t tikomizer_c_process_buffer(
    const uint8_t* data,
    size_t size,
    size_t iterations,
    TikomizerBenchResult* result
);

/**
 * C++ Workload Engine: Analyzes entropy and cache line access latency.
 * Guarantees no C++ exceptions cross the FFI boundary.
 */
int32_t tikomizer_cpp_analyze_memory_pattern(
    const uint8_t* data,
    size_t size,
    double* out_entropy,
    double* out_latency_ns
);

/**
 * NASM x86_64 AVX2 / SSE optimized vector processing routine.
 * Dynamically dispatches to assembly SIMD if AVX2 is available,
 * otherwise safely falls back to the portable C reference.
 */
int32_t tikomizer_asm_process_buffer(
    const uint8_t* data,
    size_t size,
    size_t iterations,
    TikomizerBenchResult* result
);

/**
 * Directly invokes the raw assembly kernel (AVX2).
 * Must only be called if CPU features include AVX2.
 */
uint64_t tikomizer_asm_kernel_avx2(const uint64_t* data, size_t count);

/**
 * Portable fallback kernel when AVX2 or NASM is unavailable.
 */
uint64_t tikomizer_portable_kernel(const uint64_t* data, size_t count);

#ifdef __cplusplus
}
#endif

#endif /* TIKOMIZER_NATIVE_H */
