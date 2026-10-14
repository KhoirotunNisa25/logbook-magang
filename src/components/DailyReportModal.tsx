"use client";

import React, { useState, useEffect } from "react";
import { DailyReport, StudentProfile } from "@/types";
import { getDayName, formatDateIndo } from "@/utils/date";
import { generateDailyNarrative } from "@/utils/narrative";
import { X, Sparkles, Clock, Calendar, Check, Trash2 } from "lucide-react";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: DailyReport) => Promise<void>;
  onDelete?: (date: string) => Promise<void>;
  initialReport?: DailyReport | null;
  profile: StudentProfile;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialReport,
  profile,
}) => {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [date, setDate] = useState<string>(getTodayStr());
  const [startTime, setStartTime] = useState<string>("08.00");
  const [endTime, setEndTime] = useState<string>("16.00");
  const [rawTelegramText, setRawTelegramText] = useState<string>("");
  const [narrative, setNarrative] = useState<string>("");
  const [category, setCategory] = useState<DailyReport["category"]>("development");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialReport) {
      setDate(initialReport.date);
      setStartTime(initialReport.startTime || "08.00");
      setEndTime(initialReport.endTime || "16.00");
      setRawTelegramText(initialReport.rawTelegramText || "");
      setNarrative(initialReport.narrative || "");
      setCategory(initialReport.category || "development");
    } else {
      const today = getTodayStr();
      setDate(today);
      const isSat = new Date(today).getDay() === 6;
      setStartTime(isSat ? profile.defaultStartSaturday : profile.defaultStartWeekday);
      setEndTime(isSat ? profile.defaultEndSaturday : profile.defaultEndWeekday);
      setRawTelegramText("");
      setNarrative("");
      setCategory("development");
    }
  }, [initialReport, isOpen, profile]);

  // Saat tanggal berubah, sesuaikan jam default
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const day = new Date(newDate).getDay();
    if (day === 6) {
      setStartTime(profile.defaultStartSaturday);
      setEndTime(profile.defaultEndSaturday);
    } else {
      setStartTime(profile.defaultStartWeekday);
      setEndTime(profile.defaultEndWeekday);
    }
  };

  // Trigger auto-summarize
  const handleAutoSummarize = () => {
    if (!rawTelegramText.trim()) return;
    const result = generateDailyNarrative(rawTelegramText);
    setNarrative(result);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      alert("Harap masukkan narasi kegiatan terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const report: DailyReport = {
        id: date,
        date,
        dayName: getDayName(date),
        startTime,
        endTime,
        rawTelegramText,
        narrative: narrative.trim(),
        category,
        createdAt: initialReport?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      await onSave(report);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan laporan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !initialReport) return;
    if (confirm(`Hapus laporan kegiatan tanggal ${formatDateIndo(date)}?`)) {
      setIsSaving(true);
      try {
        await onDelete(date);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">
              {initialReport ? "Edit Laporan Harian" : "Input Laporan Harian"}
            </h3>
            <p className="text-xs text-blue-100">
              Paste teks chat Telegram untuk otomatis diringkas menjadi narasi baku
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Row 1: Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Tanggal Kegiatan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
              <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
                {formatDateIndo(date)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Jam Masuk
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08.00"
                required
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Jam Pulang
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="16.00"
                required
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Paste Raw Telegram */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Pesan Laporan Harian Telegram (Mentah)
              </label>
              <button
                type="button"
                onClick={handleAutoSummarize}
                disabled={!rawTelegramText.trim()}
                className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-slate-400 font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ringkas Otomatis</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={rawTelegramText}
              onChange={(e) => setRawTelegramText(e.target.value)}
              placeholder="Contoh:&#10;- Ikut meeting update fitur bersama pak Yuda&#10;- Slicing UI dashboard iklan&#10;- Integrasi API Daily report..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-mono"
            />
          </div>

          {/* Row 3: Hasil Narasi Logbook */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Narasi Kegiatan Logbook (Yang akan masuk ke tabel PDF)
            </label>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Narasi formal, padat dan mengalir satu paragraf..."
              required
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed text-slate-800"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              💡 Tips: Dibuat dalam 1 paragraf baku tanpa poin-poin agar rapi saat dicetak ke lembar logbook resmi.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            {initialReport && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Hapus
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || !narrative.trim()}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isSaving ? "Menyimpan..." : "Simpan Laporan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
