'use client';

import React, { useState } from 'react';
import { ReactFlow, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { LayoutGrid, Share2, Network as MeshIcon } from 'lucide-react';

const nodeTypes = { device: DeviceNode };

export default function NetworkLabEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');

  // Fungsi ganti mode sekaligus reset canvas agar bersih
  const switchMode = (newMode: 'free' | 'bus' | 'mesh') => {
    setMode(newMode);
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50">
      {/* Menu Topologi (Navbar) */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm">
        <h1 className="text-lg font-black text-blue-600 tracking-tighter uppercase">NetLab v2</h1>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <ModeButton 
            active={mode === 'free'} 
            onClick={() => switchMode('free')} 
            icon={<LayoutGrid size={16}/>} 
            label="Freeform" 
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
        
        <div className="w-20"></div> {/* Spacer */}
      </nav>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar sekarang dinamis berdasarkan 'mode' */}
        <Sidebar activeMode={mode} />
        
        <div className="flex-grow relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            {/* Background dan Controls */}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

// Helper component untuk tombol menu
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
