'use client';
import React, { useState } from 'react';
import { 
  Box, BookOpen, ChevronRight, Laptop, Network, Wifi, 
  ShieldCheck, Globe, Cpu, Smartphone, Server, Radio
} from 'lucide-react';

export default function Sidebar({ activeMode, onSelectLesson }: any) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning'>('inventory');

  // 1. DAFTAR PERANGKAT (INVENTORY)
  const devices = [
    { type: 'router', label: 'Router', icon: <Network size={22} />, color: 'bg-blue-500' },
    { type: 'switch', label: 'Switch', icon: <Cpu size={22} />, color: 'bg-indigo-500' },
    { type: 'pc', label: 'Komputer PC', icon: <Laptop size={22} />, color: 'bg-slate-700' },
    { type: 'smartphone', label: 'Smartphone', icon: <Smartphone size={22} />, color: 'bg-emerald-500' },
    { type: 'access_point', label: 'Access Point', icon: <Wifi size={22} />, color: 'bg-orange-500' },
    { type: 'server', label: 'Cloud Server', icon: <Server size={22} />, color: 'bg-purple-600' },
    { type: 'modem', label: 'Modem ONU', icon: <Radio size={22} />, color: 'bg-sky-500' },
  ];

  // 2. STRUKTUR MATERI BERDASARKAN PDF BAB 4
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

  // Fungsi Drag and Drop
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-sm print:hidden">
      {/* TABS HEADER */}
      <div className="flex border-b bg-slate-50/50">
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('learning')} 
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'learning' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400'}`}
        >
          Kurikulum Bab 4
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'inventory' ? (
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
               <p className="text-[11px] text-blue-700 font-bold leading-tight uppercase">
                 Mode Aktif: <span className="text-blue-900">{activeMode}</span>
               </p>
               <p className="text-[10px] text-blue-500 mt-1 italic">Tarik ikon ke area kerja untuk mulai simulasi</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {devices.map((device) => (
                <div
                  key={device.type}
                  className="group cursor-grab active:cursor-grabbing p-3 rounded-xl border-2 border-slate-100 bg-white hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center"
                  onDragStart={(event) => onDragStart(event, device.type, device.label)}
                  draggable
                >
                  <div className={`p-3 rounded-xl text-white shadow-sm mb-2 transition-transform group-hover:scale-110 ${device.color}`}>
                    {device.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{device.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white shadow-md">
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">E-Modul Siswa</h3>
               <p className="text-lg font-bold leading-tight italic">Informatika Kelas X</p>
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

      {/* FOOTER IDENTITAS */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800">
         <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mejatika V2</span>
         </div>
         <p className="text-white text-[9px] opacity-60 leading-relaxed font-medium">
            Materi: Bab 4 Jaringan Komputer & Internet <br/>
            Kusmadi, dkk (2022) © Kemendikbudristek RI
         </p>
      </footer>
    </aside>
  );
}
