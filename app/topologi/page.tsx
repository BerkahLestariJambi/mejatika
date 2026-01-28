'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  ConnectionMode,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Monitor, Network, Share2, PlusSquare, 
  Router, Server, Wifi, Database, Circle, Cloud
} from 'lucide-react';

// --- SVG CLOUD PATH GENERATOR ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE ---
const UniversalNode = ({ data, selected }: any) => {
  const isCloud = data.type === 'cloud';
  const isDevice = data.type === 'device';
  
  const getBaseStyle = (): React.CSSProperties => {
    if (isCloud) {
      return {
        backgroundImage: getCloudPath(data.bgColor || '#f0f9ff', data.borderColor || '#0ea5e9'),
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        padding: '35px',
      };
    }
    if (isDevice) {
      return {
        background: 'transparent',
        padding: '10px',
      };
    }
    // Default Shapes (Circle/Square)
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: data.shape === 'circle' ? '50%' : '12px',
      padding: '15px',
    };
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center transition-all ${selected ? 'scale-110 z-50' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-500 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 w-2 h-2" />
      <Handle type="source" position={Position.Left} className="!bg-blue-500 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500 w-2 h-2" />

      <div style={getBaseStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className={isDevice ? "p-4 bg-white rounded-2xl shadow-sm border-2 border-slate-100" : ""}>
          {data.icon}
        </div>
        <div className="mt-1 text-[10px] font-black uppercase text-slate-800 pointer-events-none">
          {data.label}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const value = event.dataTransfer.getData('application/value');
    
    if (!reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 60 };

    const iconMap: any = {
      router: <Router size={32} className="text-blue-600"/>,
      switch: <Network size={32} className="text-indigo-600"/>,
      pc: <Monitor size={32} className="text-slate-700"/>,
      wifi: <Wifi size={32} className="text-orange-500"/>,
      server: <Server size={32} className="text-emerald-600"/>,
      cloud: <Cloud size={32} className="text-sky-500"/>,
    };

    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`,
      type: 'universal',
      position,
      data: { 
        type: type, // 'device' atau 'cloud' atau 'shape'
        shape: value,
        icon: iconMap[value] || <PlusSquare size={32}/>,
        label: value,
        bgColor: type === 'cloud' ? '#f0fdf4' : '#ffffff',
        borderColor: type === 'cloud' ? '#22c55e' : '#2563eb'
      },
      style: { width: type === 'cloud' ? 180 : 120, height: type === 'cloud' ? 140 : 120 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-4 z-50">
        <div className="flex items-center gap-3 font-black text-blue-900 uppercase italic"><ShieldCheck/> Mejatika Concept Lab</div>
        <button onClick={() => setNodes([])} className="p-2 bg-red-50 text-red-600 rounded-lg"><Eraser/></button>
      </nav>

      <div className="flex flex-grow relative">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-xl">
          <div className="flex p-2 bg-slate-100 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-xs font-black rounded-lg ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-xs font-black rounded-lg ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
            {activeTab === 'inventory' ? (
              [
                { id: 'router', icon: <Router size={24}/>, label: 'Router' },
                { id: 'switch', icon: <Network size={24}/>, label: 'Switch' },
                { id: 'pc', icon: <Monitor size={24}/>, label: 'PC' },
                { id: 'wifi', icon: <Wifi size={24}/>, label: 'Wifi' },
              ].map(d => (
                <div key={d.id} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d.id); }} className="p-4 border rounded-2xl flex flex-col items-center hover:bg-blue-50 cursor-grab transition-all">
                  {d.icon}
                  <span className="text-[10px] mt-2 font-bold uppercase">{d.label}</span>
                </div>
              ))
            ) : (
              [
                { id: 'cloud', icon: <Cloud size={24}/>, label: 'Awan Gerigi' },
                { id: 'circle', icon: <Circle size={24}/>, label: 'Bulat' },
                { id: 'square', icon: <PlusSquare size={24}/>, label: 'Kotak' },
              ].map(s => (
                <div key={s.id} draggable onDragStart={e => { e.dataTransfer.setData('application/type', s.id === 'cloud' ? 'cloud' : 'shape'); e.dataTransfer.setData('application/value', s.id); }} className="p-4 border border-dashed rounded-2xl flex flex-col items-center hover:bg-slate-50 cursor-grab transition-all text-blue-500">
                  {s.icon}
                  <span className="text-[10px] mt-2 font-bold uppercase text-slate-500">{s.label}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="flex-grow relative" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
            onConnect={p => setEdges(eds => addEdge({...p, style:{strokeWidth:3, stroke:'#3b82f6'}}, eds))}
            fitView
          >
            <Background gap={25} size={1} color="#cbd5e1" />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
