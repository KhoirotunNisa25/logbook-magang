"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WeeklyLogbook, StudentProfile } from "@/types";
import { formatDateIndo } from "@/utils/date";
import { generateLatexSource } from "@/utils/latex";
import { X, Printer, Download, Copy, Check, FileCode2 } from "lucide-react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  logbook: WeeklyLogbook | null;
  profile: StudentProfile;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  logbook,
  profile,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"preview" | "latex">("preview");

  if (!isOpen || !logbook) return null;

  let page1Reports: typeof logbook.reports = [];
  let page2Reports: typeof logbook.reports = [];

  if (logbook.reports.length <= 3) {
    page1Reports = logbook.reports;
    page2Reports = [];
  } else if (logbook.reports.length === 6) {
    page1Reports = logbook.reports.slice(0, 5);
    page2Reports = logbook.reports.slice(5);
  } else if (logbook.reports.length === 5) {
    page1Reports = logbook.reports.slice(0, 3);
    page2Reports = logbook.reports.slice(3);
  } else {
    page1Reports = logbook.reports.slice(0, 2);
    page2Reports = logbook.reports.slice(2);
  }

  const latexSource = generateLatexSource(profile, logbook);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latexSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Gagal menyalin LaTeX", e);
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexSource], { type: "text/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logbook.titleLabel.replace(/\s+/g, "_")}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSignatures = () => (
    <div className="mt-8 space-y-6">
      {/* Mahasiswa Signature */}
      <div className="flex justify-end pr-8">
        <div className="text-center w-56">
          <div>Mahasiswa,</div>
          <div className="h-20" />
          <div className="font-bold underline">{profile.nama}.</div>
        </div>
      </div>

      {/* Mengetahui */}
      <div className="text-center font-bold">Mengetahui,</div>

      {/* Dospem & Pembimbing Lapangan */}
      <div className="flex justify-between px-4">
        <div className="text-center w-64">
          <div>Dosen Pembimbing,</div>
          <div className="h-20" />
          <div className="font-bold underline">
            {profile.dosenPembimbing}
          </div>
        </div>

        <div className="text-center w-64">
          <div>Pembimbing Lapangan,</div>
          <div className="h-20" />
          <div className="font-bold underline">
            {profile.pembimbingLapangan}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-2 sm:p-4">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden my-auto max-h-[96vh]">
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex justify-between items-center no-print">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm sm:text-base font-bold">
              {logbook.titleLabel} - Dokumen Logbook
            </h3>
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeView === "preview"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pratinjau Cetak
              </button>
              <button
                onClick={() => setActiveView("latex")}
                className={`px-3 py-1 rounded-md transition-all flex items-center space-x-1 ${
                  activeView === "latex"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 mr-1" />
                Sumber LaTeX
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeView === "preview" ? (
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCopyLatex}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Salin .tex</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadTex}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Download .tex</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
          {activeView === "latex" ? (
            <div className="w-full bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="whitespace-pre-wrap">{latexSource}</pre>
            </div>
          ) : (
            /* Document A4 Sheet Preview */
            <div className="space-y-6 w-full max-w-[210mm]">
              {/* PAGE 1 */}
              <div className="bg-white p-[15mm_20mm_15mm_20mm] shadow-lg rounded-sm text-slate-900 border border-slate-300 font-serif text-[11pt] leading-normal min-h-[297mm] flex flex-col justify-between">
                <div>
                  {/* Kop Surat Header */}
                  <div className="flex items-center space-x-4 border-b-2 border-slate-900 pb-2 mb-4">
                    <div className="w-[22mm] h-[22mm] relative flex-shrink-0">
                      <Image
                        src="/logo_polinema.jpg"
                        alt="Logo Polinema"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 text-center font-bold">
                      <div className="text-[11pt] uppercase tracking-tight">
                        Kementerian Pendidikan Tinggi, Sains,
                      </div>
                      <div className="text-[11pt] uppercase tracking-tight">
                        Dan Teknologi
                      </div>
                      <div className="text-[12pt] uppercase tracking-wide mt-0.5">
                        Politeknik Negeri Malang
                      </div>
                      <div className="text-[11pt] uppercase tracking-tight mt-0.5">
                        Jurusan Teknologi Informasi
                      </div>
                      <div className="text-[8.5pt] font-normal mt-0.5 leading-snug">
                        Jalan Soekarno Hatta Nomor 9, Jatimulyo, Lowokwaru, Malang 65141
                        <br />
                        Telepon (0341) 404424, 404425, Faksimile (0341) 404420
                        <br />
                        Laman www.polinema.ac.id
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center font-bold text-[11pt] uppercase my-4">
                    Log Book Kegiatan Program Magang Industri
                  </div>

                  {/* Metadata Table */}
                  <table className="text-[11pt] mb-4">
                    <tbody>
                      <tr>
                        <td className="font-bold pr-2 py-0.5">Nama</td>
                        <td>: {profile.nama}</td>
                      </tr>
                      <tr>
                        <td className="font-bold pr-2 py-0.5">NIM</td>
                        <td>: {profile.nim}</td>
                      </tr>
                      <tr>
                        <td className="font-bold pr-2 py-0.5">Program Studi</td>
                        <td>: {profile.prodi}</td>
                      </tr>
                      <tr>
                        <td className="font-bold pr-2 py-0.5">Nama Mitra Industri</td>
                        <td>: {profile.mitra}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Table of Activities (Page 1) */}
                  <table className="w-full border-collapse border border-slate-900 text-[10pt]">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-2 w-[28mm]">
                          Hari, Tanggal
                        </th>
                        <th className="border border-slate-900 p-2 w-[20mm]">
                          Jam Masuk
                        </th>
                        <th className="border border-slate-900 p-2 w-[20mm]">
                          Jam Pulang
                        </th>
                        <th className="border border-slate-900 p-2">
                          Kegiatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {page1Reports.map((r) => {
                        const formatted = formatDateIndo(r.date);
                        const parts = formatted.split(", ");
                        return (
                          <tr key={r.date} className="align-top">
                            <td className="border border-slate-900 p-2 text-center">
                              <span className="font-bold block">{parts[0]}</span>
                              <span>{parts[1] || ""}</span>
                            </td>
                            <td className="border border-slate-900 p-2 text-center">
                              {r.startTime || "08.00"}
                            </td>
                            <td className="border border-slate-900 p-2 text-center">
                              {r.endTime || (r.dayName === "Sabtu" ? "14.00" : "16.00")}
                            </td>
                            <td className="border border-slate-900 p-2 leading-relaxed text-justify">
                              {r.narrative || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Jika hanya 1 halaman, tampilkan tanda tangan di halaman 1 */}
                  {page2Reports.length === 0 && renderSignatures()}
                </div>

                <div className="text-right text-[9pt] text-slate-400 no-print">
                  {page2Reports.length === 0 ? "Halaman 1 dari 1" : "Halaman 1"}
                </div>
              </div>

              {/* PAGE 2 (If has Saturday report) */}
              {page2Reports.length > 0 && (
                <div className="bg-white p-[15mm_20mm_15mm_20mm] shadow-lg rounded-sm text-slate-900 border border-slate-300 font-serif text-[11pt] leading-normal min-h-[297mm] flex flex-col justify-between page-break">
                  <div>
                    {/* Kop Surat Header on Page 2 */}
                    <div className="flex items-center space-x-4 border-b-2 border-slate-900 pb-2 mb-4">
                      <div className="w-[22mm] h-[22mm] relative flex-shrink-0">
                        <Image
                          src="/logo_polinema.jpg"
                          alt="Logo Polinema"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 text-center font-bold">
                        <div className="text-[11pt] uppercase tracking-tight">
                          Kementerian Pendidikan Tinggi, Sains,
                        </div>
                        <div className="text-[11pt] uppercase tracking-tight">
                          Dan Teknologi
                        </div>
                        <div className="text-[12pt] uppercase tracking-wide mt-0.5">
                          Politeknik Negeri Malang
                        </div>
                        <div className="text-[11pt] uppercase tracking-tight mt-0.5">
                          Jurusan Teknologi Informasi
                        </div>
                        <div className="text-[8.5pt] font-normal mt-0.5 leading-snug">
                          Jalan Soekarno Hatta Nomor 9, Jatimulyo, Lowokwaru, Malang 65141
                          <br />
                          Telepon (0341) 404424, 404425, Faksimile (0341) 404420
                          <br />
                          Laman www.polinema.ac.id
                        </div>
                      </div>
                    </div>

                    {/* Table of Activities (Page 2) */}
                    <table className="w-full border-collapse border border-slate-900 text-[10pt] mb-8">
                      <thead>
                        <tr className="bg-slate-100 text-center font-bold">
                          <th className="border border-slate-900 p-2 w-[28mm]">
                            Hari, Tanggal
                          </th>
                          <th className="border border-slate-900 p-2 w-[20mm]">
                            Jam Masuk
                          </th>
                          <th className="border border-slate-900 p-2 w-[20mm]">
                            Jam Pulang
                          </th>
                          <th className="border border-slate-900 p-2">
                            Kegiatan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {page2Reports.map((r) => {
                          const formatted = formatDateIndo(r.date);
                          const parts = formatted.split(", ");
                          return (
                            <tr key={r.date} className="align-top">
                              <td className="border border-slate-900 p-2 text-center">
                                <span className="font-bold block">{parts[0]}</span>
                                <span>{parts[1] || ""}</span>
                              </td>
                              <td className="border border-slate-900 p-2 text-center">
                                {r.startTime || "08.00"}
                              </td>
                              <td className="border border-slate-900 p-2 text-center">
                                {r.endTime || (r.dayName === "Sabtu" ? "14.00" : "16.00")}
                              </td>
                              <td className="border border-slate-900 p-2 leading-relaxed text-justify">
                                {r.narrative || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Signatures Section */}
                    {renderSignatures()}
                  </div>

                  <div className="text-right text-[9pt] text-slate-400 no-print">
                    Halaman 2
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
