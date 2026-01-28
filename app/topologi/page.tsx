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
  LayoutGrid, Share2, Network as MeshIcon, Camera, ShieldCheck, XCircle, Edit3, X, ChevronRight, Cpu 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk Materi & Detail Level 3
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR TETAP SAMA */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none text-left">MEJATIKA NETWORK v2</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Lab Informatika SMK - Bab 4</span>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
          <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
          <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => {
            setActiveLesson(lesson);
            setSelectedDetail(null); // Reset detail saat ganti materi
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* AREA MATERI BERJEJER */}
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                <div className="flex items-start gap-0 pointer-events-auto">
                  
                  {/* MODAL LEVEL 1: Desain Asli Anda */}
                  <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl w-[350px] overflow-hidden animate-in slide-in-from-left-5 duration-300">
                    <div className="relative h-20 bg-slate-900 flex items-center px-6 overflow-hidden">
                      <div className="z-10 text-left">
                        <span className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest">{activeLesson.category || 'MATERI'}</span>
                        <h2 className="text-white text-base font-black leading-tight uppercase italic">{activeLesson.title}</h2>
                      </div>
                      <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={16} /></button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 italic">
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed tracking-tight">"{activeLesson.content}"</p>
                      </div>

                      <div className="space-y-2">
                        {activeLesson.points.map((p: string, i: number) => {
                          const title = p.split(':')[0];
                          const desc = p.split(':')[1] || "Penjelasan materi...";
                          const isSelected = selectedDetail?.title === title;
                          
                          return (
                            <button 
                              key={i}
                              onClick={() => setSelectedDetail({ title, desc })}
                              className={`w-full flex gap-3 items-center p-3 border rounded-xl transition-all duration-300 group
                                ${isSelected ? 'bg-blue-600 border-blue-400 shadow-md translate-x-2' : 'bg-white border-slate-100 hover:border-blue-300'}`}
                            >
                              <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center font-black text-[10px] ${isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-blue-600'}`}>
                                {i + 1}
                              </div>
                              <p className={`text-[10px] font-black uppercase text-left flex-grow ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                {title}
                              </p>
                              <ChevronRight size={14} className={`${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 3: MUNCUL SAAT POIN DI ATAS DIKLIK */}
                  {selectedDetail && (
                    <>
                      {/* Garis Penghubung */}
                      <div className="w-12 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] self-center shrink-0 animate-in fade-in zoom-in duration-300" />
                      
                      {/* Kartu Detail Putih Besar */}
                      <div className="bg-white border-2 border-blue-600 shadow-2xl rounded-[2.5rem] w-[320px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-500">
                        <div className="h-32 bg-slate-50 flex items-center justify-center border-b relative">
                           <div className="bg-white p-5 rounded-3xl shadow-xl border border-blue-50 animate-bounce-subtle z-10">
                              <Cpu size={40} className="text-blue-600" />
                           </div>
                        </div>
                        <div className="p-6 text-left">
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Ensiklopedia</span>
                          <h3 className="text-xl font-black text-slate-800 uppercase italic mt-2 mb-3 tracking-tighter leading-none">{selectedDetail.title}</h3>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">"{selectedDetail.desc}"</p>
                          </div>
                          <button className="mt-6 w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                            Simulasikan Perangkat
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <style jsx>{`
                  @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                  .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
                `}</style>
              </Panel>
            )}
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
