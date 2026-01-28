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

// --- HELPER UNTUK BENTUK ---
const getShapeStyle = (shape: string) => {
  switch (shape) {
    case 'circle': return { borderRadius: '50%' };
    case 'capsule': return { borderRadius: '40px' };
    case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    default: return { borderRadius: '12px' };
  }
};

// --- CUSTOM SMART NODE ---
const SmartShapeNode = ({ data, selected }: any) => {
  const shapeStyle = getShapeStyle(data.shape);
  const isPolygon = data.shape === 'diamond' || data.shape === 'hexagon';

  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center p-2 transition-all ${selected ? 'ring-4 ring-blue-400' : ''}`}
      style={{ 
        background: isPolygon ? 'transparent' : data.bgColor || '#ffffff', 
        border: isPolygon ? 'none' : `4px solid ${data.borderColor || '#2563eb'}`,
        ...shapeStyle
      }}
    >
      {isPolygon && (
        <div className="absolute inset-0 -z-10" style={{ background: data.borderColor || '#2563eb', padding: '4px', ...shapeStyle }}>
           <div className="w-full h-full" style={{ background: data.bgColor || '#ffffff', ...shapeStyle }} />
        </div>
      )}

      <Handle type="source" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="source" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />

      <div className="flex flex-col items-center gap-1 z-10 pointer-events-none">
        {data.icon}
        <div className="text-[10px] font-black uppercase text-center leading-tight whitespace-pre-wrap">
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

  // --- LOGIKA GENERATE TOPOLOGI ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    setNodes([]);
    setEdges([]);
    if (view === 'simulasi') return;

    const newNodes = []; const newEdges = []; const count = 5;
    const time = Date.now();

    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `node-${i}-${time}`,
        type: 'smartShape',
        position: { 
          x: view === 'bus' ? i * 200 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), 
          y: view === 'bus' ? 250 : 250 + 200 * Math.sin(2*Math.PI*i/count) 
        },
        data: { shape: 'square', bgColor: '#ffffff', borderColor: '#2563eb', icon: <Monitor size={20}/>, label: `PC-${i+1}` },
        style: { width: 100, height: 100 }
      });
    }

    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}-${time}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}-${time}`, source: newNodes[i].id, target: newNodes[j].id });
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const shape = event.dataTransfer.getData('application/shape');
    if (!reactFlowWrapper.current || !shape) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const pos = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };

    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`, type: 'smartShape', position: pos,
      data: { shape: shape, bgColor: '#ffffff', borderColor: '#2563eb', icon: <ImageIcon size={20}/>, label: 'Ketik...' },
      style: { width: 120, height: 120 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Lab Jaringan v7</h1>
        </div>
        <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase italic"><Camera size={18}/></button>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-xl">
          <div className="flex bg-slate-100 p-2 gap-1 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {activeTab === 'inventory' ? (
                ['router', 'server', 'pc', 'wifi'].map((dev) => (
                  <div key={dev} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', 'square')} className="p-4 border-2 rounded-2xl flex flex-col items-center hover:bg-blue-50 cursor-grab">
                    <div className="p-3 bg-slate-100 rounded-lg mb-2"><Monitor size={20}/></div>
                    <span className="text-[9px] font-black uppercase">{dev}</span>
                  </div>
                ))
              ) : (
                ['square', 'circle', 'diamond', 'hexagon', 'capsule'].map((s) => (
                  <div key={s} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', s)} className="p-4 border-2 border-dashed rounded-2xl flex flex-col items-center hover:border-blue-500 cursor-grab">
                    <PlusSquare size={20} className="text-blue-500 mb-2"/>
                    <span className="text-[9px] font-black uppercase">{s}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="flex-grow relative flex flex-col" ref={reactFlowWrapper}>
          {activeTab === 'inventory' && (
            <div className="bg-white border-b px-6 py-2 flex items-center gap-2 z-40 shadow-sm">
              <button onClick={() => handleTopologyChange('simulasi')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'simulasi' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}><PlusSquare size={14} className="inline mr-1"/> Area Simulasi</button>
              <button onClick={() => handleTopologyChange('bus')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'bus' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Network size={14} className="inline mr-1"/> Tab Bus</button>
              <button onClick={() => handleTopologyChange('mesh')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'mesh' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Share2 size={14} className="inline mr-1"/> Tab Mesh</button>
            </div>
          )}

          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
            connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:3, stroke:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#cbd5e1" />
            <Controls />

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px]">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[<Router size={18}/>, <Server size={18}/>, <Database size={18}/>, <Wifi size={18}/>].map((icon, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon}} : n))} className="p-2 border rounded-lg hover:bg-blue-50 flex justify-center">{icon}</button>
                  ))}
                </div>
                <div className="flex justify-between gap-2 mb-4">
                  {['#16a34a', '#dc2626', '#2563eb', '#ca8a04'].map((c, i) => (
                    <button key={i} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, bgColor:c+'20', borderColor:c}} : n))} className="w-8 h-8 rounded-full shadow-md" style={{ background: c }} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 text-[10px] text-red-600 font-black uppercase bg-red-50 rounded-lg">Hapus</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
