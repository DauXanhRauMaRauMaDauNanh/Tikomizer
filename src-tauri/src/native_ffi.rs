use std::os::raw::{c_double, c_int, c_uchar, c_uint};

#[repr(C)]
#[derive(Debug, Clone, Copy, Default)]
pub struct TikomizerBenchResult {
    pub elapsed_ms: c_double,
    pub throughput_mb_s: c_double,
    pub checksum: u64,
    pub cpu_features_used: i32,
}

pub const TIKOMIZER_OK: i32 = 0;
pub const TIKOMIZER_CPU_FEATURE_SSE2: u32 = 1 << 0;
pub const TIKOMIZER_CPU_FEATURE_SSE41: u32 = 1 << 1;
pub const TIKOMIZER_CPU_FEATURE_AVX: u32 = 1 << 2;
pub const TIKOMIZER_CPU_FEATURE_AVX2: u32 = 1 << 3;

extern "C" {
    pub fn tikomizer_detect_cpu_features() -> c_uint;

    pub fn tikomizer_c_process_buffer(
        data: *const c_uchar,
        size: usize,
        iterations: usize,
        result: *mut TikomizerBenchResult,
    ) -> c_int;

    pub fn tikomizer_cpp_analyze_memory_pattern(
        data: *const c_uchar,
        size: usize,
        out_entropy: *mut c_double,
        out_latency_ns: *mut c_double,
    ) -> c_int;

    pub fn tikomizer_asm_process_buffer(
        data: *const c_uchar,
        size: usize,
        iterations: usize,
        result: *mut TikomizerBenchResult,
    ) -> c_int;
}

/// Safe wrapper for CPU SIMD features detection
pub fn detect_cpu_features() -> u32 {
    unsafe { tikomizer_detect_cpu_features() as u32 }
}

/// Safe wrapper for running the C reference buffer processing
pub fn run_c_benchmark(buffer: &[u8], iterations: usize) -> Result<TikomizerBenchResult, String> {
    if buffer.is_empty() || iterations == 0 {
        return Err("Invalid buffer or iteration count".to_string());
    }
    let mut result = TikomizerBenchResult::default();
    let status = unsafe {
        tikomizer_c_process_buffer(
            buffer.as_ptr(),
            buffer.len(),
            iterations,
            &mut result as *mut _,
        )
    };
    if status == TIKOMIZER_OK {
        Ok(result)
    } else {
        Err(format!("C benchmark failed with status code {}", status))
    }
}

/// Safe wrapper for running the Assembly SIMD buffer processing
pub fn run_asm_benchmark(buffer: &[u8], iterations: usize) -> Result<TikomizerBenchResult, String> {
    if buffer.is_empty() || iterations == 0 {
        return Err("Invalid buffer or iteration count".to_string());
    }
    let mut result = TikomizerBenchResult::default();
    let status = unsafe {
        tikomizer_asm_process_buffer(
            buffer.as_ptr(),
            buffer.len(),
            iterations,
            &mut result as *mut _,
        )
    };
    if status == TIKOMIZER_OK {
        Ok(result)
    } else {
        Err(format!("Assembly benchmark failed with status code {}", status))
    }
}

/// Safe wrapper for C++ memory entropy & latency analysis
pub fn analyze_memory_pattern(buffer: &[u8]) -> Result<(f64, f64), String> {
    if buffer.is_empty() {
        return Err("Buffer is empty".to_string());
    }
    let mut entropy: f64 = 0.0;
    let mut latency_ns: f64 = 0.0;
    let status = unsafe {
        tikomizer_cpp_analyze_memory_pattern(
            buffer.as_ptr(),
            buffer.len(),
            &mut entropy as *mut _,
            &mut latency_ns as *mut _,
        )
    };
    if status == TIKOMIZER_OK {
        Ok((entropy, latency_ns))
    } else {
        Err(format!("C++ memory analyzer failed with status code {}", status))
    }
}
