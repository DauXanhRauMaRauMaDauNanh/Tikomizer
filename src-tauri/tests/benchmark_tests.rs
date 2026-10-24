/**
 * Tikomizer Benchmark Formula & Statistical Tests
 * Made by Mtienn
 */

fn calculate_relative_change(baseline: f64, optimized: f64) -> f64 {
    if baseline.abs() < 1e-9 {
        0.0
    } else {
        ((optimized - baseline) / baseline) * 100.0
    }
}

#[test]
fn test_relative_change_positive_improvement() {
    // Throughput increased from 100 MB/s to 125 MB/s (+25%)
    let change = calculate_relative_change(100.0, 125.0);
    assert!((change - 25.0).abs() < 1e-6);
}

#[test]
fn test_relative_change_latency_reduction() {
    // Latency reduced from 20ms to 15ms (-25%)
    let change = calculate_relative_change(20.0, 15.0);
    assert!((change - (-25.0)).abs() < 1e-6);
}

#[test]
fn test_relative_change_zero_baseline_safety() {
    // Edge case: baseline is zero, must return 0.0 without division by zero panic
    let change = calculate_relative_change(0.0, 50.0);
    assert_eq!(change, 0.0);
}
