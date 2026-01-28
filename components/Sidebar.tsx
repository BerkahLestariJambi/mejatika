'use client';
import React, { useState } from 'react';
import { 
  Router, Server, Monitor, Share2, Cable, ShieldCheck, 
  BookOpen, Box, Info, CheckCircle2 
} from 'lucide-react';

interface SidebarProps { activeMode: 'free' | 'bus' | 'mesh'; }

export default function Sidebar({ activeMode }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning'>('inventory');

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Data Materi Edukasi
  const learningMaterial = {
    free: {
      title: "Konsep Dasar Jaringan",
      content: "Jaringan komputer adalah sekumpulan komputer mandiri yang terhubung satu sama lain menggunakan protokol komunikasi.",
      points: ["Router: Menghubungkan antar jaringan (Layer 3)", "Switch: Menghubungkan perangkat dalam satu LAN (Layer 2)", "PC: End-device sebagai client atau server."]
    },
    bus: {
      title: "Topologi Bus",
      content: "Menggunakan satu kabel pusat (backbone) sebagai media transmisi data.",
      points: ["Hemat kabel & mudah diinstal.", "Jika kabel utama putus, seluruh jaringan mati.", "Memerlukan Terminator di ujung kabel untuk mencegah refleksi sinyal."]
    },
    mesh: {
      title: "Topologi Mesh",
      content: "Setiap perangkat terhubung langsung ke setiap perangkat lainnya (Full Mesh).",
      points: ["Tingkat keamanan & redundansi sangat tinggi.", "Jika satu link putus, data punya jalur lain.", "Sangat mahal karena membutuhkan banyak kabel dan port."]
    }
  };

  const components = {
    free: [
      { id: 'router', label: 'Router', icon: <Router size={20} />, color: 'text-blue-500' },
      { id: 'switch', label: 'Switch', icon: <Server size={20} />, color: 'text-emerald-500' },
      { id: 'pc', label: 'Workstation', icon: <Monitor size={20} />, color: 'text-slate-500' },
    ],
    bus: [
      { id: 'bus-backbone', label: 'Backbone', icon: <Cable size={20} />, color: 'text-orange-500' },
      { id: 'pc', label: 'PC Node', icon: <Monitor size={20} />, color: 'text-slate-500' },
      { id: 'terminator', label: 'Terminator', icon: <Box size={20} />, color: 'text-red-600' },
    ],
    mesh: [
      { id: 'mesh-node', label: 'Mesh Node', icon: <Share2 size={20} />, color: 'text-purple-500' },
      { id: 'server', label: 'Server', icon: <Server size={20} />, color: 'text-cyan-500' },
    ]
  };

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-sm print:hidden">
      {/* Tab Switcher */}
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Box size={14} /> Inventory
        </button>
        <button 
          onClick={() => setActiveTab('learning')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'learning' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen size={14} /> Learning
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {activeTab === 'inventory' ? (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 italic">Drag devices to canvas:</h4>
            {components[activeMode].map((item) => (
              <div 
                key={item.id} 
                onDragStart={(e) => onDragStart(e, item.id, item.label)} 
                draggable 
                className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:scale-95"
              >
                <div className={`p-2 rounded-lg bg-slate-50 ${item.color}`}>{item.icon}</div>
                <div className="text-sm font-bold text-slate-700">{item.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Info size={18} />
                <h4 className="font-black text-sm uppercase">{learningMaterial[activeMode].title}</h4>
              </div>
              <p className="text-xs text-blue-900/70 leading-relaxed italic">
                {learningMaterial[activeMode].content}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase">Poin Penting:</h5>
              {learningMaterial[activeMode].points.map((point, i) => (
                <div key={i} className="flex gap-3 items-start bg-white border border-slate-50 p-3 rounded-lg shadow-sm">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-normal">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
