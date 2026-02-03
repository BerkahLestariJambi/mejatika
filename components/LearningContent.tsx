"use client";
import React from 'react';
import { BookOpen, CheckCircle2, Terminal, Shield, Info, ArrowRight } from 'lucide-react';

interface Lesson {
  id: string;
  category: string;
  title: string;
  content: string;
  points: string[];
}

export default function LearningContent({ lesson }: { lesson: Lesson | null }) {
  // Tampilan Welcome (Jika belum ada materi yang dipilih)
  if (!lesson) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Selamat Datang di Mejatika Learning</h2>
        <p className="text-slate-500 max-w-xs mt-2 text-sm leading-relaxed">
          Pilih salah satu modul di <b>Kurikulum Bab 4</b> pada sidebar untuk memulai pembelajaran interaktif.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in slide-in-from-bottom-4 duration-500">
      {/* Badge & Title */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {lesson.category}
          </span>
          <div className="h-[1px] flex-grow bg-slate-100"></div>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-6">
          {lesson.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed font-medium italic border-l-4 border-blue-500 pl-6 py-2 bg-slate-50 rounded-r-xl">
          "{lesson.content}"
        </p>
      </div>

      {/* Konten Utama: Point-Point dari PDF Bab 4 */}
      <div className="space-y-4 mb-12">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Info size={14} /> Key Learning Points
        </h3>
        {lesson.points.map((point, index) => (
          <div 
            key={index} 
            className="group flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-default"
          >
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-slate-700 font-semibold leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      {/* Visualisasi Interaktif Tambahan */}
      {lesson.id === 'materi_1' && (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Terminal size={120} />
          </div>
          <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
             Live Component Info
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="font-bold mb-1 text-sm">Media Transmisi</p>
                <p className="text-xs text-slate-400 italic leading-relaxed">Wired (UTP, Fiber Optic) memberikan kestabilan tinggi untuk LAN.</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="font-bold mb-1 text-sm">Hardware Inti</p>
                <p className="text-xs text-slate-400 italic leading-relaxed">Router & Switch adalah otak dari client-server system.</p>
             </div>
          </div>
        </div>
      )}

      {lesson.id === 'materi_3' && (
        <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg">
            <Shield size={32} />
          </div>
          <div>
            <h4 className="font-black text-rose-900 text-lg tracking-tight mb-1">Proteksi WPA2 Personal</h4>
            <p className="text-sm text-rose-700/80 leading-relaxed font-medium">
              Sesuai kurikulum Bab 4, enkripsi adalah wajib. Mengaktifkan password pada Access Point melindungi data sensitif Mejatika dari serangan interupsi.
            </p>
          </div>
        </div>
      )}

      {/* Next Step / Footer */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">
          Kusmadi, dkk (2022) • Informatika Kelas X
        </p>
        <button className="flex items-center gap-2 text-xs font-black text-blue-600 hover:gap-4 transition-all uppercase tracking-widest">
          Lanjut ke Lab Praktikum <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
