"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StudentProfile, DailyReport, WeeklyLogbook, AISettings, AuthUser } from "@/types";
import { StorageService } from "@/services/storage";
import { auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getInternshipMonths, generateMonthWeeks, MonthMeta } from "@/utils/date";
import { Navbar } from "@/components/Navbar";
import { WeeklyLogbookCard } from "@/components/WeeklyLogbookCard";
import { DailyReportModal } from "@/components/DailyReportModal";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { SettingsModal } from "@/components/SettingsModal";
import { DisseminationModule } from "@/components/DisseminationModule";
import { Calendar, Search } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const currentUserId = currentUser?.uid || "guest";

  const [profile, setProfile] = useState<StudentProfile>(StorageService.getProfile("guest"));
  const [reports, setReports] = useState<Record<string, DailyReport>>({});
  const [aiSettings, setAiSettings] = useState<AISettings>(StorageService.getAISettings());

  const months = useMemo<MonthMeta[]>(() => getInternshipMonths(), []);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(10); // Default Oktober (10)
  const [activeTab, setActiveTab] = useState<"logbook" | "dissemination">("logbook");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewLogbook, setPreviewLogbook] = useState<WeeklyLogbook | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setCurrentUser(authUser);

        // Fetch cloud data for this user
        const { reports: cloudReports, profile: cloudProfile } =
          await StorageService.syncFromCloud(user.uid);

        setReports(StorageService.getReports(user.uid));
        if (cloudProfile) {
          setProfile(cloudProfile);
        } else {
          // If no remote profile yet, adapt name from Google Account
          const localProf = StorageService.getProfile(user.uid);
          if (user.displayName && localProf.nama === "Khoirotun Nisa’" && user.displayName !== "Khoirotun Nisa’") {
            localProf.nama = user.displayName;
          }
          setProfile(localProf);
        }
      } else {
        setCurrentUser(null);
        setReports(StorageService.getReports("guest"));
        setProfile(StorageService.getProfile("guest"));
      }
    });

    setAiSettings(StorageService.getAISettings());

    return () => unsubscribe();
  }, []);

  // Compute weeks for selected month with strict monthly cut-off
  const currentMonthWeeks = useMemo(() => {
    return generateMonthWeeks(2026, selectedMonthIndex, reports);
  }, [selectedMonthIndex, reports]);

  // Filtered weeks based on search query
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return currentMonthWeeks;
    const q = searchQuery.toLowerCase();
    return currentMonthWeeks.filter((w) => {
      const matchTitle = w.titleLabel.toLowerCase().includes(q);
      const matchNarrative = w.reports.some((r) =>
        r.narrative?.toLowerCase().includes(q)
      );
      return matchTitle || matchNarrative;
    });
  }, [currentMonthWeeks, searchQuery]);

  // Statistics for active month
  const totalDaysInMonth = currentMonthWeeks.reduce((acc, w) => acc + w.totalDays, 0);
  const filledDaysInMonth = currentMonthWeeks.reduce(
    (acc, w) =>
      acc +
      w.reports.filter((r) => r.narrative && r.narrative.trim().length > 0).length,
    0
  );

  // Handlers
  const handleLogin = async () => {
    try {
      await StorageService.loginWithGoogle();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        alert(`Gagal login Google: ${err.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await StorageService.logout();
  };

  const handleSaveReport = async (report: DailyReport) => {
    await StorageService.saveReport(report, currentUserId);
    setReports(StorageService.getReports(currentUserId));
  };

  const handleDeleteReport = async (date: string) => {
    await StorageService.deleteReport(date, currentUserId);
    setReports(StorageService.getReports(currentUserId));
  };

  const handleUpdateProfile = async (newProfile: StudentProfile) => {
    await StorageService.saveProfile(newProfile, currentUserId);
    setProfile(newProfile);
  };

  const handleUpdateAISettings = (newSettings: AISettings) => {
    StorageService.saveAISettings(newSettings);
    setAiSettings(newSettings);
  };

  const handleDataSynced = () => {
    setReports(StorageService.getReports(currentUserId));
    setProfile(StorageService.getProfile(currentUserId));
  };

  const handleOpenReportModal = (
    report?: DailyReport | null,
    defaultDate?: string
  ) => {
    if (report) {
      setSelectedReport(report);
    } else if (defaultDate) {
      const isSat = new Date(defaultDate).getDay() === 6;
      setSelectedReport({
        id: defaultDate,
        date: defaultDate,
        dayName: "",
        startTime: isSat ? profile.defaultStartSaturday : profile.defaultStartWeekday,
        endTime: isSat ? profile.defaultEndSaturday : profile.defaultEndWeekday,
        rawTelegramText: "",
        narrative: "",
        createdAt: 0,
        updatedAt: 0,
      });
    } else {
      setSelectedReport(null);
    }
    setIsReportModalOpen(true);
  };

  const handleOpenPreview = (logbook: WeeklyLogbook) => {
    setPreviewLogbook(logbook);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewReport={() => handleOpenReportModal(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dissemination" ? (
          <DisseminationModule profile={profile} reports={reports} />
        ) : (
          <div className="space-y-6">
            {/* Month Selector Pills & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              {/* Month Tabs (Juli - Desember) */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {months.map((m) => {
                  const isSelected = m.monthIndex === selectedMonthIndex;
                  return (
                    <button
                      key={m.monthIndex}
                      onClick={() => setSelectedMonthIndex(m.monthIndex)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {m.monthName} 2026
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Monthly Progress Overview Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  Target Logbook Bulanan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-2">
                  Bulan {months.find((m) => m.monthIndex === selectedMonthIndex)?.monthName} 2026
                </h2>
                <p className="text-xs text-blue-200 mt-1">
                  Aturan Polinema: Format mingguan terpotong rapi di tanggal akhir bulan (Senin - Sabtu)
                </p>
              </div>

              {/* Progress Count */}
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10 flex-shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black">
                    {filledDaysInMonth} / {totalDaysInMonth}
                  </div>
                  <div className="text-[11px] text-blue-200">Hari Terisi</div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-blue-400 border-t-white flex items-center justify-center font-bold text-xs">
                  {Math.round((filledDaysInMonth / (totalDaysInMonth || 1)) * 100)}%
                </div>
              </div>
            </div>

            {/* Weeks List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
                <span>Daftar Logbook Mingguan (Strict Monthly Split)</span>
                <span>{filteredWeeks.length} Berkas Minggu</span>
              </div>

              {filteredWeeks.map((week) => (
                <WeeklyLogbookCard
                  key={week.id}
                  logbook={week}
                  profile={profile}
                  onOpenReportModal={(report, date) =>
                    handleOpenReportModal(report, date)
                  }
                  onOpenPreviewModal={handleOpenPreview}
                  onOpenLatexModal={handleOpenPreview}
                />
              ))}

              {filteredWeeks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">
                    Tidak ditemukan minggu yang sesuai pencarian
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba ganti kata kunci atau pilih bulan yang lain.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p>
          Logbook Magang Industri • Jurusan Teknologi Informasi Politeknik Negeri Malang
        </p>
      </footer>

      {/* Modals */}
      <DailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSave={handleSaveReport}
        onDelete={handleDeleteReport}
        initialReport={selectedReport}
        profile={profile}
        aiSettings={aiSettings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        logbook={previewLogbook}
        profile={profile}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        aiSettings={aiSettings}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onUpdateAISettings={handleUpdateAISettings}
        onDataSynced={handleDataSynced}
      />
    </div>
  );
}
