"use client";

import dynamic from 'next/dynamic';
import { Loader2, Code2, Zap } from "lucide-react";

// Helper untuk Loading State
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 border rounded-xl bg-card/50">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
  </div>
);

// Import Komponen secara Dinamis (SSR Disabled untuk mencegah error build Vercel)
const LogicLab = dynamic(() => import("@/components/kelasxsem2/LogicLab"), {
  ssr: false,
  loading: () => <LoadingState message="Menyiapkan Laboratorium Interaktif..." />,
});

const CppEditor = dynamic(() => import("@/components/kelasxsem2/CppEditor"), {
  ssr: false,
  loading: () => <LoadingState message="Menyiapkan Editor Kode C++..." />,
});

export default function SimulasiPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        
        {/* Header Halaman */}
        <div className="mb-10 space-y-2 border-b pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary flex items-center gap-3">
            Mejatika Learning Center
          </h1>
          <p className="text-muted-foreground text-lg">
            Materi Informatika Kelas X Semester 2: Elemen Generik Pemrograman Prosedural
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          
          {/* SECTION 1: EDITOR TEKSTUAL (Mirip online-cpp.com) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Code2 className="text-blue-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">C++ Online Compiler</h2>
                <p className="text-xs text-muted-foreground">Tulis dan uji kode C++ kamu di sini</p>
              </div>
            </div>
            <CppEditor />
          </section>

          {/* SECTION 2: LAB SIMULASI INTERAKTIF */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Zap className="text-yellow-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Laboratorium Visual</h2>
                <p className="text-xs text-muted-foreground">Eksperimen variabel, ekspresi, dan struktur kontrol secara visual</p>
              </div>
            </div>
            <LogicLab />
          </section>

        </div>

        {/* Footer info sederhana */}
        <footer className="mt-20 py-8 border-t text-center space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            &copy; 2026 Mejatika Simulation Platform
          </p>
          <p className="text-[10px] text-zinc-500 italic">
            Developed for Educational Purposes - Kurikulum Merdeka 2021
          </p>
        </footer>
      </div>
    </main>
  );
}
