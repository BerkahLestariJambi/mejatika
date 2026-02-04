// src/components/story-designer/Player.tsx
'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Bookmark, PlayCircle } from 'lucide-react';

export default function Player({ activeSlide, totalSlides, onNext, onBack, onExit }: any) {
  // Shortcut Keyboard untuk navigasi seperti nonton film
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onBack();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onBack, onExit]);

  if (!activeSlide) return null;

  const progress = ((activeSlide.index + 1) / totalSlides) * 100;

  return (
    <>
      {/* 1. CINEMATIC OVERLAY (Vignette) */}
      <div className="fixed inset-0 pointer-events-none z-[90] bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.4)_100%)]" />

      <div className="absolute inset-x-0 bottom-8 z-[100] flex flex-col items-center px-6 pointer-events-none">
        
        {/* 2. PROGRESS BAR DENGAN GLOW */}
        <div className="w-full max-w-2xl mb-6 h-2 bg-black/20 backdrop-blur-md rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(249,115,22,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 3. SLIDE CARD (Naskah Animasi) */}
        <div className="bg-white/95 backdrop-blur-2xl w-full max-w-4xl p-8 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white pointer-events-auto animate-in slide-in-from-bottom-12 duration-700 ease-out">
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-200 animate-pulse">
                <PlayCircle size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-600 mb-1 tracking-[0.3em] uppercase">
                  Scene {activeSlide.index + 1} / {totalSlides}
                </p>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {activeSlide.title}
                </h2>
              </div>
            </div>
            
            <button 
              onClick={onExit}
              className="group p-3 bg-slate-100 text-slate-400 hover:text-white hover:bg-red-500 rounded-full transition-all duration-300"
              title="Keluar (Esc)"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* AREA TEKS MATERI (Naskah Sutradara) */}
          <div className="relative mb-10">
            <span className="absolute -left-4 top-0 text-6xl text-orange-100 font-serif leading-none select-none">“</span>
            <p className="text-slate-700 text-xl md:text-2xl leading-relaxed font-medium pl-4">
              {activeSlide.desc || "Tidak ada penjelasan untuk scene ini..."}
            </p>
          </div>

          {/* NAVIGASI UTAMA */}
          <div className="flex gap-4">
            <button 
              onClick={onBack}
              disabled={activeSlide.index === 0}
              className="flex-1 py-5 bg-slate-100 rounded-3xl font-black text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all flex items-center justify-center gap-2 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1"
            >
              <ChevronLeft size={20} /> KEMBALI
            </button>
            
            <button 
              onClick={onNext}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-sm hover:bg-orange-600 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-2 border-b-4 border-black active:border-b-0 active:translate-y-1 group"
            >
              {activeSlide.index === totalSlides - 1 ? 'SELESAI & TUTUP' : 'SCENE BERIKUTNYA'} 
              <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* PETUNJUK KEYBOARD */}
        <p className="mt-4 text-white/50 text-[9px] font-bold tracking-widest uppercase pointer-events-none">
          Gunakan <span className="text-white">← Panah Kiri</span> atau <span className="text-white">Panah Kanan →</span> untuk navigasi cepat
        </p>
      </div>
    </>
  );
}
