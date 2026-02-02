"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// Menggunakan Dynamic Import dengan SSR disabled
// Ini akan mencegah error build "Array.map" di server Vercel
const LogicLab = dynamic(() => import("@/components/kelasxsem2/LogicLab"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Menyiapkan Laboratorium Mejatika...
      </p>
    </div>
  ),
});

export default function SimulasiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        
        {/* Header Halaman */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary">
            Platform Simulasi Mejatika
          </h1>
          <p className="text-muted-foreground">
            Eksplorasi Elemen Generik Pemrograman Prosedural (Materi Informatika Kelas X)
          </p>
        </div>

        {/* Komponen yang dimuat secara dinamis */}
        <div className="min-h-[500px]">
           <LogicLab />
        </div>

        {/* Footer info sederhana */}
        <footer className="mt-12 py-6 border-t text-center text-xs text-muted-foreground italic">
          &copy; 2026 Mejatika Simulation Platform - Berdasarkan Kurikulum Merdeka 2021
        </footer>
      </div>
    </main>
  );
}
