use std::path::PathBuf;
use std::process::Command;

fn main() {
    tauri_build::build();

    let manifest_dir = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let native_dir = manifest_dir.parent().unwrap().join("native");
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());

    println!("cargo:rerun-if-changed={}", native_dir.join("include/tikomizer_native.h").display());
    println!("cargo:rerun-if-changed={}", native_dir.join("c/tikomizer_c.c").display());
    println!("cargo:rerun-if-changed={}", native_dir.join("cpp/tikomizer_cpp.cpp").display());
    println!("cargo:rerun-if-changed={}", native_dir.join("asm/tikomizer_simd_fallback.c").display());
    println!("cargo:rerun-if-changed={}", native_dir.join("asm/tikomizer_simd_x64.asm").display());

    // 1. Try to assemble NASM x64 AVX2 kernel
    let asm_obj = out_dir.join("tikomizer_simd_x64.obj");
    let asm_source = native_dir.join("asm/tikomizer_simd_x64.asm");

    let nasm_success = Command::new("nasm")
        .args(["-f", "win64"])
        .arg(&asm_source)
        .arg("-o")
        .arg(&asm_obj)
        .status()
        .map(|s| s.success())
        .unwrap_or(false);

    if nasm_success {
        println!("cargo:warning=Tikomizer: NASM AVX2 SIMD kernel assembled successfully.");
    } else {
        println!("cargo:warning=Tikomizer: NASM not available, building portable reference kernel.");
    }

    // 2. Build C sources
    let mut c_build = cc::Build::new();
    c_build
        .include(native_dir.join("include"))
        .file(native_dir.join("c/tikomizer_c.c"))
        .file(native_dir.join("asm/tikomizer_simd_fallback.c"))
        .opt_level(3);

    if nasm_success {
        c_build.object(&asm_obj);
    }

    c_build.compile("tikomizer_native_c");

    // 3. Build C++ sources
    cc::Build::new()
        .cpp(true)
        .include(native_dir.join("include"))
        .file(native_dir.join("cpp/tikomizer_cpp.cpp"))
        .opt_level(3)
        .compile("tikomizer_native_cpp");

    println!("cargo:rustc-link-lib=static=tikomizer_native_c");
    println!("cargo:rustc-link-lib=static=tikomizer_native_cpp");
    println!("cargo:rustc-link-lib=stdc++");
}
