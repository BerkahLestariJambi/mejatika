'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, PlusSquare
} from 'lucide-react';

// --- SVG CLOUD GENERATOR ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE ---
const UniversalNode = ({ data, selected }: any) => {
  const isCloud = data.shapeType === 'cloud';
  const isCircle = data.shapeType === 'circle';
  const isChat = data.shapeType === 'chat';

  const getBaseStyle = (): React.CSSProperties => {
    if (isCloud) return { backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), backgroundSize: '100% 100%', padding: '40px' };
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: isCircle ? '50%' : isChat ? '15px 15px 15px 0' : '12px',
      padding: '15px',
    };
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center transition-all ${selected ? 'scale-105' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-600 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 w-2 h-2" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 w-2 h-2" />

      <div style={getBaseStyle()} className="w-full h-full flex flex-col items-center justify-center text-center shadow-md">
        <div className="text-slate-700 mb-1">{data.icon}</div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 overflow-hidden"
          rows={2}
        />
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

  // Reset Canvas saat ganti Tab
  useEffect(() => {
    setNodes([]); setEdges([]);
    setActiveView('simulasi');
  }, [activeTab]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const updateNodeIcon = (id: string, icon: any) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, icon } } : n));
    setMenu(null);
  };

  // --- LOGIKA TOPOLOGI OTOMATIS (MODE INVENTORY) ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    if (view === 'simulasi') { setNodes([]); setEdges([]); return; }
    
    const count = 5;
    const newNodes = []; const newEdges = [];
    for (let i = 0; i < count; i++) {
      const id = `node-${i}-${Date.now()}`;
      newNodes.push({
        id, type: 'universal',
        position: { x: view === 'bus' ? i * 220 + 50 : 350 + 180 * Math.cos(2*Math.PI*i/count), y: 250 + (view === 'mesh' ? 180 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { icon: <Monitor size={28}/>, label: `DEVICE ${i+1}`, borderColor: '#3b82f6', onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 110, height: 110 }
      });
    }
    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 4, stroke: '#3b82f6' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const position = { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 60 };
    const id = `node_${Date.now()}`;

    const iconMap: any = {
      router: <Router size={32}/>, switch: <Network size={32}/>, pc: <Monitor size={32}/>,
      wifi: <Wifi size={32}/>, server: <Server size={32}/>, cloud: <Cloud size={32}/>,
      circle: <Circle size={32}/>, square: <Square size={32}/>, chat: <MessageSquare size={32}/>
    };

    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { 
        shapeType: val, icon: iconMap[val], label: 'KETIK...', 
        bgColor: '#ffffff', borderColor: activeTab === 'inventory' ? '#2563eb' : '#64748b',
        onChange: (v: string) => onNodeLabelChange(id, v) 
      },
      style: { width: val === 'cloud' ? 180 : 120, height: val === 'cloud' ? 150 : 120 }
    }));
  }, [activeTab]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl">
        <div className="p-6 border-b bg-blue-900 text-white font-black italic uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={24}/> Mejatika Lab V14
        </div>
        <div className="flex border-b bg-slate-50">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {activeTab === 'inventory' ? (
            ['router', 'switch', 'pc', 'wifi', 'server'].map(d => (
              <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="p-4 border rounded-2xl flex flex-col items-center hover:bg-blue-50 cursor-grab group">
                {d === 'router' ? <Router size={28}/> : d === 'switch' ? <Network size={28}/> : d === 'pc' ? <Monitor size={28}/> : d === 'wifi' ? <Wifi size={28}/> : <Server size={28}/>}
                <span className="text-[9px] font-black uppercase mt-2">{d}</span>
              </div>
            ))
          ) : (
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-4 border-2 border-dashed rounded-2xl flex flex-col items-center hover:border-emerald-500 hover:bg-emerald-50 cursor-grab group">
                <PlusSquare size={28} className="text-emerald-500"/>
                <span className="text-[9px] font-black uppercase mt-2 text-slate-500">{s}</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-auto p-4 border-t">
          <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg"><Camera size={16}/> Cetak Canvas PDF</button>
        </div>
      </aside>

      {/* CANVAS */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {activeTab === 'inventory' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-40 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-xl border">
            {['simulasi', 'bus', 'mesh'].map(v => (
              <button key={v} onClick={() => handleTopologyChange(v as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === v ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{v}</button>
            ))}
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({...p, animated: activeTab === 'inventory', style:{strokeWidth: 4, stroke: activeTab === 'inventory' ? '#3b82f6' : '#94a3b8'}}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
          fitView
        >
          <Background gap={25} size={1} color="#cbd5e1" />
          <Controls />
          
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px] animate-in zoom-in-95 duration-200">
              <p className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-tighter">Setting {activeTab === 'shapes' ? 'Warna' : 'Perangkat'}</p>
              
              <div className="flex gap-2 mb-4">
                {['#22c55e', '#ef4444', '#3b82f6', '#eab308', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-8 h-8 rounded-full border shadow-sm" style={{ background: c }} />
                ))}
              </div>

              {activeTab === 'inventory' && (
                <div className="grid grid-cols-4 gap-2 mb-4 border-t pt-3">
                  <button onClick={() => updateNodeIcon(menu.id, <Router size={24}/>)} className="p-2 border rounded hover:bg-slate-100"><Router size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Network size={24}/>)} className="p-2 border rounded hover:bg-slate-100"><Network size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Monitor size={24}/>)} className="p-2 border rounded hover:bg-slate-100"><Monitor size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Server size={24}/>)} className="p-2 border rounded hover:bg-slate-100"><Server size={16}/></button>
                </div>
              )}

              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"><Eraser size={14}/> Hapus</button>
            </div>
          )}
        </ReactFlow>
      </div>
      
      {/* CSS KHUSUS UNTUK PRINT CANVAS SAJA */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .react-flow__viewport, .react-flow__viewport * { visibility: visible; }
          .react-flow__viewport { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; }
        }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
