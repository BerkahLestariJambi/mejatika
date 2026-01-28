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
import DeviceNode from '@/components/DeviceNode';
import { 
  ShieldCheck, X, ChevronRight, Cpu, Network, LayoutGrid, Share2, Info
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  
  // State Materi: Kita buat agar langsung menampilkan daftar item saat lesson dipilih
  const [activeLesson, setActiveLesson] = useState<any>(null);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none italic">SANPIO LAB</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">Waterfall Theory Mode</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar onSelectLesson={(lesson: any) => setActiveLesson(lesson)} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                <div className="flex items-center gap-0 pointer-events-auto overflow-x-auto pb-10 max-w-[90vw]">
                  
                  {/* LEVEL 1: KARTU INDUK (GAYA DARK) */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[260px] shrink-0 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                      <span className="text-[8px] font-black text-blue-400 uppercase italic">Akar Materi</span>
                      <button onClick={() => setActiveLesson(null)} className="text-white/50 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="p-5">
                      <h2 className="text-white text-base font-black uppercase italic mb-2 leading-tight tracking-tighter">{activeLesson.title}</h2>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic opacity-80">"{activeLesson.content}"</p>
                      <div className="mt-4 flex items-center gap-2 text-blue-400">
                        <div className="h-[1px] flex-grow bg-blue-500/30"></div>
                        <span className="text-[8px] font-black uppercase">Struktur Komponen</span>
                        <div className="h-[1px] flex-grow bg-blue-500/30"></div>
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2 & 3: MELEDAK KE KANAN (Otomatis Muncul Berjejer) */}
                  <div className="flex items-center shrink-0">
                    {activeLesson.points?.map((p: string, i: number) => {
                      const title = p.split(':')[0];
                      const desc = p.split(':')[1] || "Penjelasan mendalam mengenai arsitektur perangkat ini.";
                      
                      return (
                        <div key={i} className="flex items-center shrink-0">
                          {/* Garis Penghubung antar kartu */}
                          <div className="w-12 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 200}ms` }} />
                          
                          {/* Kartu Detail (Level 3 Gaya Putih yang Anda Suka) */}
                          <div 
                            style={{ animationDelay: `${i * 200}ms` }}
                            className="bg-white border-2 border-slate-200 shadow-xl rounded-[2.5rem] w-[280px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-700"
                          >
                            {/* Header Ikon */}
                            <div className="h-24 bg-slate-50 flex items-center justify-center border-b relative">
                               <div className="bg-white p-4 rounded-3xl shadow-lg border border-blue-50 animate-bounce-subtle">
                                  <Cpu size={32} className="text-blue-600" />
                               </div>
                               <div className="absolute top-3 right-5 text-[20px] font-black text-slate-100 italic select-none">0{i+1}</div>
                            </div>
                            
                            {/* Konten Detail */}
                            <div className="p-6">
                              <span className="bg-blue-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Ensiklopedia</span>
                              <h3 className="text-lg font-black text-slate-800 uppercase italic mt-2 mb-2 tracking-tighter leading-none">{title}</h3>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[80px]">
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"{desc}"</p>
                              </div>
                              <button className="mt-4 w-full py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95">
                                Implementasi <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                <style jsx>{`
                  @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                  .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
                  /* Efek Garis Tumbuh */
                  @keyframes line-grow { from { width: 0; opacity: 0; } to { width: 48px; opacity: 1; } }
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
