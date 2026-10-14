import {
  DailyReport,
  StudentProfile,
  FirebaseConfigSettings,
  DEFAULT_PROFILE,
  AISettings,
  DEFAULT_AI_SETTINGS,
  AuthUser,
} from "@/types";
import { auth, db, googleProvider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const STORAGE_KEYS = {
  PROFILE_PREFIX: "polinema_magang_profile_",
  REPORTS_PREFIX: "polinema_magang_reports_",
  AI_SETTINGS: "polinema_magang_ai_settings",
};

export class StorageService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- Auth Management ---
  public static async loginWithGoogle(): Promise<AuthUser | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error: any) {
      console.error("Login Google gagal:", error);
      throw error;
    }
  }

  public static async logout(): Promise<void> {
    await signOut(auth);
  }

  // --- Profile Management ---
  public static getProfile(userId: string = "guest"): StudentProfile {
    if (!this.isBrowser()) return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.PROFILE_PREFIX}${userId}`);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
    return DEFAULT_PROFILE;
  }

  public static async saveProfile(profile: StudentProfile, userId: string = "guest"): Promise<void> {
    if (this.isBrowser()) {
      localStorage.setItem(`${STORAGE_KEYS.PROFILE_PREFIX}${userId}`, JSON.stringify(profile));
    }

    if (userId !== "guest") {
      try {
        await setDoc(doc(db, "users", userId, "settings", "profile"), profile);
      } catch (err) {
        console.error("Failed to sync profile to Firestore:", err);
      }
    }
  }

  // --- Daily Reports Management ---
  public static getReports(userId: string = "guest"): Record<string, DailyReport> {
    if (!this.isBrowser()) return {};
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.REPORTS_PREFIX}${userId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load reports:", e);
    }
    return {};
  }

  public static async saveReport(report: DailyReport, userId: string = "guest"): Promise<void> {
    if (this.isBrowser()) {
      const reports = this.getReports(userId);
      reports[report.date] = { ...report, userId };
      localStorage.setItem(`${STORAGE_KEYS.REPORTS_PREFIX}${userId}`, JSON.stringify(reports));
    }

    if (userId !== "guest") {
      try {
        await setDoc(doc(db, "users", userId, "daily_reports", report.date), {
          ...report,
          userId,
        });
      } catch (err) {
        console.error("Failed to sync report to Firestore:", err);
      }
    }
  }

  public static async deleteReport(date: string, userId: string = "guest"): Promise<void> {
    if (this.isBrowser()) {
      const reports = this.getReports(userId);
      delete reports[date];
      localStorage.setItem(`${STORAGE_KEYS.REPORTS_PREFIX}${userId}`, JSON.stringify(reports));
    }

    if (userId !== "guest") {
      try {
        await setDoc(doc(db, "users", userId, "daily_reports", date), { deleted: true }, { merge: true });
      } catch (err) {
        console.error("Failed to delete report from Firestore:", err);
      }
    }
  }

  // --- Sync from Cloud for specific user ---
  public static async syncFromCloud(userId: string): Promise<{ reports: Record<string, DailyReport>; profile?: StudentProfile }> {
    if (userId === "guest") return { reports: this.getReports("guest") };

    // Fetch user profile from Firestore
    let profile: StudentProfile | undefined;
    try {
      const profileSnap = await getDoc(doc(db, "users", userId, "settings", "profile"));
      if (profileSnap.exists()) {
        profile = profileSnap.data() as StudentProfile;
        if (this.isBrowser()) {
          localStorage.setItem(`${STORAGE_KEYS.PROFILE_PREFIX}${userId}`, JSON.stringify(profile));
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote profile:", e);
    }

    // Fetch daily reports
    const fetchedReports: Record<string, DailyReport> = {};
    try {
      const reportsSnap = await getDocs(collection(db, "users", userId, "daily_reports"));
      reportsSnap.forEach((d) => {
        const data = d.data();
        if (!data.deleted && data.date) {
          fetchedReports[data.date] = data as DailyReport;
        }
      });

      if (this.isBrowser()) {
        const localReports = this.getReports(userId);
        const merged = { ...localReports, ...fetchedReports };
        localStorage.setItem(`${STORAGE_KEYS.REPORTS_PREFIX}${userId}`, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn("Could not fetch remote reports:", e);
    }

    return { reports: fetchedReports, profile };
  }

  // --- AI Settings (Gemini / Claude) ---
  public static getAISettings(): AISettings {
    if (!this.isBrowser()) return DEFAULT_AI_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (data) {
        return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error("Failed to load AI settings:", e);
    }
    return DEFAULT_AI_SETTINGS;
  }

  public static saveAISettings(settings: AISettings): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
    }
  }

  // --- Export / Import JSON ---
  public static exportAllData(userId: string = "guest"): string {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      userId,
      profile: this.getProfile(userId),
      reports: this.getReports(userId),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importAllData(jsonStr: string, userId: string = "guest"): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) {
        this.saveProfile(data.profile, userId);
      }
      if (data.reports && typeof data.reports === "object") {
        if (this.isBrowser()) {
          const current = this.getReports(userId);
          const merged = { ...current, ...data.reports };
          localStorage.setItem(`${STORAGE_KEYS.REPORTS_PREFIX}${userId}`, JSON.stringify(merged));
        }
      }
      return true;
    } catch (e) {
      console.error("Gagal import data JSON:", e);
      return false;
    }
  }
}
