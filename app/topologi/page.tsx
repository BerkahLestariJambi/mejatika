'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls, Connection, ReactFlowProvider, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import komponen
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { LayoutGrid, Share2, Network as MeshIcon, Trash2, Camera, ShieldCheck, XCircle, Edit3, BookOpen, X } from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // --- STATE BARU: UNTUK MATERI DI CANVAS ---
  const [activeLesson, setActiveLesson] = useState<{title: string, content: string, points: string[]} | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  // ... (Fungsi onConnect, onDrop, deleteElement, renameElement sama seperti sebelumnya) ...
  // [PASTIKAN FUNGSI TERSEBUT TETAP ADA DI KODE KAMU]

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-10 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none tracking-tighter">MEJATIKA NETWORK v2</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">PRO | XII INFORMATIKA 2025</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => {setMode('free'); setNodes([]); setEdges([]); setActiveLesson(null);}} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Freeform</button>
          <button onClick={() => {setMode('bus'); setNodes([]); setEdges([]); setActiveLesson(null);}} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus Mode</button>
          <button onClick={() => {setMode('mesh'); setNodes([]); setEdges([]); setActiveLesson(null);}} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh Mode</button>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg flex items-center gap-2"><Camera size={14}/> Cetak</button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Kirim fungsi setActiveLesson ke Sidebar agar bisa diklik */}
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => setActiveLesson(lesson)} />
        
        <div className="flex-grow relative h-full bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          {/* WATERMARK SANPIO */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.05] text-center">
            <h2 className="text-[15vw] font-black text-slate-900 tracking-widest">SANPIO</h2>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls className="print:hidden" />

            {/* --- MODAL MATERI YANG TAMPIL DI ATAS CANVAS --- */}
            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 animate-in slide-in-from-left-5 duration-300">
                <div className="bg-white/95 backdrop-blur-md border-2 border-blue-500 shadow-2xl rounded-2xl p-6 max-w-sm relative">
                  <button 
                    onClick={() => setActiveLesson(null)}
                    className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <BookOpen size={20} />
                    <h3 className="font-black uppercase tracking-tight text-sm">Modul Belajar</h3>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2 leading-tight uppercase">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 italic border-l-2 border-blue-200 pl-3">
                    {activeLesson.content}
                  </p>
                  <div className="space-y-2">
                    {activeLesson.points.map((p, i) => (
                      <div key={i} className="flex gap-2 items-start text-[11px] font-medium text-slate-700 bg-blue-50/50 p-2 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {/* Context Menu (Klik Kanan) Tetap Sama */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border shadow-xl rounded-lg py-1 min-w-[160px]">
                <button onClick={renameElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 font-bold border-b"><Edit3 size={14}/> Rename</button>
                <button onClick={deleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"><XCircle size={14}/> Delete</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
// [JANGAN LUPA EXPORT REACTFLOWPROVIDER SEPERTI SEBELUMNYA]
