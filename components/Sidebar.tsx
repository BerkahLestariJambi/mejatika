'use client';
import React, { useState } from 'react';
import { 
  Box, BookOpen, ChevronRight, Laptop, Network, Wifi, 
  ShieldCheck, Globe, Cpu, Smartphone, Server, Radio,
  Activity, Zap, Info
} from 'lucide-react';

export default function Sidebar({ activeMode, onSelectLesson }: any) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning'>('inventory');

  // 1. DAFTAR PERANGKAT (INVENTORY) - Tetap Dipertahankan
  const devices = [
    { type: 'router', label: 'Router', icon: <Network size={22} />, color: 'bg-blue-500' },
    { type: 'switch', label: 'Switch', icon: <Cpu size={22} />, color: 'bg-indigo-500' },
    { type: 'pc', label: 'Komputer PC', icon: <Laptop size={22} />, color: 'bg-slate-700' },
    { type: 'smartphone', label: 'Smartphone', icon: <Smartphone size={22} />, color: 'bg-emerald-500' },
    { type: 'access_point', label: 'Access Point', icon: <Wifi size={22} />, color: 'bg-orange-500' },
    { type: 'server', label: 'Cloud Server', icon: <Server size={22} />, color: 'bg-purple-600' },
    { type: 'modem', label: 'Modem ONU', icon: <Radio size={22} />, color: 'bg-sky-500' },
  ];

  // 2. STRUKTUR MATERI LENGKAP BAB 4
  const curriculumMaterials = [
    {
      id: 'materi_1',
      category: 'Mengenal Jaringan',
      title: 'Definisi & Komponen Jaringan',
      content: 'Jaringan komputer adalah sistem untuk berbagi sumber daya (data/printer) antar perangkat menggunakan protokol komunikasi.',
      points: [
        'Komponen: Server (Penyedia) & Client (Pengguna).',
        'Hardware: NIC (LAN Card), Hub/Switch, Router, & Modem.',
        'Karakteristik LAN: Jangkauan terbatas (Gedung/Rumah), kecepatan tinggi.',
        'Karakteristik WAN: Jangkauan luas (Negara/Benua), butuh Router/Modem.'
      ]
    },
    {
      id: 'materi_2',
      category: 'Topologi',
      title: 'Arsitektur Fisik Jaringan',
      content: 'Cara menghubungkan komputer secara geometris untuk efisiensi distribusi data.',
      points: [
        'Topologi Bus: Satu kabel utama (backbone), hemat kabel tapi rawan putus.',
        'Topologi Star: Menggunakan Hub/Switch sebagai pusat, paling stabil.',
        'Topologi Mesh: Setiap perangkat terhubung satu sama lain, sangat aman.',
        'Media: Kabel (Twisted Pair, Coaxial, Fiber Optic) & Wireless (Radio).'
      ]
    },
    {
      id: 'materi_3',
      category: 'Konfigurasi',
      title: 'Pengalamatan IP & DHCP',
      content: 'Identitas unik setiap perangkat di dalam jaringan agar data terkirim ke tujuan yang benar.',
      points: [
        'IPv4: Terdiri dari 4 oktet angka (Contoh: 192.168.1.1).',
        'DHCP: Layanan pemberian IP secara otomatis dari Router ke Client.',
        'Subnet Mask: Membedakan identitas jaringan (Network ID) dan perangkat (Host ID).',
        'Gateway: Pintu keluar menuju jaringan lain (Internet).'
      ]
    },
    {
      id: 'materi_4',
      category: 'Keamanan',
      title: 'Enkripsi & Proteksi Data',
      content: 'Penerapan protokol keamanan untuk menjaga kerahasiaan data (Confidentiality).',
      points: [
        'Protokol HTTPS: Menggunakan enkripsi SSL/TLS untuk transaksi data aman.',
        'Keamanan Wi-Fi: Penggunaan WPA2/WPA3 untuk memproteksi Access Point.',
        'Firewall: Dinding pembatas untuk menyaring paket data yang mencurigakan.',
        'K3L: Standar kesehatan kerja saat instalasi perangkat jaringan.'
      ]
    }
  ];

  // Fungsi Drag and Drop - Tetap Dipertahankan
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
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('learning')} 
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'learning' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Kurikulum Bab 4
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-[#fafafa]/30">
        {activeTab === 'inventory' ? (
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex items-center gap-2 mb-1">
                 <Activity size={14} className="text-blue-600" />
                 <p className="text-[11px] text-blue-700 font-black leading-tight uppercase">
                   Mode: {activeMode}
                 </p>
               </div>
               <p className="text-[10px] text-blue-500/80 italic font-medium">Tarik perangkat ke Lab untuk simulasi.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {devices.map((device) => (
                <div
                  key={device.type}
                  className="group cursor-grab active:cursor-grabbing p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all flex flex-col items-center text-center relative overflow-hidden"
                  onDragStart={(event) => onDragStart(event, device.type, device.label)}
                  draggable
                >
                  <div className={`p-3 rounded-xl text-white shadow-lg mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-3 ${device.color}`}>
                    {device.icon}
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-700 tracking-tight">{device.label}</span>
                  {/* Dekorasi halus */}
                  <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                    {device.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-1">Mejatika Digital Academy</h3>
                 <p className="text-xl font-black leading-tight tracking-tighter italic">Informatika X</p>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={40}/></div>
            </div>

            <div className="space-y-2">
              {curriculumMaterials.map((mat) => (
                <button 
                  key={mat.id}
                  onClick={() => onSelectLesson(mat)}
                  className="w-full flex flex-col p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all text-left group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{mat.category}</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors">{mat.title}</span>
                    <div className="bg-slate-50 p-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
               <div className="flex items-center gap-2 mb-1 text-amber-700">
                 <Info size={14} />
                 <span className="text-[10px] font-black uppercase">Tips Belajar</span>
               </div>
               <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed italic">
                 "Pahami konsep Client-Server terlebih dahulu sebelum mencoba konfigurasi IP Address."
               </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER IDENTITAS */}
      <footer className="p-5 bg-slate-900 border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">MEJATIKA ENGINE</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-relaxed font-bold italic opacity-80 uppercase tracking-wider">
            Kurikulum Nasional Bab 4 <br/>
            Jaringan Komputer & Internet <br/>
            © 2026 Kemendikbudristek
          </p>
      </footer>
    </aside>
  );
}
