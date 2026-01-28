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
  Panel,
  MarkerType,
  ConnectionMode,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Square, Circle, Tablet as Capsule, 
  Hexagon, Triangle, Cloud,
  Router, Server, Globe, Wifi, Database, User, Cpu, Lock,
  Monitor, Network, Share2, PlusSquare, Image as ImageIcon
} from 'lucide-react';

// --- CUSTOM SHAPE NODE DENGAN 4 TITIK KONEKSI ---
const SmartShapeNode = ({ data, selected }: any) => {
  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center p-2 transition-all ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{ 
        background: data.bgColor || '#ffffff', 
        border: `3px solid ${data.borderColor || '#2563eb'}`,
        borderRadius: data.shape === 'circle' ? '50%' : data.shape === 'capsule' ? '40px' : '12px',
        clipPath: data.clipPath || 'none'
      }}
    >
      {/* 4 Handles untuk Tarik Garis Bebas */}
      <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />

      <div className="flex flex-col items-center gap-1 w-full">
        {data.icon}
        <textarea 
          placeholder="Ketik..." 
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight overflow-hidden"
          rows={2}
          defaultValue={data.label}
        />
      </div>
    </div>
  );
};

const nodeTypes = { smartShape: SmartShapeNode };

const iconList = [
  { id: 'router', icon: <Router size={22}/> },
  { id: 'server', icon: <Server size={22}/> },
  { id: 'globe', icon: <Globe size={22}/> },
  { id: 'wifi', icon: <Wifi size={22}/> },
  { id: 'db', icon: <Database size={22}/> },
  { id: 'user', icon: <User size={22}/> },
  { id: 'lock', icon: <Lock size={22}/> },
  { id: 'img', icon: <ImageIcon size={22}/> },
];

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  // --- LOGIKA WARNA & ICON ---
  const updateNodeProperties = (id: string, color: string, border: string, iconObj?: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        return { 
          ...n, 
          data: { ...n.data, bgColor: color, borderColor: border, icon: iconObj || n.data.icon }
        };
      }
      return n;
    }));
    setMenu(null);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const shape = event.dataTransfer.getData('application/shape');
    const device = event.dataTransfer.getData('application/reactflow');
    if (!reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 60 };

    let nodeData = { 
      label: '', 
      shape, 
      bgColor: '#ffffff', 
      borderColor: '#2563eb',
      icon: <Network size={22}/> 
    };

    // Setting ClipPath untuk bentuk unik
    if (shape === 'diamond') (nodeData as any).clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    if (shape === 'hexagon') (nodeData as any).clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`,
      type: 'smartShape',
      position,
      data: nodeData,
      style: { width: 130, height: 130 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Visual Lab v5</h1>
        </div>
        <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all"><Camera size={18}/></button>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex bg-slate-100 p-2 gap-1 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Smart Shapes</button>
          </div>

          <div className="p-5 overflow-y-auto flex-grow">
            {activeTab === 'inventory' ? (
              <div className="grid grid-cols-2 gap-3">
                {['router', 'server', 'pc', 'wifi'].map((dev) => (
                  <div key={dev} draggable onDragStart={(e) => { e.dataTransfer.setData('application/shape', 'square'); e.dataTransfer.setData('application/reactflow', dev); }} className="flex flex-col items-center p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all">
                    <div className="bg-slate-100 p-4 rounded-xl mb-2">{dev === 'router' ? <Router/> : dev === 'server' ? <Server/> : dev === 'pc' ? <Monitor/> : <Wifi/>}</div>
                    <span className="text-[9px] font-black uppercase text-slate-500">{dev}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'square', icon: <Square/> },
                  { id: 'circle', icon: <Circle/> },
                  { id: 'capsule', icon: <Capsule/> },
                  { id: 'diamond', icon: <PlusSquare className="rotate-45"/> },
                  { id: 'hexagon', icon: <Hexagon/> },
                  { id: 'cloud', icon: <Cloud/> },
                ].map((s) => (
                  <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', s.id)} className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all">
                    <div className="text-slate-400 mb-2">{s.icon}</div>
                    <span className="text-[9px] font-black uppercase text-slate-700">{s.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
            connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:3, stroke:'#2563eb'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#cbd5e1" />
            <Controls />

            {/* CONTEXT MENU: GANTI ICON & WARNA SOLID */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[240px]">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest text-center">Custom Node</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {iconList.map((item) => (
                    <button key={item.id} onClick={() => updateNodeProperties(menu.id, '', '', item.icon)} className="p-2 border rounded-lg hover:bg-blue-50 text-slate-600 flex justify-center">{item.icon}</button>
                  ))}
                </div>
                <div className="flex justify-between gap-2 mb-4">
                  {[
                    { bg: '#dcfce7', border: '#16a34a' }, // Green
                    { bg: '#fee2e2', border: '#dc2626' }, // Red
                    { bg: '#eff6ff', border: '#2563eb' }, // Blue
                    { bg: '#fef9c3', border: '#ca8a04' }, // Yellow
                  ].map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => updateNodeProperties(menu.id, c.bg, c.border)} 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md" 
                      style={{ background: c.border }} 
                    />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id)) || setMenu(null)} className="w-full py-2 text-[10px] text-red-600 font-black uppercase bg-red-50 rounded-lg">Hapus Node</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
