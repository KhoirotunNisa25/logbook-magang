/**
 * Formatter yang mengubah format chat Telegram menjadi 1 narasi baku,
 * ringkas, dan formal sesuai standar logbook akademik Polinema.
 */

export function cleanTelegramReport(rawText: string): string[] {
  if (!rawText) return [];

  // Hapus salam pembuka & penutup umum
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const ignoredKeywords = [
    /^selamat pagi/i,
    /^selamat siang/i,
    /^selamat sore/i,
    /^halo/i,
    /^assalam/i,
    /^ijin lapor/i,
    /^izin lapor/i,
    /^daily report/i,
    /^laporan harian/i,
    /^report hari ini/i,
    /^today('?s)? task/i,
    /^progress:/i,
    /^done:/i,
    /^terima kasih/i,
    /^sekian/i,
  ];

  const filteredItems: string[] = [];

  for (const line of lines) {
    // Lewati baris header/salam
    if (ignoredKeywords.some((regex) => regex.test(line))) {
      continue;
    }

    // Bersihkan penomoran, bullet, emoji, dan timestamp
    let cleaned = line
      .replace(/^[-*•–—\d\.\)\s]+/g, "") // bullet points & nomor
      .replace(/\[\d{1,2}[:.]\d{2}\s*(-|–|s\/d)?\s*\d{0,2}[:.]?\d{0,2}\]/g, "") // [08.00 - 10.00]
      .replace(/^\d{1,2}[:.]\d{2}\s*(-|–|s\/d)?\s*\d{0,2}[:.]?\d{0,2}\s*[:–-]?\s*/g, "") // 08:00 - 10:00 :
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // emoji
      .trim();

    if (cleaned.length > 3) {
      // Normalisasi kata kerja awal agar formal (misal: "bikin" -> "membuat", "meeting" -> "mengikuti meeting")
      cleaned = normalizeActionVerb(cleaned);
      filteredItems.push(cleaned);
    }
  }

  return filteredItems;
}

function normalizeActionVerb(text: string): string {
  let res = text;
  // Cek kata pertama
  const words = res.split(" ");
  const first = words[0].toLowerCase();

  const replacements: Record<string, string> = {
    "bikin": "Membuat",
    "buat": "Membuat",
    "meeting": "Mengikuti meeting",
    "rapat": "Mengikuti rapat",
    "standup": "Mengikuti daily standup",
    "baca": "Mempelajari",
    "belajar": "Mempelajari",
    "cek": "Melakukan pemeriksaan pada",
    "ngecek": "Melakukan pemeriksaan pada",
    "fix": "Memperbaiki",
    "fixing": "Memperbaiki kendala pada",
    "slicing": "Melakukan slicing antarmuka",
    "testing": "Melakukan pengujian pada",
    "revisi": "Menyelesaikan revisi",
    "deploy": "Melakukan deployment",
    "riset": "Melakukan riset terkait",
    "diskusi": "Melakukan koordinasi dan diskusi mengenai",
    "setup": "Melakukan konfigurasi dan setup",
  };

  if (replacements[first]) {
    words[0] = replacements[first];
    res = words.join(" ");
  } else {
    // Pastikan huruf pertama kapital
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }

  return res.replace(/\.+$/, ""); // hapus titik di ujung item
}

/**
 * Menggabungkan daftar aktivitas menjadi 1 narasi mengalir yang tidak terlalu panjang.
 */
export function formatToNarrative(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return `${items[0]}.`;

  // Hilangkan huruf kapital selain item pertama
  const formattedItems = items.map((item, idx) => {
    if (idx === 0) return item;
    // Lowercase first letter if not acronym
    const firstWord = item.split(" ")[0];
    if (firstWord === firstWord.toUpperCase() && firstWord.length <= 4) {
      return item; // biarkan akronim seperti API, E2E, UI, DB
    }
    return item.charAt(0).toLowerCase() + item.slice(1);
  });

  if (formattedItems.length === 2) {
    return `${formattedItems[0]}, serta ${formattedItems[1]}.`;
  }

  // Jika 3 atau lebih
  const allExceptLastTwo = formattedItems.slice(0, -2);
  const secondLast = formattedItems[formattedItems.length - 2];
  const last = formattedItems[formattedItems.length - 1];

  return `${allExceptLastTwo.join(", ")}, ${secondLast}, serta ${last}.`;
}

export function generateDailyNarrative(rawText: string): string {
  const items = cleanTelegramReport(rawText);
  if (items.length === 0) {
    return rawText.trim();
  }
  return formatToNarrative(items);
}
