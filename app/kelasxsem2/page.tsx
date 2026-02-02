"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// Memastikan Editor hanya dimuat di browser untuk menghindari crash
const CppEditor = dynamic(() => import("@/components/kelasxsem2/CppEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] border rounded-xl">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="mt-4 text-zinc-500 font-mono">Inisialisasi Compiler...</p>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="min-h-screen bg-[#121212] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">C++</span> 
              Mejatika Online IDE
            </h1>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono italic">
            v1.0.0-stable
          </div>
        </header>

        {/* Hanya Editor C++ Utama */}
        <CppEditor />
        
        <footer className="mt-8 text-center text-[10px] text-zinc-600 font-mono">
          &copy; 2026 Mejatika.com - Berbasis Monaco Editor
        </footer>
      </div>
    </main>
  );
}
