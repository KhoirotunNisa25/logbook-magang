# Logbook Magang Industri - Polinema

Aplikasi Dashboard & Generator Logbook Mingguan Resmi untuk Program Magang Industri Jurusan Teknologi Informasi, Politeknik Negeri Malang (Polinema).

## ✨ Fitur Utama
- **Template LaTeX Standar Polinema**: Format presisi 100% identik dengan standar jurusan (Kop surat resmi, tabel kegiatan Senin–Sabtu, dan 3 kolom tanda tangan).
- **Telegram Report to Narrative**: Form input laporan harian dari pesan Telegram dengan auto-formatting narasi padat & baku.
- **Strict Monthly Cut-off**: Otomatis mengelompokkan hari Senin–Sabtu per minggu dan memutus minggu di akhir tanggal setiap bulan (Juli s.d. 31 Desember 2026).
- **Dual Data Storage**: Penyimpanan otomatis di browser (Local-First) serta sinkronisasi Cloud ke Firebase Firestore.
- **Export PDF & LaTeX Source**: Live preview cetak dan download dokumen siap tanda tangan.
- **Modul Diseminasi Magang**: Agregasi data seluruh kegiatan magang untuk penyusunan laporan akhir / proposal diseminasi.

## 🚀 Panduan Menjalankan Dashboard
1. Install dependensi:
   ```bash
   npm install
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
3. Buka di browser: `http://localhost:3000`

## 📄 Kompilasi Manual LaTeX
Jika ingin meng-compile file LaTeX secara manual melalui terminal:
```bash
pdflatex -interaction=nonstopmode template.tex
```
File output `template.pdf` akan langsung dihasilkan di direktori yang sama.
