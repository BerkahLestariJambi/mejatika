"use client";

import LogicLab from "@/components/kelasxsem2/LogicLab";

export default function SimulasiPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Container utama dengan padding agar rapi di desktop dan mobile */}
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

        {/* Memanggil Komponen Utama Lab */}
        <LogicLab />

        {/* Footer info sederhana */}
        <footer className="mt-12 py-6 border-t text-center text-xs text-muted-foreground italic">
          &copy; 2026 Mejatika Simulation Platform - Berdasarkan Kurikulum Merdeka 2021
        </footer>
      </div>
    </main>
  );
}
