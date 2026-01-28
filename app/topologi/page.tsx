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
  X
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk Materi & Context Menu
  const [activeLesson, setActiveLesson] = useState<{title: string, content: string, points: string[]} | null>(null);
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
        
        {/* 2. SIDEBAR */}
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => setActiveLesson(lesson)} />
        
        {/* 3. MAIN CANVAS AREA */}
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          {/* WATERMARK FIX: Tepat di tengah area kerja */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.05] text-center">
            <div className="flex flex-col items-center">
              <h2 className="text-[12vw] font-black text-slate-900 tracking-[0.2em] uppercase leading-none">
                SANPIO
              </h2>
              <p className="text-xl md:text-2xl font-bold text-slate-800 tracking-[0.5em] mt-4 uppercase">
                Projek Kelas XII Informatika
              </p>
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

            {/* 4. MODAL MATERI (FLOATING PANEL) */}
            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 animate-in slide-in-from-left-5 duration-300 z-50">
                <div className="bg-white/95 backdrop-blur-md border-2 border-blue-500 shadow-2xl rounded-2xl p-6 max-w-sm relative">
                  <button onClick={() => setActiveLesson(null)} className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <BookOpen size={20} />
                    <h3 className="font-black uppercase tracking-tight text-[10px]">Materi Kurikulum Merdeka</h3>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2 leading-tight uppercase tracking-tighter">{activeLesson.title}</h2>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-4 italic border-l-2 border-blue-200 pl-3">
                    {activeLesson.content}
                  </p>
                  <div className="space-y-2">
                    {activeLesson.points.map((p, i) => (
                      <div key={i} className="flex gap-2 items-start text-[10px] font-bold text-slate-700 bg-blue-50/50 p-2 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {/* 5. CONTEXT MENU (KLIK KANAN) */}
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

// Wrapper Provider wajib agar ReactFlow bekerja
export default function NetworkLabEditor() {
  return (
    <ReactFlowProvider>
      <NetworkLabContent />
    </ReactFlowProvider>
  );
}
