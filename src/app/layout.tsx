import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Logbook Magang Industri - Polinema",
  description: "Monitoring report harian dan generator logbook mingguan magang industri Polinema",
  icons: {
    icon: "/logo_polinema.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
