"use client";

import React from "react";
import Image from "next/image";
import { StudentProfile, AuthUser } from "@/types";
import { Settings, PlusCircle, LogIn, LogOut, FileSpreadsheet } from "lucide-react";

interface NavbarProps {
  profile: StudentProfile;
  currentUser: AuthUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenNewReport: () => void;
  activeTab: "logbook" | "dissemination";
  setActiveTab: (tab: "logbook" | "dissemination") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentUser,
  onLogin,
  onLogout,
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
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-white flex-shrink-0">
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

          {/* User Auth & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Add Report Button */}
            <button
              onClick={onOpenNewReport}
              className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs sm:text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Input Report</span>
              <span className="sm:hidden">Input</span>
            </button>

            {/* Google Auth Status / Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-2">
                <div className="flex items-center space-x-1.5" title={currentUser.email || ""}>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-8 h-8 rounded-full border border-blue-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs">
                    <div className="font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                      {currentUser.displayName}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">Cloud Active</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all"
                title="Masuk dengan akun Google agar logbook tersimpan di cloud"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Masuk Google</span>
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Pengaturan Profil, AI & Database"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
