"use client";

import React, { useState } from "react";
import { StudentProfile, FirebaseConfigSettings } from "@/types";
import { StorageService } from "@/services/storage";
import {
  X,
  User,
  Flame,
  Database,
  Save,
  Download,
  Upload,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  firebaseConfig: FirebaseConfigSettings;
  onUpdateProfile: (profile: StudentProfile) => Promise<void>;
  onUpdateFirebaseConfig: (config: FirebaseConfigSettings) => void;
  onDataSynced: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  firebaseConfig,
  onUpdateProfile,
  onUpdateFirebaseConfig,
  onDataSynced,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "firebase" | "backup">("profile");
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [fbData, setFbData] = useState<FirebaseConfigSettings>(firebaseConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(formData);
    alert("Profil mahasiswa & pembimbing berhasil disimpan!");
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFirebaseConfig(fbData);
    alert("Konfigurasi Firebase berhasil diperbarui!");
  };

  const handleTestAndSync = async () => {
    setIsSyncing(true);
    setSyncStatus("Menghubungkan ke Firebase Firestore...");
    try {
      const res = await StorageService.syncFromFirebase(fbData);
      setSyncStatus(`Sinkronisasi sukses! ${Object.keys(res.reports).length} laporan dimuat.`);
      onDataSynced();
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Gagal: ${err.message || "Cek konfigurasi Firebase API key & Project ID."}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAllData();
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
        const success = StorageService.importAllData(content);
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
            <h3 className="text-base font-bold">Pengaturan & Database</h3>
            <p className="text-xs text-slate-400">
              Konfigurasi data mahasiswa, jam kerja, dan integrasi Firebase
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
            <span>Profil & Tanda Tangan</span>
          </button>

          <button
            onClick={() => setActiveTab("firebase")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === "firebase"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase Sync</span>
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
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FIREBASE */}
          {activeTab === "firebase" && (
            <form onSubmit={handleSaveFirebase} className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center">
                  <Flame className="w-4 h-4 mr-1 text-amber-600" />
                  Sinkronisasi Cloud Firebase Firestore
                </div>
                <p className="text-[11px] leading-relaxed">
                  Masukkan konfigurasi project dari Firebase Console agar kamu bisa
                  mengisi laporan harian lewat HP saat di luar rumah dan data otomatis
                  sinkron ke laptop!
                </p>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="enableFb"
                  checked={fbData.enabled}
                  onChange={(e) =>
                    setFbData({ ...fbData, enabled: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="enableFb" className="font-semibold text-slate-800">
                  Aktifkan Sinkronisasi Otomatis ke Cloud (Firebase)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-0.5">apiKey</label>
                  <input
                    type="text"
                    value={fbData.apiKey}
                    onChange={(e) =>
                      setFbData({ ...fbData, apiKey: e.target.value })
                    }
                    placeholder="AIzaSy..."
                    className="w-full font-mono text-[11px] border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">projectId</label>
                  <input
                    type="text"
                    value={fbData.projectId}
                    onChange={(e) =>
                      setFbData({ ...fbData, projectId: e.target.value })
                    }
                    placeholder="logbook-magang-xyz"
                    className="w-full font-mono text-[11px] border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">authDomain</label>
                  <input
                    type="text"
                    value={fbData.authDomain}
                    onChange={(e) =>
                      setFbData({ ...fbData, authDomain: e.target.value })
                    }
                    placeholder="xyz.firebaseapp.com"
                    className="w-full font-mono text-[11px] border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">appId</label>
                  <input
                    type="text"
                    value={fbData.appId}
                    onChange={(e) =>
                      setFbData({ ...fbData, appId: e.target.value })
                    }
                    placeholder="1:123456789:web:abcdef"
                    className="w-full font-mono text-[11px] border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {syncStatus && (
                <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800 text-[11px] border border-slate-200 flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors"
                >
                  Simpan Konfigurasi
                </button>
                <button
                  type="button"
                  onClick={handleTestAndSync}
                  disabled={isSyncing || !fbData.projectId}
                  className="inline-flex items-center justify-center py-2 px-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-slate-300 transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 mr-1.5 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                  <span>Tarik Data Cloud</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                <div className="font-bold">Backup Offline Data Logbook</div>
                <p className="text-[11px] mt-0.5">
                  Kamu bisa mendownload seluruh riwayat laporan dan profil dalam 1
                  file JSON untuk cadangan, atau memindahkannya ke komputer lain.
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
