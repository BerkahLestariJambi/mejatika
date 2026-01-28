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
  ChevronRight,
  Network,
  Cpu,
  Globe,
  Zap,
  Info
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

  // State baru untuk Detail Sub-Materi (Level 3)
  const [selectedSubPoint, setSelectedSubPoint] = useState<{
    title: string, 
    desc: string, 
    type: 'hardware' | 'software' | 'network'
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
        
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => {
          setActiveLesson(lesson);
          setSelectedSubPoint(null); // Reset sub-detail saat ganti materi
        }} />
        
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

            {/* 4. MODAL PETA KONSEP DINAMIS (LEVEL 1, 2, & 3) */}
            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 flex items-start gap-0 pointer-events-auto">
                
                {/* LEVEL 1: AKAR MATERI */}
                <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[240px] overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Modul Belajar</span>
                    <button onClick={() => {setActiveLesson(null); setSelectedSubPoint(null);}} className="text-white/50 hover:text-white transition-colors">
                        <X size={14}/>
                    </button>
                  </div>
                  <div className="p-5">
                    <h2 className="text-white text-md font-black leading-tight uppercase italic mb-2">{activeLesson.title}</h2>
                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed">{activeLesson.content}</p>
                  </div>
                </div>

                {/* GARIS PENGHUBUNG 1 (Akar ke Cabang) */}
                <div className="w-12 h-1 relative self-center">
                  <div className="h-[2px] bg-blue-500 shadow-[0_0_10px_blue] animate-expand-line origin-left w-full" />
                </div>

                {/* LEVEL 2: CABANG MATERI (DAFTAR KOMPONEN) */}
                <div className="bg-white border-2 border-slate-200 shadow-2xl rounded-3xl w-[320px] overflow-hidden animate-in slide-in-from-left-5 fade-in duration-500">
                  <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-blue-600 animate-pulse" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase italic">Pilih Komponen</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {activeLesson.points.map((p, i) => {
                      const title = p.includes(':') ? p.split(':')[0] : `Materi ${i+1}`;
                      const isSelected = selectedSubPoint?.title === title;
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => setSelectedSubPoint({
                            title: title,
                            desc: p.includes(':') ? p.split(':')[1] : p,
                            type: i % 2 === 0 ? 'hardware' : 'network'
                          })}
                          className={`w-full group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg -translate-y-1' : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50'}`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {i + 1}
                          </div>
                          <p className={`text-[10px] font-black uppercase flex-grow text-left ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                            {title}
                          </p>
                          <ChevronRight size={14} className={`${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} transition-colors`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LEVEL 3: DETAIL ANATOMI & FUNGSI (Hanya muncul saat diklik) */}
                {selectedSubPoint && (
                  <>
                    {/* GARIS PENGHUBUNG 2 (Cabang ke Detail) */}
                    <div className="w-12 h-1 relative self-center">
                      <div className="h-[2px] bg-blue-500 shadow-[0_0_10px_blue] animate-expand-line origin-left w-full" />
                    </div>

                    <div className="bg-white border-2 border-blue-500 shadow-[0_30px_60px_rgba(59,130,246,0.2)] rounded-[2.5rem] w-[380px] overflow-hidden animate-in slide-in-from-left-10 fade-in duration-500">
                      {/* Visual Header (Gambar) */}
                      <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                         <div className="z-10 bg-white p-5 rounded-[2rem] shadow-2xl border border-blue-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            {selectedSubPoint.type === 'hardware' ? <Cpu size={48} className="text-blue-600" /> : <Network size={48} className="text-blue-600" />}
                         </div>
                         {/* Dekorasi Grid */}
                         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter italic">
                              Ensiklopedia IT
                           </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none italic">
                          {selectedSubPoint.title}
                        </h2>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative">
                           <Info size={16} className="absolute -top-2 -right-2 text-blue-500 bg-white rounded-full" />
                           <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2">Fungsi Utama:</h4>
                           <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                             "{selectedSubPoint.desc}"
                           </p>
                        </div>

                        <button 
                          onClick={() => {
                            // Opsional: Logika untuk menambahkan node langsung ke canvas
                            const newId = `node_${Math.random().toString(36).substr(2, 5)}`;
                            setNodes(nds => [...nds, {
                              id: newId,
                              type: 'device',
                              position: { x: 400, y: 200 },
                              data: { label: selectedSubPoint.title, type: 'router', ip: '192.168.1.1' }
                            }]);
                          }}
                          className="mt-6 w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 group"
                        >
                          Gunakan di Lab <Zap size={14} className="group-hover:fill-current" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* STYLE KHUSUS ANIMASI */}
                <style jsx>{`
                  @keyframes expand-line {
                    from { width: 0; opacity: 0; }
                    to { width: 48px; opacity: 1; }
                  }
                  .animate-expand-line {
                    animation: expand-line 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
