# Tikomizer Benchmark Methodology — No Fake Results
**Made by Mtienn**

Tikomizer adheres to a strict scientific standard: **all benchmarks execute real, repeatable, CPU/GPU/memory/storage workloads on the host machine**.

## Workload Categories

### A. CPU & Text Processing
- **Workload**: Multi-pass JSON tokenization, structured string normalization, and cryptographic SHA-256 block hashing.
- **Metric**: Throughput (MB/s) and execution time (ms).

### B. Native SIMD (NASM AVX2 vs Pure C)
- **Workload**: High-throughput memory vector hashing across a 4MB buffer.
- **Comparison**:
  - Baseline: Pure scalar C reference kernel (`tikomizer_c_process_buffer`).
  - Optimized: Handcrafted NASM x86_64 AVX2 assembly kernel (`tikomizer_asm_kernel_avx2`).
  - Analysis: C++ entropy and memory stride latency calculation.

### C. 3D Graphics Benchmark
- **Workload**: Real-time rendering of lit 3D polyhedron geometry with procedural shading.
- **Metrics**: Instantaneous FPS, average frame time (ms), 1% low FPS, micro-stutter occurrence count.

### D. Video & Multimedia
- **Workload**: BT.601 color-space conversion (1080p 32-bit RGBA to YUV420p planar).
- **Metric**: Frame processing rate (FPS) and pixel throughput (Megapixels/sec).

### E. Compression & Decompression
- **Workload**: Deflate/Zlib compression on calibrated structured binary data.
- **Metrics**: Compression throughput (MB/s), decompression throughput (MB/s), and compressed ratio (%).

### F. Isolated Storage I/O
- **Workload**: 16MB sequential write and sequential read in an isolated temporary directory (`%TEMP%\tikomizer_io_bench`).
- **Safety**: Fully non-destructive; files are wiped immediately upon completion.

### G. Application Overhead Audit
- **Workload**: Real measurement of Tikomizer's own process memory working set, background CPU percentage, and active thread count.

## Performance Change Formula

$$\text{Change (\%)} = \left(\frac{\text{Optimized} - \text{Baseline}}{\text{Baseline}}\right) \times 100$$

For metrics where lower numbers indicate better performance (such as latency and frame times), negative percentages represent true performance improvements.
