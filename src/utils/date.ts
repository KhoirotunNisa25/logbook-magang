import { WeeklyLogbook, DailyReport } from "@/types";

export const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const DAY_NAMES_ID = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = DAY_NAMES_ID[d.getDay()];
  const monthName = MONTH_NAMES_ID[month - 1];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function getDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return DAY_NAMES_ID[d.getDay()];
}

export function isWorkDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayIndex = d.getDay();
  // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
  return dayIndex >= 1 && dayIndex <= 6;
}

export interface MonthMeta {
  year: number;
  monthIndex: number; // 1-12
  monthName: string;
}

// Generate months from July 2026 to December 2026
export function getInternshipMonths(): MonthMeta[] {
  const months: MonthMeta[] = [];
  for (let m = 7; m <= 12; m++) {
    months.push({
      year: 2026,
      monthIndex: m,
      monthName: MONTH_NAMES_ID[m - 1],
    });
  }
  return months;
}

// Generate weeks for a specific month with strict monthly cut-off
export function generateMonthWeeks(year: number, monthIndex: number, reportsMap: Record<string, DailyReport>): WeeklyLogbook[] {
  const weeks: WeeklyLogbook[] = [];
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const monthName = MONTH_NAMES_ID[monthIndex - 1];

  let currentWeekDays: string[] = [];
  let weekCounter = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(year, monthIndex - 1, day);
    const dayOfWeek = d.getDay(); // 0: Sun, 1: Mon, ... 6: Sat

    // Skip Sunday
    if (dayOfWeek === 0) {
      if (currentWeekDays.length > 0) {
        weeks.push(createWeeklyLogbook(year, monthIndex, monthName, weekCounter++, currentWeekDays, reportsMap));
        currentWeekDays = [];
      }
      continue;
    }

    currentWeekDays.push(dateStr);

    // If Saturday, finish this week
    if (dayOfWeek === 6) {
      weeks.push(createWeeklyLogbook(year, monthIndex, monthName, weekCounter++, currentWeekDays, reportsMap));
      currentWeekDays = [];
    }
  }

  // If month ends on any workday other than Saturday (e.g. Friday 31st July)
  if (currentWeekDays.length > 0) {
    weeks.push(createWeeklyLogbook(year, monthIndex, monthName, weekCounter++, currentWeekDays, reportsMap));
  }

  return weeks;
}

function createWeeklyLogbook(
  year: number,
  monthIndex: number,
  monthName: string,
  weekIndex: number,
  dateStrings: string[],
  reportsMap: Record<string, DailyReport>
): WeeklyLogbook {
  const startDay = parseInt(dateStrings[0].split("-")[2], 10);
  const endDay = parseInt(dateStrings[dateStrings.length - 1].split("-")[2], 10);

  const titleLabel = startDay === endDay
    ? `LB ${startDay} ${monthName.toUpperCase()}`
    : `LB ${startDay} - ${endDay} ${monthName.toUpperCase()}`;

  const id = `${year}-${String(monthIndex).padStart(2, "0")}-W${weekIndex}`;

  const reports: DailyReport[] = dateStrings.map((dateStr) => {
    if (reportsMap[dateStr]) {
      return reportsMap[dateStr];
    }
    const [y, m, dayNum] = dateStr.split("-").map(Number);
    const d = new Date(y, m - 1, dayNum);
    const isSaturday = d.getDay() === 6;
    return {
      id: dateStr,
      date: dateStr,
      dayName: DAY_NAMES_ID[d.getDay()],
      startTime: "08.00",
      endTime: isSaturday ? "14.00" : "16.00",
      rawTelegramText: "",
      narrative: "",
      createdAt: 0,
      updatedAt: 0,
    };
  });

  const filledReports = reports.filter((r) => r.narrative && r.narrative.trim().length > 0);

  return {
    id,
    monthName,
    year,
    monthIndex,
    weekIndexInMonth: weekIndex,
    titleLabel,
    startDate: dateStrings[0],
    endDate: dateStrings[dateStrings.length - 1],
    reports,
    totalDays: dateStrings.length,
    isComplete: filledReports.length === dateStrings.length,
  };
}
