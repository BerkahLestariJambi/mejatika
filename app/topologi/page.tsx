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
  Globe,
  Github
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk Context Menu (Klik Kanan)
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  // --- LOGIKA KLIK KANAN ---
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setMenu({ id: node.id, x: event.clientX, y: event.clientY, type: 'node', label: node.data.label });
    },
    [setMenu]
  );

  const deleteElement = () => {
    if (!menu) return;
    if (menu.type === 'node') {
      setNodes((nds) => nds.filter((n) => n.id !== menu.id));
      setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    }
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
      const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      
      const newNode = {
        id: newId,
        type: 'device',
        position,
        data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` },
      };

      setNodes((nds) => nds.concat(newNode));

      // Otomatisasi Jaringan
      if (mode === 'bus' && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
      } else if (mode === 'mesh') {
        const meshEdges = nodes.map((node) => ({ id: `e-${newId}-${node.id}`, source: newId, target: node.id }));
        setEdges((eds) => eds.concat(meshEdges));
      }
    },
    [nodes, mode, setNodes, setEdges]
  );

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">MEJATIKA NETWORK v2</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1 italic">Simulation Lab</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <ModeButton active={mode === 'free'} onClick={() => {setMode('free'); setNodes([]); setEdges([]);}} icon={<LayoutGrid size={16}/>} label="Manual" />
          <ModeButton active={mode === 'bus'} onClick={() => {setMode('bus'); setNodes([]); setEdges([]);}} icon={<Share2 size={16}/>} label="Bus" />
          <ModeButton active={mode === 'mesh'} onClick={() => {setMode('mesh'); setNodes([]); setEdges([]);}} icon={<MeshIcon size={16}/>} label="Mesh" />
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-black rounded-lg transition-all shadow-md"><Camera size={14} /> Cetak</button>
          <button onClick={() => {setNodes([]); setEdges([]);}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        
        {/* 2. SIDEBAR WITH FOOTER */}
        <div className="flex flex-col border-r bg-white w-72 print:hidden">
            <div className="flex-grow overflow-hidden">
                <Sidebar activeMode={mode} />
            </div>
            {/* FOOTER SIDEBAR */}
            <footer className="p-4 bg-slate-900 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">System XII Sanpio</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    &copy; 2025 XII Informatika. <br/>
                    Mejatika Network Simulator.
                </p>
                <div className="flex gap-3 mt-3 opacity-50 hover:opacity-100 transition-opacity">
                    <Globe size={14} className="cursor-pointer hover:text-blue-400" />
                    <Github size={14} className="cursor-pointer hover:text-blue-400" />
                </div>
            </footer>
        </div>
        
        {/* 3. MAIN CANVAS */}
        <div className="flex-grow relative h-full bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          {/* WATERMARK TENGAH LAYAR */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.07] text-center px-10">
            <div className="flex flex-col items-center">
              <h2 className="text-[12vw] font-black text-slate-900 tracking-[0.2em] uppercase leading-none">SANPIO</h2>
              <p className="text-xl md:text-3xl font-bold text-slate-800 tracking-[0.6em] mt-4 uppercase">
                Projek Kelas XII Peminatan Informatika
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
            <Controls className="print:hidden bg-white shadow-lg border-none" />
            
            {/* CONTEXT MENU KLIK KANAN */}
            {menu && (
              <div
                style={{ top: menu.y, left: menu.x }}
                className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[170px] overflow-hidden"
              >
                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Device Options</div>
                <button onClick={renameElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors font-bold"><Edit3 size={14} /> Rename</button>
                <button onClick={deleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"><XCircle size={14} /> Delete</button>
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

function ModeButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all ${
        active ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-500 opacity-60 hover:opacity-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
