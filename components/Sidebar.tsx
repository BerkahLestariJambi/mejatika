'use client';
import React, { useState } from 'react';
import { Box, BookOpen, ChevronRight, Laptop, Network, Wifi, ShieldCheck, Globe, Cpu } from 'lucide-react';

export default function Sidebar({ activeMode, onSelectLesson }: any) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning'>('inventory');
  // STRUKTUR MATERI BERDASARKAN PDF BAB 4 (Hal. 121-144)
  const curriculumMaterials = [
    {
      id: 'materi_1',
      category: 'Mengenal Jaringan',
      title: 'Definisi & Komponen Jaringan',
      content: 'Jaringan komputer adalah jaringan telekomunikasi antar komputer untuk bertukar data dengan sistem Client-Server.',
      points: [
        'Hardware: NIC (LAN Card), Router, Switch, Modem/ONU, Access Point.',
        'Media Transmisi: Wired (Kabel UTP, Coaxial, Fiber Optic) & Wireless.',
        'Karakteristik LAN: Wilayah sempit, kecepatan tinggi (10-1000 Mbps).'
      ]
    },
    {
      id: 'materi_2',
      category: 'Konfigurasi',
      title: 'Instalasi & Konfigurasi Perangkat',
      content: 'Langkah-langkah menghubungkan perangkat ke jaringan lokal dan internet.',
      points: [
        'IP Address: DHCP (Otomatis) vs Static (Manual).',
        'Konfigurasi AP: Mengatur SSID, Password, dan IP Default perangkat.',
        'Tethering: Berbagi internet ponsel melalui Hotspot, Bluetooth, atau USB.'
      ]
    },
    {
      id: 'materi_3',
      category: 'Keamanan & Internet',
      title: 'Enkripsi & Proteksi Data',
      content: 'Melindungi data saat perangkat terhubung ke jaringan lokal maupun internet.',
      points: [
        'Enkripsi: WPA2 Personal pada Access Point untuk memproteksi akses.',
        'Manfaat Internet: Media komunikasi (Email, Sosmed), E-Commerce, & Riset.',
        'K3L: Perhatikan posisi duduk (90°), cahaya, dan manajemen kabel.'
      ]
    }
  ];

  return (
    <aside className="w-85 border-r bg-white flex flex-col h-full shadow-sm print:hidden">
      {/* TABS */}
      <div className="flex border-b bg-slate-50/50">
        <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400'}`}>Inventory</button>
        <button onClick={() => setActiveTab('learning')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'learning' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400'}`}>Kurikulum Bab 4</button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'inventory' ? (
          <div className="space-y-4">
             {/* Render device icons seperti sebelumnya */}
             <p className="text-[10px] text-slate-400 font-bold uppercase text-center">Tarik Perangkat ke Lab</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-600 p-4 rounded-xl text-white shadow-md mb-4">
               <h3 className="text-xs font-black uppercase tracking-tighter opacity-80">Buku Informatika Kelas X</h3>
               <p className="text-lg font-bold leading-tight">Jaringan Komputer & Internet</p>
            </div>

            <div className="space-y-3">
              {curriculumMaterials.map((mat) => (
                <button 
                  key={mat.id}
                  onClick={() => onSelectLesson(mat)}
                  className="w-full flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all text-left group"
                >
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{mat.category}</span>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-slate-800 text-sm">{mat.title}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER IDENTITAS (Sesuai PDF) */}
      <footer className="p-4 bg-slate-900 text-[10px]">
         <p className="text-slate-500 font-bold uppercase tracking-widest mb-1">Sumber Materi:</p>
         <p className="text-white opacity-80 leading-relaxed">
            Kusmadi, dkk (2022). Buku Informatika SMK Kelas X Semester 1. Kemendikbudristek RI.
         </p>
      </footer>
    </aside>
  );
}
