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
  Router, Server, Wifi, Database, Circle, Cpu
} from 'lucide-react';

// --- FUNGSI GENERATOR AWAN GERIGI (SVG) ---
// Membuat background SVG dinamis dengan gerigi lengkungan yang nyata
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE UNTUK MIND MAP & NETWORK ---
const MindMapNode = ({ data, selected }: any) => {
  const isCloud = data.shape === 'cloud';
  
  const nodeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
  };

  const cloudStyle: React.CSSProperties = {
    backgroundImage: getCloudPath(data.bgColor || '#f0f9ff', data.borderColor || '#0ea5e9'),
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    padding: '30px', // Padding lebih besar agar teks di tengah gerigi
  };

  const boxStyle: React.CSSProperties = {
    background: data.bgColor || '#ffffff',
    border: `3px solid ${data.borderColor || '#cbd5e1'}`,
    borderRadius: data.shape === 'circle' ? '50%' : '16px',
    padding: '15px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="relative w-full h-full group">
      {/* HANDLES */}
      <Handle type="source" position={Position.Top} className="!bg-blue-400 !border-2 !border-white w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !border-2 !border-white w-3 h-3" />
      <Handle type="source" position={Position.Left} className="!bg-blue-400 !border-2 !border-white w-3 h-3" />
      <Handle type="source" position={Position.Right} className="!bg-blue-400 !border-2 !border-white w-3 h-3" />

      <div style={{ ...nodeStyle, ...(isCloud ? cloudStyle : boxStyle) }}>
        <div className="flex flex-col items-center gap-2">
          <div className="text-slate-700">{data.icon}</div>
          <textarea
            placeholder="Label..."
            className="bg-transparent border-none text-[12px] font-bold uppercase text-center focus:ring-0 resize-none w-full leading-tight text-slate-800"
            rows={2}
            defaultValue={data.label}
          />
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { mindMap: MindMapNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); // 'device' atau 'shape'
    const value = event.dataTransfer.getData('application/value');
    
    if (!reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 75, y: event.clientY - rect.top - 55 };

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'mindMap',
      position,
      data: { 
        shape: type === 'shape' ? value : 'cloud', // Default cloud untuk device
        bgColor: '#ffffff', 
        borderColor: '#2563eb', 
        label: value.toUpperCase(),
        icon: value === 'router' ? <Router size={24}/> : 
              value === 'switch' ? <Network size={24}/> : 
              value === 'pc' ? <Monitor size={24}/> : 
              value === 'wifi' ? <Wifi size={24}/> : <PlusSquare size={24}/>
      },
      style: { width: 160, height: 120 }
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* HEADER */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-4 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-lg font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Lab Jaringan V10</h1>
        </div>
        <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Camera size={18}/> CETAK PDF</button>
      </nav>

      <div className="flex flex-grow relative">
        {/* SIDEBAR */}
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-xl">
          <div className="flex p-2 bg-slate-50 border-b gap-1">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            {activeTab === 'inventory' ? (
              [
                { id: 'router', icon: <Router size={28} className="text-blue-600"/>, label: 'Router' },
                { id: 'switch', icon: <Network size={28} className="text-indigo-600"/>, label: 'Switch' },
                { id: 'pc', icon: <Monitor size={28} className="text-slate-700"/>, label: 'Komp PC' },
                { id: 'wifi', icon: <Wifi size={28} className="text-orange-500"/>, label: 'Access Point' },
                { id: 'server', icon: <Server size={28} className="text-emerald-600"/>, label: 'Server' },
                { id: 'database', icon: <Database size={28} className="text-amber-600"/>, label: 'Database' },
              ].map(d => (
                <div key={d.id} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d.id); }} className="p-4 border-2 border-slate-100 rounded-2xl flex flex-col items-center hover:bg-blue-50 cursor-grab transition-all group">
                  <div className="mb-2 transition-transform group-hover:scale-110">{d.icon}</div>
                  <span className="text-[10px] font-black uppercase text-slate-500">{d.label}</span>
                </div>
              ))
            ) : (
              [
                { id: 'cloud', icon: <Cloud size={28} className="text-sky-500"/>, label: 'Cloud' },
                { id: 'bubble', icon: <Share2 size={28} className="text-purple-500"/>, label: 'Bubble' },
                { id: 'circle', icon: <Circle size={28} className="text-slate-400"/>, label: 'Bulat' },
                { id: 'square', icon: <PlusSquare size={28} className="text-slate-400"/>, label: 'Kotak' },
              ].map(s => (
                <div key={s.id} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s.id); }} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center hover:border-blue-500 cursor-grab transition-all">
                  <div className="mb-2">{s.icon}</div>
                  <span className="text-[10px] font-black uppercase text-slate-400">{s.label}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* CANVAS AREA */}
        <div className="flex-grow relative" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            connectionMode={ConnectionMode.Loose}
            onConnect={p => setEdges(eds => addEdge({...p, style:{strokeWidth:4, stroke:'#94a3b8'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#cbd5e1" />
            <Controls />

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px]">
                <div className="flex justify-between gap-2 mb-4">
                  {[
                    { b: '#dcfce7', s: '#22c55e' }, // Green
                    { b: '#fee2e2', s: '#ef4444' }, // Red
                    { b: '#eff6ff', s: '#3b82f6' }, // Blue
                    { b: '#fefce8', s: '#eab308' }, // Yellow
                  ].map((c, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, bgColor:c.b, borderColor:c.s}} : n))} className="w-8 h-8 rounded-full shadow-md" style={{ background: c.s }} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 text-xs text-red-600 font-black uppercase bg-red-50 rounded-xl hover:bg-red-100 transition-colors">Hapus Objek</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
