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
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Square, Circle, Tablet as Capsule, 
  Hexagon, Router, Server, 
  Database, Lock, Monitor, 
  Network, Share2, PlusSquare, Image as ImageIcon, Wifi
} from 'lucide-react';

// --- STYLING BENTUK ---
const getShapeStyle = (shape: string) => {
  switch (shape) {
    case 'circle': return { borderRadius: '50%' };
    case 'capsule': return { borderRadius: '40px' };
    case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    default: return { borderRadius: '12px' };
  }
};

// --- CUSTOM NODE DENGAN HANDLE AKTIF ---
const SmartShapeNode = ({ data, selected }: any) => {
  const shapeStyle = getShapeStyle(data.shape);
  const isPolygon = data.shape === 'diamond' || data.shape === 'hexagon';

  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center p-2 transition-all ${selected ? 'ring-4 ring-blue-500' : ''}`}
      style={{ 
        background: isPolygon ? 'transparent' : data.bgColor || '#ffffff', 
        border: isPolygon ? 'none' : `3px solid ${data.borderColor || '#2563eb'}`,
        ...shapeStyle
      }}
    >
      {/* Background khusus untuk Polygon agar border tetap muncul */}
      {isPolygon && (
        <div className="absolute inset-0 -z-10" style={{ background: data.borderColor || '#2563eb', padding: '4px', ...shapeStyle }}>
           <div className="w-full h-full" style={{ background: data.bgColor || '#ffffff', ...shapeStyle }} />
        </div>
      )}

      {/* TITIK TARIK GARIS (HANDLE) - Muncul sebagai bulatan biru kecil */}
      <Handle type="source" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 !bg-blue-600 border-2 border-white hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-600 border-2 border-white hover:scale-125 transition-transform" />

      <div className="flex flex-col items-center gap-1 z-10 pointer-events-none">
        <div className="text-slate-800">{data.icon}</div>
        <div className="text-[10px] font-black uppercase text-center leading-tight bg-white/50 px-1 rounded">
          {data.label}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { smartShape: SmartShapeNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');
  const [activeView, setActiveView] = useState<'simulasi' | 'bus' | 'mesh'>('simulasi');

  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    setNodes([]); setEdges([]);
    if (view === 'simulasi') return;

    const newNodes = []; const newEdges = []; const count = 5;
    const time = Date.now();
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `auto-${i}-${time}`, type: 'smartShape',
        position: { x: view === 'bus' ? i * 200 + 50 : 300 + 150 * Math.cos(2*Math.PI*i/count), y: view === 'bus' ? 200 : 250 + 150 * Math.sin(2*Math.PI*i/count) },
        data: { shape: 'square', bgColor: '#ffffff', borderColor: '#2563eb', icon: <Monitor size={20}/>, label: `NODE-${i+1}` },
        style: { width: 90, height: 90 }
      });
    }
    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}-${time}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}-${time}`, source: newNodes[i].id, target: newNodes[j].id });
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
      id: `node_${Date.now()}`, type: 'smartShape',
      position: { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 },
      data: { shape, bgColor: '#ffffff', borderColor: '#2563eb', icon: <ImageIcon size={20}/>, label: 'Ketik...' },
      style: { width: 110, height: 110 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50">
        <div className="flex items-center gap-3 font-black text-blue-900 uppercase italic">Mejatika Lab Jaringan v8</div>
        <button onClick={() => setNodes([])} className="p-2 bg-red-50 text-red-600 rounded-lg"><Eraser size={20}/></button>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-xl">
          <div className="flex p-2 gap-1 border-b bg-slate-100">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-2 text-[10px] font-bold rounded ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-2 text-[10px] font-bold rounded ${activeTab === 'shapes' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>Shapes</button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {activeTab === 'inventory' 
              ? ['router', 'server', 'pc', 'wifi'].map(d => <div key={d} draggable onDragStart={e => e.dataTransfer.setData('application/shape', 'square')} className="p-3 border rounded-xl flex flex-col items-center hover:bg-blue-50 cursor-grab"><Monitor size={20} className="mb-1 text-slate-400"/><span className="text-[8px] uppercase font-bold">{d}</span></div>)
              : ['square', 'circle', 'diamond', 'hexagon', 'capsule'].map(s => <div key={s} draggable onDragStart={e => e.dataTransfer.setData('application/shape', s)} className="p-3 border border-dashed rounded-xl flex flex-col items-center hover:bg-blue-50 cursor-grab"><PlusSquare size={20} className="mb-1 text-blue-500"/><span className="text-[8px] uppercase font-bold">{s}</span></div>)
            }
          </div>
        </aside>

        <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
          {activeTab === 'inventory' && (
            <div className="bg-white border-b px-6 py-2 flex gap-2 z-40">
              <button onClick={() => handleTopologyChange('simulasi')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${activeView === 'simulasi' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Simulasi</button>
              <button onClick={() => handleTopologyChange('bus')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${activeView === 'bus' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Bus</button>
              <button onClick={() => handleTopologyChange('mesh')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${activeView === 'mesh' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Mesh</button>
            </div>
          )}

          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            connectionMode={ConnectionMode.Loose}
            onConnect={p => setEdges(eds => addEdge({...p, animated:true, style:{strokeWidth:3, stroke:'#2563eb'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={20} size={1} color="#e2e8f0" />
            <Controls />
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-xl p-3 min-w-[180px]">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[<Router size={16}/>, <Server size={16}/>, <Database size={16}/>, <Wifi size={16}/>].map((icon, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon}} : n))} className="p-2 border rounded hover:bg-blue-50 flex justify-center">{icon}</button>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  {['#16a34a', '#dc2626', '#2563eb', '#ca8a04'].map(c => (
                    <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, bgColor:c+'20', borderColor:c}} : n))} className="w-6 h-6 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-1.5 text-[9px] text-red-600 font-bold uppercase bg-red-50 rounded">Hapus</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
