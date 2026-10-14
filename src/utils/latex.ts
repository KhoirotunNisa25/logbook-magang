import { StudentProfile, WeeklyLogbook } from "@/types";
import { formatDateIndo } from "./date";

export function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function generateLatexSource(profile: StudentProfile, logbook: WeeklyLogbook): string {
  let page1Reports: typeof logbook.reports = [];
  let page2Reports: typeof logbook.reports = [];

  if (logbook.reports.length <= 3) {
    page1Reports = logbook.reports;
    page2Reports = [];
  } else if (logbook.reports.length === 6) {
    page1Reports = logbook.reports.slice(0, 5);
    page2Reports = logbook.reports.slice(5);
  } else if (logbook.reports.length === 5) {
    page1Reports = logbook.reports.slice(0, 3);
    page2Reports = logbook.reports.slice(3);
  } else {
    // 4 reports
    page1Reports = logbook.reports.slice(0, 2);
    page2Reports = logbook.reports.slice(2);
  }

  const renderTableRows = (reports: typeof logbook.reports) => {
    return reports
      .map((r) => {
        const formattedDate = formatDateIndo(r.date);
        const dayPart = formattedDate.split(", ")[0];
        const datePart = formattedDate.split(", ")[1] || "";
        const dateCell = `\\centering ${escapeLatex(dayPart)}, \\\\ ${escapeLatex(datePart)}`;
        const startCell = `\\centering ${escapeLatex(r.startTime || "08.00")}`;
        const endCell = `\\centering ${escapeLatex(r.endTime || (r.dayName === "Sabtu" ? "14.00" : "16.00"))}`;
        const narrativeCell = escapeLatex(r.narrative || "-");

        return `${dateCell} & ${startCell} & ${endCell} & ${narrativeCell} \\tabularnewline\n\\hline`;
      })
      .join("\n");
  };

  const page1Content = renderTableRows(page1Reports);
  const page2Content = page2Reports.length > 0 ? renderTableRows(page2Reports) : "";

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage{times}
\\usepackage{graphicx}

% --- Ukuran Kertas & Margin A4 Standar Polinema ---
\\setlength{\\paperwidth}{210mm}
\\setlength{\\paperheight}{297mm}
\\setlength{\\topmargin}{-18mm}
\\setlength{\\headheight}{32mm}
\\setlength{\\headsep}{6mm}
\\setlength{\\textheight}{245mm}
\\setlength{\\textwidth}{165mm}
\\setlength{\\oddsidemargin}{-3mm}
\\setlength{\\evensidemargin}{-3mm}
\\setlength{\\footskip}{0mm}
\\setlength{\\parindent}{0pt}

% --- Kop Surat Polinema pada Header Tiap Halaman ---
\\makeatletter
\\def\\ps@polinema{%
  \\def\\@oddhead{%
    \\vbox to \\headheight{%
      \\hbox to \\textwidth{%
        \\parbox[c]{2.3cm}{\\includegraphics[width=2.2cm]{logo_polinema.jpg}}%
        \\hfill
        \\parbox[c]{14cm}{\\centering
          {\\fontsize{11}{13}\\selectfont\\textbf{KEMENTERIAN PENDIDIKAN TINGGI, SAINS,\\\\[1pt]
          DAN TEKNOLOGI}}\\\\[2pt]
          {\\fontsize{12}{14}\\selectfont\\textbf{POLITEKNIK NEGERI MALANG}}\\\\[2pt]
          {\\fontsize{11}{13}\\selectfont\\textbf{JURUSAN TEKNOLOGI INFORMASI}}\\\\[2pt]
          {\\fontsize{8.5}{10.5}\\selectfont Jalan Soekarno Hatta Nomor 9, Jatimulyo, Lowokwaru, Malang 65141\\\\[1pt]
          Telepon (0341) 404424, 404425, Faksimile (0341) 404420\\\\[1pt]
          Laman www.polinema.ac.id}
        }%
      }%
      \\vspace{2mm}%
      \\hrule height 1.5pt
      \\vss
    }%
  }%
  \\def\\@evenhead{\\@oddhead}%
  \\def\\@oddfoot{}%
  \\def\\@evenfoot{}%
}
\\let\\ps@plain\\ps@polinema
\\makeatother

\\pagestyle{polinema}

% --- Parameter Data Magang ---
\\newcommand{\\VarNama}{${escapeLatex(profile.nama)}}
\\newcommand{\\VarNIM}{${escapeLatex(profile.nim)}}
\\newcommand{\\VarProdi}{${escapeLatex(profile.prodi)}}
\\newcommand{\\VarMitra}{${escapeLatex(profile.mitra)}}
\\newcommand{\\VarDospem}{${escapeLatex(profile.dosenPembimbing)}}
\\newcommand{\\VarPembimbingLap}{${escapeLatex(profile.pembimbingLapangan)}}

\\begin{document}

\\begin{center}
  \\vspace*{2mm}
  {\\fontsize{11}{13}\\selectfont\\textbf{LOG BOOK KEGIATAN PROGRAM MAGANG INDUSTRI}}
\\end{center}
\\vspace{3mm}

\\begin{tabular}{@{}ll@{}}
  \\textbf{Nama} & : \\VarNama \\\\
  \\textbf{NIM} & : \\VarNIM \\\\
  \\textbf{Program Studi} & : \\VarProdi \\\\
  \\textbf{Nama Mitra Industri} & : \\VarMitra \\\\
\\end{tabular}

\\vspace{5mm}

% --- Tabel Kegiatan (Halaman 1) ---
\\renewcommand{\\arraystretch}{1.35}
\\noindent\\begin{tabular}{|p{2.6cm}|p{1.7cm}|p{1.7cm}|p{8.7cm}|}
\\hline
\\centering\\textbf{Hari, Tanggal} & \\centering\\textbf{Jam Masuk} & \\centering\\textbf{Jam Pulang} & \\centering\\textbf{Kegiatan} \\tabularnewline
\\hline
${page1Content}
\\end{tabular}

${
  page2Reports.length > 0
    ? `\\clearpage

% --- Tabel Kegiatan (Halaman 2) ---
\\renewcommand{\\arraystretch}{1.35}
\\noindent\\begin{tabular}{|p{2.6cm}|p{1.7cm}|p{1.7cm}|p{8.7cm}|}
\\hline
\\centering\\textbf{Hari, Tanggal} & \\centering\\textbf{Jam Masuk} & \\centering\\textbf{Jam Pulang} & \\centering\\textbf{Kegiatan} \\tabularnewline
\\hline
${page2Content}
\\end{tabular}`
    : ""
}

\\vspace{1.5cm}

% --- Tanda Tangan Mahasiswa ---
\\hfill
\\begin{minipage}{0.4\\textwidth}
  \\centering
  Mahasiswa,\\\\[1.8cm]
  \\textbf{\\VarNama.}
\\end{minipage}

\\vspace{1cm}

% --- Tanda Tangan Mengetahui Dosen & Pembimbing Lapangan ---
\\begin{center}
  \\textbf{Mengetahui,}
\\end{center}

\\vspace{2mm}

\\noindent
\\begin{minipage}[t]{0.48\\textwidth}
  \\centering
  Dosen Pembimbing,\\\\[1.8cm]
  \\textbf{\\VarDospem}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
  \\centering
  Pembimbing Lapangan,\\\\[1.8cm]
  \\textbf{\\VarPembimbingLap}
\\end{minipage}

\\end{document}
`;
}
