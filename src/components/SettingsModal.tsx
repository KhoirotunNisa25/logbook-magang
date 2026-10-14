"use client";

import React, { useState } from "react";
import { StudentProfile, AISettings, AuthUser } from "@/types";
import { StorageService } from "@/services/storage";
import {
  X,
  User,
  Sparkles,
  Database,
  Save,
  Download,
  Upload,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  aiSettings: AISettings;
  currentUser: AuthUser | null;
  onUpdateProfile: (profile: StudentProfile) => Promise<void>;
  onUpdateAISettings: (settings: AISettings) => void;
  onDataSynced: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  aiSettings,
  currentUser,
  onUpdateProfile,
  onUpdateAISettings,
  onDataSynced,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "ai" | "backup">("profile");
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [aiData, setAiData] = useState<AISettings>(aiSettings);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(formData);
    alert("Profil mahasiswa & pembimbing berhasil disimpan!");
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAISettings(aiData);
    alert("Pengaturan AI (Gemini/Claude) berhasil disimpan!");
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAllData(currentUser?.uid || "guest");
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_logbook_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importAllData(content, currentUser?.uid || "guest");
        if (success) {
          alert("Data logbook & profil berhasil diimport!");
          onDataSynced();
        } else {
          alert("File JSON tidak valid.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Pengaturan & Konfigurasi</h3>
            <p className="text-xs text-slate-400">
              Profil mahasiswa, API Gemini/Claude AI, dan backup data
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil Mahasiswa</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === "ai"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Summarizer</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === "backup"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: PROFIL */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Mahasiswa
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIM
                  </label>
                  <input
                    type="text"
                    value={formData.nim}
                    onChange={(e) =>
                      setFormData({ ...formData, nim: e.target.value })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={formData.prodi}
                    onChange={(e) =>
                      setFormData({ ...formData, prodi: e.target.value })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Mitra Industri
                  </label>
                  <input
                    type="text"
                    value={formData.mitra}
                    onChange={(e) =>
                      setFormData({ ...formData, mitra: e.target.value })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dosen Pembimbing
                  </label>
                  <input
                    type="text"
                    value={formData.dosenPembimbing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dosenPembimbing: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pembimbing Lapangan (Mitra)
                  </label>
                  <input
                    type="text"
                    value={formData.pembimbingLapangan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pembimbingLapangan: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700 block mb-2">
                  Default Jam Kerja
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-slate-500 text-[10px]">Senin-Jum Masuk</label>
                    <input
                      type="text"
                      value={formData.defaultStartWeekday}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultStartWeekday: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px]">Senin-Jum Pulang</label>
                    <input
                      type="text"
                      value={formData.defaultEndWeekday}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultEndWeekday: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px]">Sabtu Masuk</label>
                    <input
                      type="text"
                      value={formData.defaultStartSaturday}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultStartSaturday: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px]">Sabtu Pulang</label>
                    <input
                      type="text"
                      value={formData.defaultEndSaturday}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultEndSaturday: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Simpan Profil Mahasiswa
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AI SETTINGS */}
          {activeTab === "ai" && (
            <form onSubmit={handleSaveAI} className="space-y-4">
              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-950 space-y-1.5">
                <div className="font-bold flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Ringkas Narasi Menggunakan AI
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900">
                  Kamu bisa menggunakan API Key Google Gemini (dari Google AI Studio) atau Claude untuk otomatis meringkas chat Telegram menjadi narasi formal berstandar logbook akademik.
                </p>
                <div className="pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline"
                  >
                    <span>Dapatkan API Key Gemini Gratis di Google AI Studio</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilihan Provider AI
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAiData({
                        ...aiData,
                        provider: "gemini",
                        model: "gemini-2.5-flash",
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      aiData.provider === "gemini"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Google Gemini (Recommended)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAiData({
                        ...aiData,
                        provider: "claude",
                        model: "claude-3-5-sonnet-20241022",
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      aiData.provider === "claude"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Anthropic Claude
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Model AI
                </label>
                <select
                  value={aiData.model}
                  onChange={(e) => setAiData({ ...aiData, model: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {aiData.provider === "gemini" ? (
                    <>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sangat Cepat & Cerdas)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Hemat & Stabil)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Maksimal)</option>
                    </>
                  ) : (
                    <>
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Cerdas)</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Cepat)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  API Key ({aiData.provider === "gemini" ? "Gemini" : "Claude"})
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={aiData.apiKey}
                    onChange={(e) =>
                      setAiData({ ...aiData, apiKey: e.target.value })
                    }
                    placeholder={
                      aiData.provider === "gemini"
                        ? "AIzaSy..."
                        : "sk-ant-api..."
                    }
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Kunci API disimpan aman di browser lokal Anda (tidak di-share ke siapa pun).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Simpan Pengaturan AI
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                <div className="font-bold">Backup & Export JSON</div>
                <p className="text-[11px] mt-0.5">
                  Download seluruh riwayat laporan dan profil dalam file JSON untuk cadangan, atau memindahkannya ke komputer lain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">Export Backup</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Download seluruh data lokal ke file JSON.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="mt-3 inline-flex items-center justify-center py-2 px-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download JSON
                  </button>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">Restore Data</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Upload file JSON hasil backup sebelumnya.
                    </p>
                  </div>
                  <label className="mt-3 cursor-pointer inline-flex items-center justify-center py-2 px-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 shadow-sm">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>Pilih File Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
