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
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Monitor, Network, Share2, PlusSquare, 
  Router, Server, Wifi, Database, Circle, Cloud
} from 'lucide-react';

// --- SVG CLOUD PATH GENERATOR (GERIGI NYATA) ---
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
        backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'),
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        padding: '35px',
      };
    }
    return {
      background: isDevice ? 'white' : (data.bgColor || '#ffffff'),
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: data.shape === 'circle' ? '50%' : '16px',
      padding: '15px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    };
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center transition-all ${selected ? 'scale-110 z-50' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-600 w-2.5 h-2.5 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 w-2.5 h-2.5 border-2 border-white" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600 w-2.5 h-2.5 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 w-2.5 h-2.5 border-2 border-white" />

      <div style={getBaseStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="text-slate-700">{data.icon}</div>
        <div className="mt-1 text-[10px] font-black uppercase text-slate-800 leading-tight">
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
  const [activeView, setActiveView] = useState<'simulasi' | 'bus' | 'mesh'>('simulasi');

  // --- LOGIKA TOPOLOGI DENGAN KABEL BERKEDIP ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    setNodes([]); setEdges([]);
    if (view === 'simulasi') return;

    const count = 5; const time = Date.now();
    const newNodes = []; const newEdges = [];

    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `auto-${i}-${time}`, type: 'universal',
        position: { x: view === 'bus' ? i * 220 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), y: 250 + (view === 'mesh' ? 200 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', value: 'pc', icon: <Monitor size={28}/>, label: `PC-${i+1}`, borderColor: '#3b82f6' },
        style: { width: 100, height: 100 }
      });
    }

    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) {
        newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 4, stroke: '#3b82f6' } });
      }
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' } });
        }
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

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
      id: `node_${Date.now()}`, type: 'universal', position,
      data: { type, value, icon: iconMap[value] || <PlusSquare size={32}/>, label: value, bgColor: '#ffffff', borderColor: '#2563eb' },
      style: { width: type === 'cloud' ? 180 : 110, height: type === 'cloud' ? 140 : 110 }
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50">
        <div className="flex items-center gap-3 font-black text-blue-900 uppercase italic"><ShieldCheck size={28}/> Mejatika Lab V11</div>
        <button onClick={() => window.print()} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"><Camera size={18}/> Cetak PDF</button>
      </nav>

      <div className="flex flex-grow relative">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex p-2 bg-slate-100 border-b gap-1">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
            {activeTab === 'inventory' ? (
              ['router', 'switch', 'pc', 'wifi', 'server'].map(d => (
                <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="p-4 border-2 border-slate-50 rounded-2xl flex flex-col items-center hover:bg-blue-50 cursor-grab transition-all group">
                  <div className="group-hover:scale-110 transition-transform"><Monitor size={24} className="text-slate-400"/></div>
                  <span className="text-[9px] mt-2 font-black uppercase">{d}</span>
                </div>
              ))
            ) : (
              ['cloud', 'circle', 'square'].map(s => (
                <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', s === 'cloud' ? 'cloud' : 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center hover:border-blue-500 cursor-grab text-blue-500">
                  <PlusSquare size={24}/>
                  <span className="text-[9px] mt-2 font-black uppercase text-slate-500">{s}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
          {/* TAB SIMULASI - SEKARANG MUNCUL LAGI */}
          <div className="bg-white/90 backdrop-blur border-b px-6 py-2 flex gap-3 z-40 justify-center shadow-sm">
            <button onClick={() => handleTopologyChange('simulasi')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === 'simulasi' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>Simulasi</button>
            <button onClick={() => handleTopologyChange('bus')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === 'bus' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>Tab Bus</button>
            <button onClick={() => handleTopologyChange('mesh')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === 'mesh' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>Tab Mesh</button>
          </div>

          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
            onConnect={p => setEdges(eds => addEdge({...p, animated:true, style:{strokeWidth:4, stroke:'#3b82f6'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            fitView
          >
            <Background gap={25} size={1} color="#cbd5e1" />
            <Controls />
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[180px]">
                <div className="flex gap-2 mb-4">
                  {['#22c55e', '#ef4444', '#3b82f6', '#eab308'].map(c => (
                    <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, borderColor:c}} : n))} className="w-8 h-8 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 text-[10px] text-red-600 font-black uppercase bg-red-50 rounded-xl">Hapus</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
