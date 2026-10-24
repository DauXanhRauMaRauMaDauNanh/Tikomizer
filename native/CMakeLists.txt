cmake_minimum_required(VERSION 3.15)
project(tikomizer_native C CXX)

set(CMAKE_C_STANDARD 99)
set(CMAKE_CXX_STANDARD 17)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Check for NASM support on x86_64
option(ENABLE_NASM "Enable NASM AVX2 SIMD acceleration" ON)

set(NATIVE_SOURCES
    c/tikomizer_c.c
    cpp/tikomizer_cpp.cpp
    asm/tikomizer_simd_fallback.c
)

if(ENABLE_NASM AND (CMAKE_SYSTEM_PROCESSOR MATCHES "AMD64|x86_64|x64"))
    enable_language(ASM_NASM OPTIONAL)
    if(CMAKE_ASM_NASM_COMPILER_LOADED)
        message(STATUS "Tikomizer: NASM compiler detected: ${CMAKE_ASM_NASM_COMPILER}")
        list(APPEND NATIVE_SOURCES asm/tikomizer_simd_x64.asm)
        set_source_files_properties(asm/tikomizer_simd_x64.asm PROPERTIES COMPILE_FLAGS "-f win64")
    else()
        message(WARNING "Tikomizer: NASM compiler not loaded, using C fallback.")
    endif()
endif()

add_library(tikomizer_native STATIC ${NATIVE_SOURCES})

# Target include directories
target_include_directories(tikomizer_native PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Automated Native FFI / Boundary test
add_executable(tikomizer_native_test tests/native_test.c)
target_link_libraries(tikomizer_native_test PRIVATE tikomizer_native)
