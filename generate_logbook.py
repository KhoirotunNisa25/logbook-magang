#!/usr/bin/env python3
"""
CLI Helper untuk mengompilasi logbook LaTeX menjadi file PDF resmi Polinema.
Penggunaan:
    python3 generate_logbook.py
"""

import os
import subprocess
import sys

def main():
    tex_file = "template.tex"
    if not os.path.exists(tex_file):
        print(f"Error: {tex_file} tidak ditemukan di direktori saat ini.")
        sys.exit(1)

    print("📄 Mengompilasi template.tex menggunakan pdflatex...")
    cmd = ["pdflatex", "-interaction=nonstopmode", tex_file]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Kompilasi berhasil! File 'template.pdf' siap digunakan.")
    else:
        print("❌ Terjadi kesalahan saat kompilasi LaTeX:")
        print(result.stdout[-800:])
        sys.exit(1)

if __name__ == "__main__":
    main()
