"use client";

import React, { useState } from "react";
import { WeeklyLogbook, DailyReport, StudentProfile } from "@/types";
import { formatDateIndo } from "@/utils/date";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code
} from "lucide-react";

interface WeeklyLogbookCardProps {
  logbook: WeeklyLogbook;
  profile: StudentProfile;
  onOpenReportModal: (report?: DailyReport | null, defaultDate?: string) => void;
  onOpenPreviewModal: (logbook: WeeklyLogbook) => void;
  onOpenLatexModal: (logbook: WeeklyLogbook) => void;
}

export const WeeklyLogbookCard: React.FC<WeeklyLogbookCardProps> = ({
  logbook,
  onOpenReportModal,
  onOpenPreviewModal,
  onOpenLatexModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filledCount = logbook.reports.filter(
    (r) => r.narrative && r.narrative.trim().length > 0
  ).length;

  const isComplete = filledCount === logbook.totalDays;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden mb-4">
      {/* Card Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50 border-b border-slate-100">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isComplete
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-800">
                {logbook.titleLabel}
              </h3>
              {isComplete ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Lengkap
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {filledCount}/{logbook.totalDays} Hari
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Periode: {formatDateIndo(logbook.startDate)} s.d.{" "}
              {formatDateIndo(logbook.endDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenPreviewModal(logbook)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            title="Lihat Pratinjau Dokumen & Cetak PDF"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            <span>Lihat / Download PDF</span>
          </button>

          <button
            onClick={() => onOpenLatexModal(logbook)}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all"
            title="Lihat Kode LaTeX (.tex)"
          >
            <Code className="w-3.5 h-3.5 mr-1" />
            <span>LaTeX</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className={`h-1 transition-all duration-300 ${
            isComplete ? "bg-emerald-500" : "bg-blue-600"
          }`}
          style={{ width: `${(filledCount / logbook.totalDays) * 100}%` }}
        />
      </div>

      {/* Expandable Daily Items */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 bg-white">
          {logbook.reports.map((report) => {
            const hasNarrative = Boolean(report.narrative?.trim());
            return (
              <div
                key={report.date}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="sm:w-48 flex-shrink-0">
                  <div className="font-bold text-slate-800">
                    {formatDateIndo(report.date)}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Jam: {report.startTime || "08.00"} -{" "}
                    {report.endTime || "16.00"}
                  </div>
                </div>

                <div className="flex-1 text-slate-700">
                  {hasNarrative ? (
                    <p className="line-clamp-2 italic leading-relaxed text-slate-800">
                      "{report.narrative}"
                    </p>
                  ) : (
                    <span className="text-slate-400 italic">
                      Belum ada laporan kegiatan untuk hari ini.
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {hasNarrative ? (
                    <button
                      onClick={() => onOpenReportModal(report)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-md border border-slate-200 transition-all"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenReportModal(null, report.date)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-all"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Isi Laporan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
