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
  MarkerType,
  ConnectionMode,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Cloud, Monitor, Network, Share2, PlusSquare, 
  Router, Server, Wifi, Database, Circle
} from 'lucide-react';

// --- STYLING BENTUK AWAN (MIND MAP STYLE) ---
const getMindMapStyle = (shape: string, bgColor: string, borderColor: string) => {
  const common = {
    background: bgColor || '#ffedd5',
    border: `3px solid ${borderColor || '#fb923c'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
  };

  switch (shape) {
    case 'cloud':
      return { 
        ...common,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
      };
    case 'circle':
      return { ...common, borderRadius: '50%' };
    case 'bubble':
      return { 
        ...common, 
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' 
      };
    default:
      return { ...common, borderRadius: '20px' };
  }
};

// --- CUSTOM NODE UNTUK MIND MAP ---
const MindMapNode = ({ data, selected }: any) => {
  const style = getMindMapStyle(data.shape, data.bgColor, data.borderColor);

  return (
    <div className={`relative w-full h-full transition-all ${selected ? 'scale-105 z-20' : ''}`}>
      {/* HANDLES YANG DISAMARKAN TAPI AKTIF */}
      <Handle type="source" position={Position.Top} className="!bg-black/20 !border-none w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-black/20 !border-none w-2 h-2" />
      <Handle type="source" position={Position.Left} className="!bg-black/20 !border-none w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-black/20 !border-none w-2 h-2" />

      <div style={style} className="w-full h-full text-center">
        <div className="flex flex-col items-center gap-1">
          {data.icon}
          <textarea
            placeholder="Tulis..."
            className="bg-transparent border-none text-[12px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight text-slate-800 placeholder:text-slate-400"
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('shapes');
  const [activeView, setActiveView] = useState<'simulasi' | 'bus' | 'mesh'>('simulasi');

  // Logic Generate Topologi
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    setNodes([]); setEdges([]);
    if (view === 'simulasi') return;

    const count = 5; const time = Date.now();
    const newNodes = []; const newEdges = [];

    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `node-${i}-${time}`, type: 'mindMap',
        position: { x: view === 'bus' ? i * 220 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), y: 300 + (view === 'mesh' ? 200 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { shape: 'cloud', bgColor: '#f0f9ff', borderColor: '#0ea5e9', label: `TOPOLOGI ${i+1}` },
        style: { width: 140, height: 100 }
      });
    }
    
    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, type: 'step', animated: true });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: false });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const shape = event.dataTransfer.getData('application/shape');
    if (!reactFlowWrapper.current || !shape) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    
    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`, type: 'mindMap',
      position: { x: event.clientX - rect.left - 70, y: event.clientY - rect.top - 50 },
      data: { shape, bgColor: '#fdf4ff', borderColor: '#d946ef', label: 'KONSEP BARU' },
      style: { width: 150, height: 110 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* HEADER */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-4 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-2xl text-white shadow-lg"><Share2 size={24} /></div>
          <h1 className="text-lg font-black uppercase italic text-slate-800 tracking-tighter">Mejatika Mind Lab</h1>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase shadow-xl hover:bg-orange-600 transition-all"><Camera size={18}/> CETAK PDF</button>
      </nav>

      <div className="flex flex-grow relative">
        {/* SIDEBAR */}
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex p-2 bg-slate-50 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-orange-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-orange-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
            {activeTab === 'inventory' ? (
              ['router', 'switch', 'pc', 'wifi'].map(d => (
                <div key={d} draggable onDragStart={e => e.dataTransfer.setData('application/shape', 'cloud')} className="p-4 border-2 border-slate-100 rounded-3xl flex flex-col items-center hover:bg-orange-50 hover:border-orange-200 cursor-grab transition-all">
                  <div className="bg-slate-50 p-3 rounded-2xl mb-2 text-slate-400"><Monitor size={24}/></div>
                  <span className="text-[10px] font-black uppercase">{d}</span>
                </div>
              ))
            ) : (
              [
                { id: 'cloud', icon: <Cloud/>, label: 'Awan' },
                { id: 'circle', icon: <Circle/>, label: 'Bulat' },
                { id: 'bubble', icon: <Share2/>, label: 'Bubble' },
                { id: 'square', icon: <PlusSquare/>, label: 'Box' }
              ].map(s => (
                <div key={s.id} draggable onDragStart={e => e.dataTransfer.setData('application/shape', s.id)} className="p-4 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center hover:bg-orange-50 hover:border-orange-500 cursor-grab transition-all group">
                  <div className="text-slate-300 group-hover:text-orange-500 mb-2">{s.icon}</div>
                  <span className="text-[10px] font-black uppercase text-slate-500">{s.label}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* AREA CANVAS */}
        <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
          {activeTab === 'inventory' && (
            <div className="bg-white/80 backdrop-blur-md border-b px-6 py-3 flex gap-3 z-40 shadow-sm absolute top-0 w-full justify-center">
              <button onClick={() => handleTopologyChange('simulasi')} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase transition-all ${activeView === 'simulasi' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>Simulasi</button>
              <button onClick={() => handleTopologyChange('bus')} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase transition-all ${activeView === 'bus' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>Bus</button>
              <button onClick={() => handleTopologyChange('mesh')} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase transition-all ${activeView === 'mesh' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>Mesh</button>
            </div>
          )}

          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            connectionMode={ConnectionMode.Loose}
            onConnect={p => setEdges(eds => addEdge({...p, animated:false, style:{strokeWidth:4, stroke:'#94a3b8'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#f1f5f9" />
            <Controls />

            {/* CONTEXT MENU UNTUK WARNA & ICON */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-3xl p-4 min-w-[200px] animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[<Wifi size={18}/>, <Database size={18}/>, <Router size={18}/>, <Server size={18}/>].map((icon, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon}} : n))} className="p-2 border rounded-xl hover:bg-orange-50 flex justify-center text-slate-600">{icon}</button>
                  ))}
                </div>
                <div className="flex justify-between mb-4">
                  {[
                    { b: '#f0fdf4', s: '#22c55e' }, // Green
                    { b: '#fef2f2', s: '#ef4444' }, // Red
                    { b: '#eff6ff', s: '#3b82f6' }, // Blue
                    { b: '#fefce8', s: '#eab308' }, // Yellow
                    { b: '#fff7ed', s: '#f97316' }, // Orange
                  ].map((c, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, bgColor:c.b, borderColor:c.s}} : n))} className="w-7 h-7 rounded-full shadow-inner border-2 border-white" style={{ background: c.s }} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 text-xs text-red-600 font-black uppercase bg-red-50 rounded-xl hover:bg-red-100">Hapus Konsep</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
