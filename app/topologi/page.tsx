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

// Import komponen pendukung
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  LayoutGrid, 
  Share2, 
  Network as MeshIcon, 
  Trash2, 
  Info, 
  Camera, 
  ShieldCheck 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');

  // --- FITUR SIMPAN (Native Print) ---
  const onExport = () => {
    // Menggunakan fungsi print browser sebagai alternatif tanpa library
    window.print();
  };

  // --- LOGIKA KONEKSI MANUAL ---
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // --- LOGIKA DRAG & DROP ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 50,
        y: event.clientY - rect.top - 50,
      };

      // Menggunakan Native ID Generator (Tanpa library UUID)
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      
      const newNode = {
        id: newId,
        type: 'device',
        position,
        data: { 
          label: label || `${type.toUpperCase()} ${nodes.length + 1}`, 
          type: type, 
          ip: `192.168.1.${nodes.length + 10}`,
          hasConflict: false 
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // --- LOGIKA OTOMATISASI TOPOLOGI ---
      if (mode === 'bus' && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ 
            id: `e-${lastNode.id}-${newId}`, 
            source: lastNode.id, 
            target: newId, 
            animated: true,
            label: 'Backbone' 
        }, eds));
      } else if (mode === 'mesh') {
        const meshEdges = nodes.map((node) => ({
          id: `e-${newId}-${node.id}`,
          source: newId,
          target: node.id,
          animated: false,
          style: { stroke: '#94a3b8' }
        }));
        setEdges((eds) => eds.concat(meshEdges));
      }
    },
    [nodes, mode, setNodes, setEdges]
  );

  const switchMode = (newMode: 'free' | 'bus' | 'mesh') => {
    setMode(newMode);
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 print:bg-white">
      {/* Menu Topologi (Navbar) */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-10 print:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">
                MEJATIKA NETWORK SIMULASI v2
            </h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                PRO | XII INFORMATIKA 2025
            </span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <ModeButton active={mode === 'free'} onClick={() => switchMode('free')} icon={<LayoutGrid size={16}/>} label="Manual" />
          <ModeButton active={mode === 'bus'} onClick={() => switchMode('bus')} icon={<Share2 size={16}/>} label="Bus" />
          <ModeButton active={mode === 'mesh'} onClick={() => switchMode('mesh')} icon={<MeshIcon size={16}/>} label="Mesh" />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-black rounded-lg transition-all shadow-md"
          >
            <Camera size={14} /> Cetak Lab
          </button>
          <button onClick={() => switchMode(mode)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden">
        <div className="print:hidden">
          <Sidebar activeMode={mode} />
        </div>
        
        <div className="flex-grow relative h-full bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls className="print:hidden bg-white shadow-lg border-none" />
            
            {/* WATERMARK PROJEK SANPIO */}
            <Panel position="bottom-center" className="pointer-events-none select-none mb-20 opacity-10 text-center">
                <h2 className="text-7xl md:text-9xl font-black text-slate-900 tracking-[0.3em] uppercase">
                    SANPIO
                </h2>
                <p className="text-lg font-bold text-slate-800 tracking-[0.5em] mt-2 uppercase">
                    Projek Kelas XII Peminatan Informatika
                </p>
            </Panel>

            <Panel position="top-right" className="print:hidden bg-white/90 backdrop-blur p-3 border rounded-xl shadow-sm max-w-[200px]">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-500 mt-0.5" />
                <p className="text-[10px] text-slate-600 leading-tight italic">
                  <strong>{mode.toUpperCase()} Mode:</strong> {
                    mode === 'free' ? 'Bebas tarik kabel.' :
                    mode === 'bus' ? 'Koneksi Seri (Backbone).' :
                    'Koneksi Full Mesh.'
                  }
                </p>
              </div>
            </Panel>
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
      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
        active ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 opacity-60'
      }`}
    >
      {icon} {label}
    </button>
  );
}
