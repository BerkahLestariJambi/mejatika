'use client';
import React, { useState } from 'react';
import { Box, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Sidebar({ activeMode, onSelectLesson }: any) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning'>('inventory');

  const learningMaterial = {
    free: {
      title: "Jaringan Dasar",
      content: "Sistem yang terdiri dari komputer dan perangkat jaringan lainnya yang bekerja bersama untuk mencapai tujuan yang sama.",
      points: ["Sharing resources (data, printer)", "Komunikasi (email, chatting)", "Keamanan data (firewall)"]
    },
    bus: {
      title: "Arsitektur Bus",
      content: "Topologi di mana semua simpul dihubungkan dengan kabel tunggal yang disebut segmen.",
      points: ["Menggunakan kabel Coaxial", "Sinyal berjalan dua arah", "Rawan tabrakan data (collision)"]
    },
    mesh: {
      title: "Mekanisme Mesh",
      content: "Hubungan antar perangkat yang menyediakan banyak jalur untuk pengiriman data.",
      points: ["Dedicated link untuk tiap node", "Fault tolerance tinggi", "Konfigurasi rumit"]
    }
  };

  // ... (Data components sama seperti sebelumnya) ...

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-sm">
      <div className="flex border-b">
        <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Inventory</button>
        <button onClick={() => setActiveTab('learning')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'learning' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Learning</button>
      </div>

      <div className="p-4 overflow-y-auto flex-grow">
        {activeTab === 'inventory' ? (
           // ... (Render Inventory seperti sebelumnya) ...
           <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-tighter">Drag to canvas</p>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-tighter italic underline decoration-blue-500 decoration-2">Klik untuk baca materi:</p>
            <button 
              onClick={() => onSelectLesson(learningMaterial[activeMode])}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-blue-100 bg-blue-50/30 hover:bg-blue-600 hover:text-white group transition-all text-left"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black opacity-60 uppercase mb-1">Materi Utama</span>
                <span className="font-bold text-sm tracking-tight">{learningMaterial[activeMode].title}</span>
              </div>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
      {/* FOOTER TETAP DISINI */}
    </aside>
  );
}
