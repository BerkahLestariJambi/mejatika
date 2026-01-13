import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

// Import Komponen Penting
import { Header } from "@/components/header" // Ini Slider Gambar Pecah-Kotak Anda
import { Navigation } from "@/components/navigation" // Ini Menu Navigasi Anda
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "MEJATIKA",
  description: "MEDIA BELAJAR INFORMATIKA - Platform Pembelajaran Digital",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        
        {/* 1. SLIDER (HEADER): Sekarang akan muncul di semua halaman */}
        <Header />

        {/* 2. NAVIGASI: Tetap muncul di bawah slider di semua halaman */}
        <Navigation />

        {/* 3. KONTEN HALAMAN: Berubah-ubah sesuai menu yang diklik */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 4. FOOTER: Selalu muncul di paling bawah */}
        <Footer />

      </body>
    </html>
  )
}
