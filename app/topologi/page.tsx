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
  ShieldCheck, X, ChevronRight, Network, Cpu, Zap, Info, Camera, LayoutGrid, Share2, Network as MeshIcon, Edit3, XCircle
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State Materi Utama
  const [activeLesson, setActiveLesson] = useState<{
    title: string, content: string, categories: { name: string, items: {title: string, desc: string}[] }[]
  } | null>(null);

  // State untuk melacak kategori mana yang diklik (misal: Hardware atau Software)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSubPoint, setSelectedSubPoint] = useState<{title: string, desc: string} | null>(null);

  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  // --- LOGIKA REACT FLOW ---
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), []);
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ id: node.id, x: event.clientX, y: event.clientY, type: 'node', label: node.data.label });
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none italic">SANPIO LAB</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">Informatika Bab 4</span>
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
          setActiveCategory(null);
          setSelectedSubPoint(null); 
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* PETA KONSEP DINAMIS */}
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                <div className="flex items-start gap-0 pointer-events-auto">
                  
                  {/* LEVEL 1: KARTU UTAMA (AKAR) */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[240px] shrink-0 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                      <span className="text-[8px] font-black text-blue-400 uppercase italic tracking-widest">Modul Materi</span>
                      <button onClick={() => setActiveLesson(null)} className="text-white/50 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="p-4">
                      <h2 className="text-white text-sm font-black uppercase italic mb-2">{activeLesson.title}</h2>
                      <div className="space-y-2 mt-4">
                        {/* Tombol Kategori seperti 'Hardware' atau 'Konektivitas' */}
                        {activeLesson.categories?.map((cat, idx) => (
                          <button 
                            key={idx}
                            onClick={() => { setActiveCategory(cat.name); setSelectedSubPoint(null); }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${activeCategory === cat.name ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                          >
                            <span className="text-[10px] font-black uppercase italic">{cat.name}</span>
                            <ChevronRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2: DAFTAR KOMPONEN (Hanya muncul jika Kategori dipilih) */}
                  {activeCategory && (
                    <>
                      <div className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] self-center shrink-0 animate-line-grow" />
                      <div className="flex flex-col gap-2 shrink-0">
                        {activeLesson.categories.find(c => c.name === activeCategory)?.items.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-4 h-[2px] bg-blue-400/50 shrink-0" />
                            <button 
                              onClick={() => setSelectedSubPoint(item)}
                              style={{ animationDelay: `${i * 100}ms` }}
                              className={`w-[220px] flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 animate-in slide-in-from-left-4 fade-in fill-mode-backwards
                                ${selectedSubPoint?.title === item.title ? 'bg-blue-600 border-blue-400 shadow-lg text-white -translate-y-1' : 'bg-white border-slate-100 hover:border-blue-400 text-slate-700 shadow-sm'}`}
                            >
                              <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] ${selectedSubPoint?.title === item.title ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-500'}`}>{i+1}</div>
                              <span className="text-[9px] font-black uppercase text-left">{item.title}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* LEVEL 3: PENJELASAN LENGKAP + GAMBAR (Kekanan) */}
                  {selectedSubPoint && (
                    <>
                      <div className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] self-center shrink-0 animate-line-grow" />
                      <div className="bg-white border-2 border-blue-600 shadow-2xl rounded-[2.5rem] w-[320px] shrink-0 overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-500">
                        <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '15px 15px'}} />
                           <div className="bg-white p-5 rounded-3xl shadow-xl border border-blue-100 animate-pulse">
                              <Cpu size={40} className="text-blue-600" />
                           </div>
                        </div>
                        <div className="p-6">
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic">Detail Komponen</span>
                          <h3 className="text-xl font-black text-slate-800 uppercase italic mt-2 mb-3 tracking-tighter">{selectedSubPoint.title}</h3>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"{selectedSubPoint.desc}"</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <style jsx>{`
                  @keyframes line-grow { from { width: 0; } to { width: 40px; } }
                  .animate-line-grow { animation: line-grow 0.3s ease-out forwards; }
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
