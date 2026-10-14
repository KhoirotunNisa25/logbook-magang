import { DailyReport, StudentProfile, FirebaseConfigSettings, DEFAULT_PROFILE } from "@/types";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const STORAGE_KEYS = {
  PROFILE: "polinema_magang_profile",
  REPORTS: "polinema_magang_reports",
  FIREBASE_CONFIG: "polinema_magang_firebase_config",
};

export class StorageService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- Profile Management ---
  public static getProfile(): StudentProfile {
    if (!this.isBrowser()) return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage:", e);
    }
    return DEFAULT_PROFILE;
  }

  public static async saveProfile(profile: StudentProfile, firebaseConfig?: FirebaseConfigSettings): Promise<void> {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }

    if (firebaseConfig?.enabled) {
      try {
        const db = this.getFirestoreInstance(firebaseConfig);
        if (db) {
          await setDoc(doc(db, "internship", "profile"), profile);
        }
      } catch (err) {
        console.error("Failed to sync profile with Firebase:", err);
      }
    }
  }

  // --- Daily Reports Management ---
  public static getReports(): Record<string, DailyReport> {
    if (!this.isBrowser()) return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load reports from localStorage:", e);
    }
    return {};
  }

  public static async saveReport(report: DailyReport, firebaseConfig?: FirebaseConfigSettings): Promise<void> {
    if (this.isBrowser()) {
      const reports = this.getReports();
      reports[report.date] = report;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }

    if (firebaseConfig?.enabled) {
      try {
        const db = this.getFirestoreInstance(firebaseConfig);
        if (db) {
          await setDoc(doc(db, "daily_reports", report.date), report);
        }
      } catch (err) {
        console.error("Failed to sync report with Firebase:", err);
      }
    }
  }

  public static async deleteReport(date: string, firebaseConfig?: FirebaseConfigSettings): Promise<void> {
    if (this.isBrowser()) {
      const reports = this.getReports();
      delete reports[date];
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }

    if (firebaseConfig?.enabled) {
      try {
        const db = this.getFirestoreInstance(firebaseConfig);
        if (db) {
          // Soft-delete or remove
          await setDoc(doc(db, "daily_reports", date), { deleted: true }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to delete report from Firebase:", err);
      }
    }
  }

  // --- Firebase Configuration ---
  public static getFirebaseConfig(): FirebaseConfigSettings {
    const defaultConfig: FirebaseConfigSettings = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      enabled: false,
    };

    if (!this.isBrowser()) return defaultConfig;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...defaultConfig,
          ...parsed,
          enabled: parsed.enabled ?? (Boolean(parsed.apiKey && parsed.projectId)),
        };
      }
    } catch (e) {
      console.error("Failed to load Firebase config from localStorage:", e);
    }
    return defaultConfig;
  }

  public static saveFirebaseConfig(config: FirebaseConfigSettings): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    }
  }

  // --- Firebase Sync Helpers ---
  public static async syncFromFirebase(firebaseConfig: FirebaseConfigSettings): Promise<{ reports: Record<string, DailyReport>; profile?: StudentProfile }> {
    const db = this.getFirestoreInstance(firebaseConfig);
    if (!db) throw new Error("Firebase belum diinisialisasi.");

    // Fetch profile
    const profileDoc = await getDoc(doc(db, "internship", "profile"));
    let profile: StudentProfile | undefined;
    if (profileDoc.exists()) {
      profile = profileDoc.data() as StudentProfile;
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      }
    }

    // Fetch reports
    const reportsSnapshot = await getDocs(collection(db, "daily_reports"));
    const fetchedReports: Record<string, DailyReport> = {};
    reportsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.deleted && data.date) {
        fetchedReports[data.date] = data as DailyReport;
      }
    });

    if (this.isBrowser()) {
      const current = this.getReports();
      const merged = { ...current, ...fetchedReports };
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
    }

    return { reports: fetchedReports, profile };
  }

  private static getFirestoreInstance(config: FirebaseConfigSettings) {
    if (!config.apiKey || !config.projectId) return null;
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
    return getFirestore(app);
  }

  // --- Export / Import JSON ---
  public static exportAllData(): string {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      reports: this.getReports(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) {
        this.saveProfile(data.profile);
      }
      if (data.reports && typeof data.reports === "object") {
        if (this.isBrowser()) {
          const current = this.getReports();
          const merged = { ...current, ...data.reports };
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
        }
      }
      return true;
    } catch (e) {
      console.error("Gagal import data JSON:", e);
      return false;
    }
  }
}
