/**
 * Tikomizer Native Boundary & Correctness Tests
 * Made by Mtienn
 */

#include "tikomizer_native.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

int main(void) {
    printf("=== Tikomizer Native Test Suite ===\n");

    // 1. Test CPU Feature Detection
    uint32_t features = tikomizer_detect_cpu_features();
    printf("[CPU] Features detected: 0x%08X (SSE2: %d, SSE4.1: %d, AVX: %d, AVX2: %d)\n",
           features,
           (features & TIKOMIZER_CPU_FEATURE_SSE2) != 0,
           (features & TIKOMIZER_CPU_FEATURE_SSE41) != 0,
           (features & TIKOMIZER_CPU_FEATURE_AVX) != 0,
           (features & TIKOMIZER_CPU_FEATURE_AVX2) != 0);

    // 2. Test Boundary conditions (Null pointer, 0 length)
    TikomizerBenchResult dummy_res;
    int32_t ret = tikomizer_c_process_buffer(NULL, 1024, 1, &dummy_res);
    assert(ret == TIKOMIZER_ERR_NULL_PTR);
    ret = tikomizer_c_process_buffer((const uint8_t*)&dummy_res, 0, 1, &dummy_res);
    assert(ret == TIKOMIZER_ERR_INVALID_SIZE);
    printf("[Boundary] Null/zero validation verified successfully.\n");

    // 3. Test C Reference Processing
    const size_t test_size = 1024 * 1024 * 4; // 4 MB test buffer
    uint8_t* test_buffer = (uint8_t*)malloc(test_size);
    assert(test_buffer != NULL);
    for (size_t i = 0; i < test_size; ++i) {
        test_buffer[i] = (uint8_t)(i & 0xFF);
    }

    TikomizerBenchResult c_result;
    ret = tikomizer_c_process_buffer(test_buffer, test_size, 10, &c_result);
    assert(ret == TIKOMIZER_OK);
    printf("[C Benchmark] 4MB x 10 iterations: %.2f ms | Throughput: %.2f MB/s | Checksum: 0x%llX\n",
           c_result.elapsed_ms, c_result.throughput_mb_s, (unsigned long long)c_result.checksum);

    // 4. Test C++ Entropy & Latency analyzer
    double entropy = 0.0, latency_ns = 0.0;
    ret = tikomizer_cpp_analyze_memory_pattern(test_buffer, test_size, &entropy, &latency_ns);
    assert(ret == TIKOMIZER_OK);
    printf("[C++ Analyzer] Entropy: %.4f bits/byte (uniform ramp expected ~8.0) | Latency: %.2f ns/stride\n",
           entropy, latency_ns);

    // 5. Test ASM Kernel / Dispatcher
    TikomizerBenchResult asm_result;
    ret = tikomizer_asm_process_buffer(test_buffer, test_size, 10, &asm_result);
    assert(ret == TIKOMIZER_OK);
    printf("[ASM Benchmark] 4MB x 10 iterations: %.2f ms | Throughput: %.2f MB/s | Checksum: 0x%llX | AVX2 Used: %d\n",
           asm_result.elapsed_ms, asm_result.throughput_mb_s, (unsigned long long)asm_result.checksum,
           (asm_result.cpu_features_used & TIKOMIZER_CPU_FEATURE_AVX2) != 0);

    if (asm_result.cpu_features_used & TIKOMIZER_CPU_FEATURE_AVX2) {
        double speedup = c_result.elapsed_ms / asm_result.elapsed_ms;
        printf("[Performance Comparison] NASM AVX2 vs Pure C Speedup: %.2fx\n", speedup);
    }

    free(test_buffer);
    printf("=== All Native Tests Passed Successfully ===\n");
    return 0;
}
