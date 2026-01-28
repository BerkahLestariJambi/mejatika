'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import { 
  ShieldCheck, X, ChevronRight, Cpu, Network, Server, Router as RouterIcon, Wifi, Radio, Globe 
} from 'lucide-react';

// Mapping Data Visual untuk Level 3
const deviceDetails: Record<string, { icon: any, color: string, img: string }> = {
  "NIC (LAN Card)": { icon: <Cpu size={40} />, color: "bg-blue-600", img: "Network Interface Card" },
  "Router": { icon: <RouterIcon size={40} />, color: "bg-purple-600", img: "Enterprise Router" },
  "Switch": { icon: <Server size={40} />, color: "bg-emerald-600", img: "Network Switch" },
  "Modem/ONU": { icon: <Globe size={40} />, color: "bg-orange-600", img: "Modem Device" },
  "Access Point": { icon: <Wifi size={40} />, color: "bg-rose-600", img: "Wireless Access Point" },
};

function NetworkLabContent() {
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-20 shrink-0">
        <div className="flex items-center gap-3 text-left">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="text-sm font-black text-slate-800 uppercase italic leading-none">SANPIO LAB</h1>
            <p className="text-[9px] text-blue-600 font-bold uppercase mt-1 tracking-widest">Hardware Catalog v2</p>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar onSelectLesson={(lesson: any) => {
          setActiveLesson(lesson);
          setSelectedPoint(null);
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]">
          <ReactFlow nodes={[]} edges={[]}>
            <Background gap={30} size={1} color="#cbd5e1" />
            
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-6 z-50">
                <div className="flex items-start gap-0">
                  
                  {/* LEVEL 1: MODAL UTAMA (HITAM) */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[320px] shrink-0 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                      <span className="text-[9px] font-black text-blue-400 uppercase italic tracking-widest italic">Katalog Perangkat</span>
                      <button onClick={() => setActiveLesson(null)} className="text-white/50 hover:text-white transition-colors"><X size={16}/></button>
                    </div>
                    <div className="p-6">
                      <h2 className="text-white text-lg font-black uppercase italic mb-2 tracking-tighter leading-none">{activeLesson.title}</h2>
                      <p className="text-[11px] text-slate-400 font-medium italic opacity-70 mb-6 leading-relaxed">"{activeLesson.content}"</p>
                      
                      {/* LEVEL 2: DAFTAR TOMBOL POIN */}
                      <div className="space-y-2">
                        {activeLesson.points?.map((p: string, i: number) => {
                          const name = p.split(':')[0].trim();
                          const isSelected = selectedPoint?.name === name;
                          return (
                            <button 
                              key={i}
                              onClick={() => setSelectedPoint({ name, desc: p.split(':')[1] || "Penjelasan mendalam perangkat jaringan." })}
                              className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase italic
                                ${isSelected ? 'bg-blue-600 border-blue-400 text-white translate-x-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-5 h-5 rounded flex items-center justify-center text-[8px] ${isSelected ? 'bg-white text-blue-600' : 'bg-white/10 text-white'}`}>{i+1}</span>
                                {name}
                              </div>
                              <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-0' : '-rotate-90 opacity-0'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 3: KARTU DETAIL DENGAN GAMBAR/IKON SPESIFIK */}
                  {selectedPoint && (
                    <div className="flex items-center">
                      {/* Garis Koneksi Dinamis */}
                      <div className="w-16 h-[2px] bg-blue-500 shadow-[0_0_20px_#3b82f6] self-center shrink-0 animate-in slide-in-from-left duration-300" />
                      
                      {/* Kartu Detail Putih */}
                      <div className="bg-white border-2 border-blue-600 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[3rem] w-[380px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-500">
                        
                        {/* Area Visual (Gambar Mengikuti Nama Perangkat) */}
                        <div className={`h-48 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${deviceDetails[selectedPoint.name]?.color || 'bg-slate-800'}`}>
                           {/* Background Decorative Pattern */}
                           <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
                              {Array.from({length: 20}).map((_, idx) => <Network key={idx} size={40} />)}
                           </div>
                           
                           {/* Ikon Utama Perangkat */}
                           <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl z-10 animate-bounce-subtle flex items-center justify-center text-blue-600">
                              {deviceDetails[selectedPoint.name]?.icon || <Cpu size={48} />}
                           </div>
                           <span className="mt-4 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] z-10">Hardware Reference</span>
                        </div>
                        
                        <div className="p-8 text-left">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-10 bg-blue-600 rounded-full" />
                            <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Technical Specs</span>
                          </div>
                          
                          <h3 className="text-3xl font-black text-slate-800 uppercase italic mb-4 tracking-tighter leading-none">
                            {selectedPoint.name}
                          </h3>
                          
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 relative">
                            <p className="text-[12px] font-bold text-slate-500 leading-relaxed italic relative z-10">
                              "{selectedPoint.desc}"
                            </p>
                            <div className="absolute bottom-2 right-4 text-slate-200 uppercase font-black text-[24px] italic select-none">DATA</div>
                          </div>
                          
                          <button className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group">
                             Implementasi ke Topologi
                             <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                        <div className="bg-slate-50 py-3 border-t border-slate-100 flex justify-center">
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.6em]">Informatika SMK - XII</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <style jsx>{`
                  @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                  .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
                `}</style>
              </Panel>
            )}
            
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() {
  return (
    <ReactFlowProvider>
      <NetworkLabContent />
    </ReactFlowProvider>
  );
}
