; ==============================================================================
; Tikomizer Native Performance Subsystem - x86_64 NASM AVX2 SIMD Kernel
; Made by Mtienn
;
; Windows x64 Calling Convention:
;   Input:
;     RCX = const uint64_t* data
;     RDX = size_t count (number of uint64_t elements)
;   Output:
;     RAX = 64-bit accumulated checksum
; ==============================================================================

global tikomizer_asm_kernel_avx2
default rel

section .text

tikomizer_asm_kernel_avx2:
    ; Check for null or zero length
    test    rcx, rcx
    jz      .zero_ret
    test    rdx, rdx
    jz      .zero_ret

    ; Initialize four 256-bit accumulators to distinct prime seeds
    vmovdqu ymm0, [rel seed_vec0]
    vmovdqu ymm1, [rel seed_vec1]
    vmovdqu ymm2, [rel seed_vec2]
    vmovdqu ymm3, [rel seed_vec3]

    ; Check if count >= 16 (128 bytes per unrolled iteration)
    mov     r8, rdx
    shr     r8, 4              ; r8 = count / 16
    jz      .scalar_remainder

.simd_loop:
    ; Load 128 bytes across 4 YMM registers
    vmovdqu ymm4, [rcx]
    vmovdqu ymm5, [rcx + 32]
    vmovdqu ymm6, [rcx + 64]
    vmovdqu ymm7, [rcx + 96]

    ; Accumulate via SIMD XOR and ADD
    vpxor   ymm0, ymm0, ymm4
    vpaddq  ymm1, ymm1, ymm5
    vpxor   ymm2, ymm2, ymm6
    vpaddq  ymm3, ymm3, ymm7

    add     rcx, 128
    dec     r8
    jnz     .simd_loop

.scalar_remainder:
    ; Combine the four 256-bit accumulators
    vpxor   ymm0, ymm0, ymm1
    vpxor   ymm2, ymm2, ymm3
    vpxor   ymm0, ymm0, ymm2

    ; Horizontal fold of YMM0 into RAX
    ; Extract high 128-bit lane
    vextracti128 xmm1, ymm0, 1
    vpxor   xmm0, xmm0, xmm1
    ; Extract high 64-bit into r8
    vpextrq r8, xmm0, 1
    vmovq   rax, xmm0
    xor     rax, r8

    ; Process remaining elements (rdx & 15)
    and     rdx, 15
    jz      .done

.rem_loop:
    mov     r9, [rcx]
    xor     rax, r9
    rol     rax, 7
    add     rcx, 8
    dec     rdx
    jnz     .rem_loop

.done:
    vzeroupper
    ret

.zero_ret:
    xor     rax, rax
    ret

section .rdata
align 32
seed_vec0:
    dq 0xCBF29CE484222325, 0x100000001B3, 0x9E3779B97F4A7C15, 0x5851F42D4C957F2D
seed_vec1:
    dq 0x14057B7EF767814F, 0x243F6A8885A308D3, 0x13198A2E03707344, 0xA4093822299F31D0
seed_vec2:
    dq 0xD82E63B3A7B9B4CF, 0x76B6628A811F1C72, 0xDE4BBE6B82811342, 0x6E4C609FA5A23891
seed_vec3:
    dq 0x93FF623C873B6F19, 0xC6FE215882672B1E, 0xB65CEB5F84AE8B1A, 0x2A6BE01584FE2911
