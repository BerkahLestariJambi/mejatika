'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  Connection,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  ShieldCheck, X, ChevronRight, Network, Cpu, Camera, LayoutGrid, Share2, Network as MeshIcon, Edit3, XCircle 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk mengontrol hirarki materi
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [selectedSubPoint, setSelectedSubPoint] = useState<any>(null);

  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">SANPIO NETWORK</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Lab Informatika SMK</span>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
          <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { 
          setActiveLesson(lesson); 
          setSelectedSubPoint(null); 
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            
            {/* PETA KONSEP HIRARKI KE KANAN */}
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                <div className="flex items-start gap-0 pointer-events-auto overflow-visible">
                  
                  {/* LEVEL 1: KARTU UTAMA (AKAR) */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[260px] shrink-0 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                      <span className="text-[8px] font-black text-blue-400 uppercase italic tracking-widest">Modul Utama</span>
                      <button onClick={() => setActiveLesson(null)} className="text-white/50 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="p-4">
                      <h2 className="text-white text-sm font-black uppercase italic mb-2 tracking-tight">{activeLesson.title}</h2>
                      <p className="text-[10px] text-slate-400 font-medium mb-4 leading-relaxed line-clamp-2">{activeLesson.content}</p>
                      
                      <div className="space-y-2 mt-2">
                        {activeLesson.points?.map((p: string, i: number) => {
                          const title = p.includes(':') ? p.split(':')[0] : p;
                          const desc = p.includes(':') ? p.split(':')[1] : "Klik untuk detail";
                          return (
                            <button 
                              key={i}
                              onClick={() => setSelectedSubPoint({ title, desc, index: i })}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${selectedSubPoint?.title === title ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                            >
                              <span className="text-[10px] font-black uppercase italic truncate pr-2">{title}</span>
                              <ChevronRight size={12} className={selectedSubPoint?.title === title ? "translate-x-1" : ""} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2: DETAIL PENJELASAN (MUNCUL KE KANAN SAAT POINT DIKLIK) */}
                  {selectedSubPoint && (
                    <>
                      {/* Garis Penghubung Animasi */}
                      <div className="w-12 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] self-center shrink-0 animate-in slide-in-from-left duration-300" 
                           style={{ animationName: 'line-grow-right' }} />
                      
                      {/* Kartu Detail */}
                      <div className="bg-white border-2 border-blue-600 shadow-2xl rounded-[2.5rem] w-[320px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-500">
                        <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                           {/* Background Pattern */}
                           <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '12px 12px'}} />
                           
                           <div className="bg-white p-5 rounded-3xl shadow-xl border border-blue-50 animate-bounce-subtle z-10">
                              <Cpu size={40} className="text-blue-600" />
                           </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Detail {selectedSubPoint.index + 1}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-800 uppercase italic mb-3 tracking-tighter leading-none">
                            {selectedSubPoint.title}
                          </h3>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                              "{selectedSubPoint.desc}"
                            </p>
                          </div>
                          
                          <button 
                            className="mt-6 w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
                            onClick={() => alert(`Simulasi ${selectedSubPoint.title} dimulai!`)}
                          >
                            Simulasikan Komponen <ChevronRight size={14} />
                          </button>
                        </div>

                        <div className="bg-slate-900 py-2 px-6 flex justify-between">
                           <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Sanpio Network v2</span>
                           <div className="flex gap-1">
                              <div className="w-1 h-1 rounded-full bg-blue-500" />
                              <div className="w-1 h-1 rounded-full bg-blue-500 opacity-50" />
                           </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* CSS Khusus Animasi */}
                <style jsx>{`
                  @keyframes line-grow-right {
                    from { width: 0; opacity: 0; }
                    to { width: 48px; opacity: 1; }
                  }
                  @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                  }
                  .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                  }
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
