# Contributing to Tikomizer

We welcome contributions to Tikomizer! Please read through these guidelines before submitting a pull request.

## Core Rules

1. **Safety First**: Any optimization must be safe, transparent, and reversible. We reject PRs that permanently remove Windows features, disable antivirus protections, or tamper with game anti-cheat.
2. **Empirical Verification**: Optimization claims must include reproducible benchmarks comparing baseline vs optimized states.
3. **Native Code Boundaries**: Any C or C++ additions must maintain strict ownership rules, validate all pointers and buffer lengths, and prevent C++ exceptions from crossing C ABI boundaries.
4. **Rust Quality**: Ensure all code compiles cleanly with `cargo check`, passes tests (`cargo test`), and conforms to `cargo clippy`.
5. **Code Style**: Standard Rust formatting (`cargo fmt`) and ESLint / Prettier rules for TypeScript.

## Submitting a Pull Request

1. Fork the repository and create your feature branch.
2. Ensure automated tests pass locally.
3. Commit with concise, descriptive commit messages.
4. Open a pull request against the `main` branch with a clear summary of your modifications and benchmark results.
