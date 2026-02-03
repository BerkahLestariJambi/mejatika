'use client';
import React, { useState } from 'react';
import { 
  Box, BookOpen, ChevronRight, Laptop, Network, Wifi, 
  ShieldCheck, Globe, Cpu, Smartphone, Server, Radio,
  Activity, Zap, Info, Terminal, Shield, HelpCircle
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

  // 2. STRUKTUR MATERI LENGKAP (BERDASARKAN PRESENTASI JANTUNG KEHIDUPAN DIGITAL)
  const curriculumMaterials = [
    {
      id: 'materi_1',
      category: 'The Hook',
      title: 'Krisis 60 Menit Tanpa Internet',
      icon: <Globe size={18} />,
      content: 'Analisis dampak global jika konektivitas hilang: Perbankan berhenti, koordinasi pesawat kacau, dan isolasi informasi massal.',
      points: [
        'Finansial: Transaksi senilai $2.1 Miliar terhenti seketika.',
        'Logistik: Rantai pasok dunia macet tanpa navigasi digital.',
        'Analogi: Data (Barang), IP (Alamat), Protokol (Kendaraan), Fisik (Jalan).'
      ]
    },
    {
      id: 'materi_2',
      category: 'Arsitektur',
      title: 'Anatomi & Kasta Jaringan',
      icon: <Cpu size={18} />,
      content: 'Klasifikasi jaringan berdasarkan cakupan geografis (PAN, LAN, MAN, WAN) dan cara perangkat terhubung.',
      points: [
        'Hardware: Switch (Layer 2 - MAC Address) & Router (Layer 3 - IP Path).',
        'Topologi Star: Paling stabil, jika satu kabel putus yang lain tetap aman.',
        'Topologi Mesh: Semua terhubung ke semua, digunakan pada infrastruktur kritis.'
      ]
    },
    {
      id: 'materi_3',
      category: 'Protokol',
      title: 'Live Terminal & OSI Layer',
      icon: <Terminal size={18} />,
      content: 'Memahami bahasa komputer melalui model lapisan, dari urusan kabel hingga aplikasi yang kita lihat.',
      points: [
        'Network Layer: Mengatur rute dan alamat logis (IP Address).',
        'Cek IP: Gunakan perintah "ipconfig" untuk melihat identitas digital perangkat.',
        'Transport: Memastikan data sampai utuh (TCP) atau cepat (UDP).'
      ]
    },
    {
      id: 'materi_4',
      category: 'Keamanan',
      title: 'Penjaga Gerbang Digital',
      icon: <Shield size={18} />,
      content: 'Melindungi data agar tidak seperti rumah tanpa pintu menggunakan enkripsi dan filter akses.',
      points: [
        'HTTP vs HTTPS: HTTPS ibarat mengirim surat di dalam brankas baja terkunci.',
        'Firewall & VPN: Filter paket mencurigakan dan terowongan rahasia di jaringan publik.',
        'Rain Fade: Mengapa internet lambat saat hujan? (Gangguan partikel air pada sinyal radio).'
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
               <div className="absolute top-0 right-0 p-4 opacity-20"><BookOpen size={40}/></div>
            </div>

            <div className="space-y-2">
              {curriculumMaterials.map((mat) => (
                <button 
                  key={mat.id}
                  onClick={() => onSelectLesson(mat)}
                  className="w-full flex flex-col p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all text-left group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-blue-500 group-hover:scale-110 transition-transform">
                      {mat.icon}
                    </div>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{mat.category}</span>
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
                 <span className="text-[10px] font-black uppercase tracking-tighter">Case Study FAQ</span>
               </div>
               <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed italic">
                 "Apa beda IP Public & Private? Private ibarat nomor kamar hotel, Public ibarat alamat gedung hotelnya."
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
