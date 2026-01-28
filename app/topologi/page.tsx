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
import { v4 as uuidv4 } from 'uuid';
import '@xyflow/react/dist/style.css';

// Import komponen pendukung
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { LayoutGrid, Share2, Network as MeshIcon, Trash2, Info } from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');

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

      const newId = uuidv4();
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
        // Hubungkan ke node terakhir (Linear/Daisy Chain)
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ 
            id: `e-${lastNode.id}-${newId}`, 
            source: lastNode.id, 
            target: newId, 
            animated: true,
            label: 'Backbone' 
        }, eds));
      } else if (mode === 'mesh') {
        // Hubungkan ke SETIAP node yang sudah ada (Full Mesh)
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
    <div className="flex h-screen w-full flex-col bg-slate-50">
      {/* Menu Topologi (Navbar) */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-blue-600 tracking-tighter uppercase">MEJATIKA NETWORK SIMULASI v2</h1>
          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">PRO | By: XII INFROMATIKA 2025</span>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <ModeButton 
            active={mode === 'free'} 
            onClick={() => switchMode('free')} 
            icon={<LayoutGrid size={16}/>} 
            label="Manual/Free" 
          />
          <ModeButton 
            active={mode === 'bus'} 
            onClick={() => switchMode('bus')} 
            icon={<Share2 size={16}/>} 
            label="Bus Mode" 
          />
          <ModeButton 
            active={mode === 'mesh'} 
            onClick={() => switchMode('mesh')} 
            icon={<MeshIcon size={16}/>} 
            label="Mesh Mode" 
          />
        </div>
        
        <button 
          onClick={() => {setNodes([]); setEdges([]);}}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} /> Reset
        </button>
      </nav>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Dinamis */}
        <Sidebar activeMode={mode} />
        
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
            <Background gap={25} size={1} color="#e2e8f0" />
            <Controls className="bg-white shadow-lg border-none" />
            
            <Panel position="top-right" className="bg-white/90 backdrop-blur p-3 border rounded-xl shadow-sm max-w-[200px]">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-500 mt-0.5" />
                <p className="text-[10px] text-slate-600 leading-tight">
                  <strong>{mode.toUpperCase()} Mode:</strong> {
                    mode === 'free' ? 'Bebas tarik kabel antar port.' :
                    mode === 'bus' ? 'Node otomatis terhubung secara seri.' :
                    'Node otomatis terhubung ke semua node lainnya.'
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

// Wrapper dengan ReactFlowProvider (PENTING untuk koordinat Drop)
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
        active ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 opacity-60 hover:opacity-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
