"use client";

import React from "react";
import { StudentProfile, DailyReport } from "@/types";
import { MONTH_NAMES_ID, formatDateIndo } from "@/utils/date";
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  Award,
  Download,
  CheckCircle,
  Briefcase,
} from "lucide-react";

interface DisseminationModuleProps {
  profile: StudentProfile;
  reports: Record<string, DailyReport>;
}

export const DisseminationModule: React.FC<DisseminationModuleProps> = ({
  profile,
  reports,
}) => {
  const reportList = Object.values(reports)
    .filter((r) => r.narrative && r.narrative.trim().length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Hitung total hari kerja & jam estimasi
  const totalDays = reportList.length;
  const totalHours = reportList.reduce((acc, r) => {
    const isSat = r.dayName === "Sabtu";
    return acc + (isSat ? 6 : 8);
  }, 0);

  // Grouping narasi per bulan untuk Diseminasi
  const monthlySummaries: Record<string, DailyReport[]> = {};
  for (const r of reportList) {
    const month = r.date.substring(0, 7); // YYYY-MM
    if (!monthlySummaries[month]) monthlySummaries[month] = [];
    monthlySummaries[month].push(r);
  }

  const handleExportDisseminationDraft = () => {
    let content = `# PROPOSAL / LAPORAN DISEMINASI HASIL MAGANG INDUSTRI\n`;
    content += `POLITEKNIK NEGERI MALANG\n\n`;
    content += `Nama Mahasiswa      : ${profile.nama}\n`;
    content += `NIM                 : ${profile.nim}\n`;
    content += `Program Studi       : ${profile.prodi}\n`;
    content += `Mitra Industri      : ${profile.mitra}\n`;
    content += `Dosen Pembimbing    : ${profile.dosenPembimbing}\n`;
    content += `Pembimbing Lapangan : ${profile.pembimbingLapangan}\n`;
    content += `Periode Magang      : Juli 2026 s.d. 31 Desember 2026\n`;
    content += `Total Hari Kerja    : ${totalDays} Hari (${totalHours} Jam Kerja)\n\n`;
    content += `------------------------------------------------------------\n\n`;

    content += `## BAB 1: RINGKASAN PELAKSANAAN MAGANG\n`;
    content += `Program magang industri dilaksanakan di ${profile.mitra} dengan fokus pengembangan sistem, manajemen platform media iklan, serta rekayasa perangkat lunak. Selama periode magang, mahasiswa telah menuntaskan ${totalDays} hari kerja dengan rincian aktivitas terstruktur berikut:\n\n`;

    Object.entries(monthlySummaries).forEach(([monthKey, list]) => {
      const [year, month] = monthKey.split("-");
      const monthName = MONTH_NAMES_ID[parseInt(month, 10) - 1];
      content += `### Aktivitas Bulan ${monthName} ${year} (${list.length} Hari Kerja)\n`;
      list.forEach((r, idx) => {
        content += `${idx + 1}. [${formatDateIndo(r.date)}] ${r.narrative}\n`;
      });
      content += `\n`;
    });

    content += `## BAB 2: CAPAIAN KOMPETENSI & LUARAN PROYEK\n`;
    content += `1. Rekayasa antarmuka pengguna dan backend integrasi API.\n`;
    content += `2. Analisis performa iklan digital, optimasi sinkronisasi data Meta Ads, dan pelaporan otomatis.\n`;
    content += `3. Pengujian menyeluruh (E2E) dan kolaborasi tim profesional industri.\n\n`;

    content += `Malang, 31 Desember 2026\n`;
    content += `Mahasiswa,\n\n\n${profile.nama}\nNIM. ${profile.nim}\n`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Draft_Diseminasi_Magang_${profile.nim}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 mb-2 border border-blue-400/20">
            <Award className="w-3.5 h-3.5 mr-1" />
            Persiapan Laporan Akhir & Diseminasi
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Ringkasan Agregasi Kegiatan Magang
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Data teragregasi otomatis dari seluruh logbook harian (s.d. 31 Desember 2026)
          </p>
        </div>

        <button
          onClick={handleExportDisseminationDraft}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4 mr-1.5 text-blue-600" />
          Export Draft Diseminasi (.md)
        </button>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalDays}</div>
            <div className="text-xs text-slate-500">Hari Kerja Terekam</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalHours} Jam</div>
            <div className="text-xs text-slate-500">Akumulasi Jam Magang</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {Object.keys(monthlySummaries).length} Bulan
            </div>
            <div className="text-xs text-slate-500">Rentang Periode Aktif</div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Accordion/Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          Rincian Portofolio Kegiatan Per Bulan
        </h3>

        {Object.keys(monthlySummaries).length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Belum ada kegiatan harian yang diisi. Mulai isi laporan harian untuk
            melihat agregasi diseminasi di sini.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(monthlySummaries).map(([monthKey, list]) => {
              const [year, month] = monthKey.split("-");
              const monthName = MONTH_NAMES_ID[parseInt(month, 10) - 1];

              return (
                <div
                  key={monthKey}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {monthName} {year}
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {list.length} Kegiatan Selesai
                    </span>
                  </div>

                  <div className="space-y-2">
                    {list.map((item) => (
                      <div
                        key={item.date}
                        className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                      >
                        <span className="font-semibold text-blue-700 w-40 flex-shrink-0">
                          {formatDateIndo(item.date)}:
                        </span>
                        <p className="text-slate-700 flex-1 leading-relaxed">
                          {item.narrative}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
