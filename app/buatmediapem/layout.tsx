import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Video Pembelajaran",
  description: "Aplikasi Perekam Layar, Facecam, & Papan Tulis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
