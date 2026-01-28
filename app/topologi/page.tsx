
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

// Import komponen lokal
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  LayoutGrid, 
  Share2, 
  Network as MeshIcon, 
  Trash2, 
  Camera, 
  ShieldCheck, 
  XCircle, 
  Edit3,
  BookOpen,
  X,
  ChevronRight
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk Materi & Context Menu
  const [activeLesson, setActiveLesson] = useState<{
    title: string, 
    content: string, 
    points: string[],
    category?: string 
  } | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  // --- LOGIKA KLIK KANAN ---
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setMenu({ 
        id: node.id, 
        x: event.clientX, 
        y: event.clientY, 
        type: 'node', 
        label: node.data.label 
      });
    },
    [setMenu]
  );

  const deleteElement = () => {
    if (!menu) return;
    setNodes((nds) => nds.filter((n) => n.id !== menu.id));
    setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    setMenu(null);
  };

  const renameElement = () => {
    const newName = prompt("Ganti nama perangkat:", menu?.label);
    if (newName && menu) {
      setNodes((nds) => nds.map((n) => n.id === menu.id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
    setMenu(null);
  };

  // --- LOGIKA DRAG & DROP & CONNECT ---
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = { 
        x: event.clientX - rect.left - 50, 
        y: event.clientY - rect.top - 50 
      };
      
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      
      const newNode = {
        id: newId,
        type: 'device',
        position,
        data: { 
          label: label || type.toUpperCase(), 
          type, 
          ip: `192.168.1.${nodes.length + 10}` 
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // Otomatisasi Jaringan sesuai Mode
      if (mode === 'bus' && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
      } else if (mode === 'mesh') {
        const meshEdges = nodes.map((node) => ({ id: `e-${newId}-${node.id}`, source: newId, target: node.id }));
        setEdges((eds) => eds.concat(meshEdges as any));
      }
    },
    [nodes, mode, setNodes, setEdges]
  );

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">MEJATIKA NETWORK v2</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Lab Informatika SMK - Bab 4</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => {setMode('free'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><LayoutGrid size={14} className="inline mr-2"/>Manual</button>
          <button onClick={() => {setMode('bus'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Share2 size={14} className="inline mr-2"/>Bus</button>
          <button onClick={() => {setMode('mesh'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><MeshIcon size={14} className="inline mr-2"/>Mesh</button>
        </div>
        
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-black rounded-lg transition-all shadow-md">
          <Camera size={14} /> Cetak Lab
        </button>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => setActiveLesson(lesson)} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          {/* WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.05] text-center">
            <div className="flex flex-col items-center">
              <h2 className="text-[12vw] font-black text-slate-900 tracking-[0.2em] uppercase leading-none">SANPIO</h2>
              <p className="text-xl md:text-2xl font-bold text-slate-800 tracking-[0.5em] mt-4 uppercase">Projek Kelas XII Informatika</p>
            </div>
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

            {/* 4. MODAL MATERI (FRAME LENGKAP DENGAN ANIMASI) */}
            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-10 fade-in duration-500 ease-out">
                  
                  {/* Header Frame dengan Progress Bar Animasi */}
                  <div className="relative h-24 bg-slate-900 flex items-center px-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/20">
                      <div className="h-full bg-blue-500 animate-[progress_3s_linear_infinite] w-full origin-left" style={{ animationName: 'progress-loading' }} />
                    </div>
                    
                    <div className="z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-[9px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest">
                          {activeLesson.category || 'Materi Bab 4'}
                        </span>
                      </div>
                      <h2 className="text-white text-lg font-black leading-tight tracking-tight uppercase italic">
                        {activeLesson.title}
                      </h2>
                    </div>

                    <button 
                      onClick={() => setActiveLesson(null)} 
                      className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all group"
                    >
                      <X size={16} className="group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>

                  {/* Body Konten */}
                  <div className="p-6 space-y-5">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in zoom-in-95 delay-150 duration-500">
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "{activeLesson.content}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeLesson.points.map((p, i) => (
                        <div 
                          key={i} 
                          className="flex gap-3 items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 hover:translate-x-2 transition-all duration-300 animate-in slide-in-from-left-5"
                          style={{ animationDelay: `${(i + 1) * 150}ms` }}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">
                            {i + 1}
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 leading-tight tracking-wide">
                            {p}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                      Simulasikan Sekarang <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Footer Frame */}
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Informatika Fase E</span>
                    <span>Kurikulum Merdeka</span>
                  </div>
                </div>

                {/* CSS Inline untuk Progress Bar */}
                <style jsx>{`
                  @keyframes progress-loading {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); }
                    100% { transform: scaleX(0); transform-origin: right; }
                  }
                `}</style>
              </Panel>
            )}

            {/* 5. CONTEXT MENU */}
            {menu && (
              <div
                style={{ top: menu.y, left: menu.x }}
                className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[170px] overflow-hidden"
              >
                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Opsi Perangkat</div>
                <button onClick={renameElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 font-bold transition-colors">
                  <Edit3 size={14} /> Ganti Nama
                </button>
                <button onClick={deleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors">
                  <XCircle size={14} /> Hapus
                </button>
              </div>
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
