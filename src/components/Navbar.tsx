"use client";

import React from "react";
import Image from "next/image";
import { StudentProfile, FirebaseConfigSettings } from "@/types";
import { Settings, PlusCircle, Cloud, CloudOff, FileSpreadsheet } from "lucide-react";

interface NavbarProps {
  profile: StudentProfile;
  firebaseConfig: FirebaseConfigSettings;
  onOpenSettings: () => void;
  onOpenNewReport: () => void;
  activeTab: "logbook" | "dissemination";
  setActiveTab: (tab: "logbook" | "dissemination") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  firebaseConfig,
  onOpenSettings,
  onOpenNewReport,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-white">
              <Image
                src="/logo_polinema.jpg"
                alt="Logo Polinema"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Logbook Magang Industri
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Polinema
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {profile.nama} • {profile.mitra}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("logbook")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "logbook"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Logbook Mingguan
            </button>
            <button
              onClick={() => setActiveTab("dissemination")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 ${
                activeTab === "dissemination"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Diseminasi Magang
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync Badge */}
            <div
              onClick={onOpenSettings}
              className={`cursor-pointer hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                firebaseConfig.enabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
              title={
                firebaseConfig.enabled
                  ? "Terhubung ke Firebase Firestore (Cloud Sync Aktif)"
                  : "Tersimpan Lokal di Browser (Klik untuk Setup Firebase)"
              }
            >
              {firebaseConfig.enabled ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Sync</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lokal</span>
                </>
              )}
            </div>

            {/* Quick Add Report Button */}
            <button
              onClick={onOpenNewReport}
              className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs sm:text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Input Report</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Pengaturan Profil & Database"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
