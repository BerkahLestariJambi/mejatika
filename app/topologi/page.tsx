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
  ShieldCheck, X, ChevronRight, Cpu, LayoutGrid, Share2, Network 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  
  // States untuk kontrol hirarki
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [showLevel2, setShowLevel2] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => {}}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none italic">SANPIO LAB</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">Interactive Learning Mode</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar onSelectLesson={(lesson: any) => {
          setActiveLesson(lesson);
          setShowLevel2(false);
          setSelectedPoint(null);
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                <div className="flex items-start gap-0 pointer-events-auto overflow-x-auto pb-10 max-w-[95vw]">
                  
                  {/* LEVEL 1: KARTU INDUK (HITAM) */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[250px] shrink-0 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                      <span className="text-[8px] font-black text-blue-400 uppercase italic">Akar Materi</span>
                      <button onClick={() => setActiveLesson(null)} className="text-white/50 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="p-5">
                      <h2 className="text-white text-sm font-black uppercase italic mb-2 leading-tight">{activeLesson.title}</h2>
                      <p className="text-[10px] text-slate-400 font-medium mb-4 leading-relaxed line-clamp-3 italic opacity-80">"{activeLesson.content}"</p>
                      
                      <button 
                        onClick={() => { setShowLevel2(!showLevel2); setSelectedPoint(null); }}
                        className={`w-full py-2.5 rounded-xl border-2 font-black text-[9px] uppercase tracking-tighter transition-all flex items-center justify-center gap-2
                          ${showLevel2 ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10'}`}
                      >
                        {showLevel2 ? 'Tutup Struktur' : 'Lihat Struktur'} <ChevronRight size={14} className={showLevel2 ? 'rotate-90' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* LEVEL 2: DAFTAR KOMPONEN (BERJEJER KE KANAN) */}
                  {showLevel2 && (
                    <div className="flex items-center">
                      <div className="w-12 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] shrink-0" />
                      <div className="flex flex-col gap-3">
                        {activeLesson.points?.map((p: string, i: number) => {
                          const title = p.split(':')[0];
                          const desc = p.split(':')[1] || "Klik untuk detail...";
                          return (
                            <div key={i} className="flex items-center">
                              <div className="w-4 h-[2px] bg-blue-400/50 shrink-0" />
                              <button 
                                onClick={() => setSelectedPoint({ title, desc })}
                                style={{ animationDelay: `${i * 100}ms` }}
                                className={`w-[200px] flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 animate-in slide-in-from-left-4 fade-in fill-mode-backwards
                                  ${selectedPoint?.title === title ? 'bg-blue-600 border-blue-400 text-white shadow-lg -translate-y-1' : 'bg-white border-slate-100 hover:border-blue-400 text-slate-700 shadow-sm'}`}
                              >
                                <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] ${selectedPoint?.title === title ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-500'}`}>{i+1}</div>
                                <span className="text-[9px] font-black uppercase text-left leading-tight truncate">{title}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LEVEL 3: DETAIL LENGKAP (MUNCUL DI PALING KANAN) */}
                  {selectedPoint && (
                    <div className="flex items-center shrink-0">
                      <div className="w-12 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] self-center shrink-0 animate-in slide-in-from-left duration-300" />
                      <div className="bg-white border-2 border-blue-600 shadow-2xl rounded-[2.5rem] w-[300px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-500">
                        <div className="h-32 bg-slate-50 flex items-center justify-center border-b relative">
                           <div className="bg-white p-5 rounded-3xl shadow-xl border border-blue-50 animate-bounce-subtle z-10">
                              <Cpu size={40} className="text-blue-600" />
                           </div>
                        </div>
                        <div className="p-6">
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Detail Informasi</span>
                          <h3 className="text-xl font-black text-slate-800 uppercase italic mt-2 mb-3 tracking-tighter leading-none">{selectedPoint.title}</h3>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px]">
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"{selectedPoint.desc}"</p>
                          </div>
                          <button className="mt-6 w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                             Pelajari Simulasi <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <style jsx>{`
                  @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
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
