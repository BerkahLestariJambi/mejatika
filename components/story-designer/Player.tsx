import React from 'react';
import { ChevronLeft, ChevronRight, X, Bookmark } from 'lucide-react';

export default function Player({ activeSlide, totalSlides, onNext, onBack, onExit }: any) {
  if (!activeSlide) return null;

  const progress = ((activeSlide.index + 1) / totalSlides) * 100;

  return (
    <div className="absolute inset-x-0 bottom-8 z-[100] flex flex-col items-center px-6 pointer-events-none">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-4 h-1.5 bg-white/30 backdrop-blur-md rounded-full overflow-hidden border border-white/20 shadow-lg">
        <div 
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide Card */}
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-3xl p-8 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.25)] border border-white pointer-events-auto animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
              <Bookmark size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                {activeSlide.title}
              </h2>
              <p className="text-[10px] font-black text-orange-500 mt-1 tracking-[0.2em]">
                BAGIAN {activeSlide.index + 1} DARI {totalSlides}
              </p>
            </div>
          </div>
          <button 
            onClick={onExit}
            className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium italic">
          "{activeSlide.desc}"
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onBack}
            disabled={activeSlide.index === 0}
            className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} /> KEMBALI
          </button>
          <button 
            onClick={onNext}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {activeSlide.index === totalSlides - 1 ? 'SELESAI' : 'LANJUTKAN MATERI'} 
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
