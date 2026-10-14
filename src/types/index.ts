export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, etc.
  startTime: string; // "08.00"
  endTime: string; // "16.00" or "14.00"
  rawTelegramText: string;
  narrative: string;
  category?: 'development' | 'meeting' | 'maintenance' | 'creative' | 'other';
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export interface StudentProfile {
  nama: string;
  nim: string;
  prodi: string;
  mitra: string;
  dosenPembimbing: string;
  pembimbingLapangan: string;
  defaultStartWeekday: string;
  defaultEndWeekday: string;
  defaultStartSaturday: string;
  defaultEndSaturday: string;
}

export interface FirebaseConfigSettings {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enabled: boolean;
}

export interface AISettings {
  provider: 'gemini' | 'claude';
  apiKey: string;
  model: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface WeeklyLogbook {
  id: string; // e.g. "2026-10-W2"
  monthName: string; // "Oktober"
  year: number; // 2026
  monthIndex: number; // 1-12
  weekIndexInMonth: number; // 1, 2, 3...
  titleLabel: string; // e.g. "LB 5 - 10 OKTOBER"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reports: DailyReport[];
  totalDays: number;
  isComplete: boolean;
}

export const DEFAULT_PROFILE: StudentProfile = {
  nama: "Khoirotun Nisa’",
  nim: "2341720057",
  prodi: "Teknik Informatika",
  mitra: "PT. Naraya Telematika",
  dosenPembimbing: "Ridwan Rismanto, SST., M.Kom.",
  pembimbingLapangan: "Sekar Darma Revika",
  defaultStartWeekday: "08.00",
  defaultEndWeekday: "16.00",
  defaultStartSaturday: "08.00",
  defaultEndSaturday: "14.00",
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-2.5-flash",
};
