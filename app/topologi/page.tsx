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
          setSelectedSubPoint(null); 
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

            {/* 4. MODAL PETA KONSEP DINAMIS (FIXED BERANTAKAN) */}
            {activeLesson && (
              <Panel position="top-left" className="m-0 p-4 z-50 pointer-events-none">
                {/* CONTAINER UTAMA - Memaksa aliran horizontal tanpa pecah */}
                <div className="flex items-start gap-0 pointer-events-auto">
                  
                  {/* LEVEL 1: AKAR MATERI */}
                  <div className="bg-slate-900 border-2 border-blue-500 shadow-2xl rounded-2xl w-[240px] shrink-0 overflow-hidden animate-in fade-in zoom-in duration-300">
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

                  {/* GARIS 1 */}
                  <div className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] self-center shrink-0 animate-expand-line" />

                  {/* LEVEL 2: DAFTAR KOMPONEN */}
                  <div className="bg-white border-2 border-slate-200 shadow-2xl rounded-3xl w-[300px] shrink-0 overflow-hidden animate-in slide-in-from-left-5 fade-in duration-500">
                    <div className="bg-slate-50 p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-blue-600" />
                        <h3 className="text-[9px] font-black text-slate-800 uppercase italic">Pilih Komponen</h3>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
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
                            className={`w-full group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg translate-x-2' : 'bg-white border-slate-100 hover:border-blue-300'}`}
                          >
                            <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                              {i + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase flex-grow text-left ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                              {title}
                            </span>
                            <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-slate-300'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LEVEL 3: DETAIL (Hanya muncul jika dipilih) */}
                  {selectedSubPoint && (
                    <div className="flex items-start shrink-0">
                      {/* GARIS 2 */}
                      <div className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_blue] self-center animate-expand-line" />
                      
                      <div className="bg-white border-2 border-blue-500 shadow-2xl rounded-[2.5rem] w-[340px] overflow-hidden animate-in slide-in-from-left-10 fade-in duration-500">
                        <div className="h-32 bg-slate-50 relative flex items-center justify-center border-b">
                           <div className="z-10 bg-white p-5 rounded-[2rem] shadow-xl border border-blue-100">
                              {selectedSubPoint.type === 'hardware' ? <Cpu size={40} className="text-blue-600" /> : <Network size={40} className="text-blue-600" />}
                           </div>
                        </div>
                        <div className="p-6">
                          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-3 italic">
                            {selectedSubPoint.title}
                          </h2>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic">
                             <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                               "{selectedSubPoint.desc}"
                             </p>
                          </div>
                          <button 
                            onClick={() => {
                              const newId = `node_${Math.random().toString(36).substr(2, 5)}`;
                              setNodes(nds => [...nds, {
                                id: newId,
                                type: 'device',
                                position: { x: 300, y: 150 },
                                data: { label: selectedSubPoint.title, type: 'router', ip: '192.168.1.1' }
                              }]);
                            }}
                            className="mt-5 w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Tambahkan ke Lab
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <style jsx>{`
                  @keyframes expand-line {
                    from { width: 0; }
                    to { width: 40px; }
                  }
                  .animate-expand-line {
                    animation: expand-line 0.4s ease-out forwards;
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
