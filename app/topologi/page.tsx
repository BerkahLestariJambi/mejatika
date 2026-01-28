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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  ShieldCheck, Eraser, Camera, 
  Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, PlusSquare, Copy, Edit3,
  Zap, HardDrive, DoorOpen, Flame, Radio, Layout
} from 'lucide-react';

// --- SVG CLOUD GENERATOR ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- ICON LIBRARY ---
const iconLib: any = {
  router: <Router size={48} strokeWidth={1.5}/>,
  switch: <Network size={48} strokeWidth={1.5}/>,
  pc: <Monitor size={48} strokeWidth={1.5}/>,
  wifi: <Wifi size={48} strokeWidth={1.5}/>,
  server: <Server size={48} strokeWidth={1.5}/>,
  hub: <Zap size={48} strokeWidth={1.5}/>,
  bridge: <HardDrive size={48} strokeWidth={1.5}/>,
  gateway: <DoorOpen size={48} strokeWidth={1.5}/>,
  firewall: <Flame size={48} strokeWidth={1.5}/>,
  ap: <Radio size={48} strokeWidth={1.5}/>,
  cloud: <Cloud size={40}/>,
  circle: <Circle size={40}/>,
  square: <Square size={40}/>,
  chat: <MessageSquare size={40}/>
};

// --- CUSTOM NODE ENGINE ---
const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const isChat = data.shapeType === 'chat';
  
  const getNodeStyle = (): React.CSSProperties => {
    if (isDevice) return { background: 'transparent', border: 'none' };
    if (isCloud) return { 
      backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), 
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
      padding: '45px 30px', border: 'none', backgroundColor: 'transparent'
    };
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: data.shapeType === 'circle' ? '50%' : isChat ? '4px 4px 4px 0' : '12px',
      padding: '15px',
    };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-110 drop-shadow-2xl' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />

      <div style={getNodeStyle()} className={`w-full h-full flex flex-col items-center justify-center text-center ${(!isDevice && !isCloud) && 'shadow-md'}`}>
        <div className={`${isDevice ? 'text-blue-700' : 'text-slate-700'} mb-1 scale-125`}>
          {data.icon}
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className={`bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1 overflow-hidden transition-all ${isDevice ? 'text-blue-900 bg-white/60 rounded px-1' : 'text-slate-800'}`}
          rows={isDevice ? 1 : 3}
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

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const duplicateNode = (nodeId: string) => {
    const nodeToCopy = nodes.find(n => n.id === nodeId);
    if (!nodeToCopy) return;
    const newId = `node_dup_${Date.now()}`;
    setNodes((nds) => nds.concat({
      ...nodeToCopy, id: newId, position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
      data: { ...nodeToCopy.data, onChange: (v: string) => onNodeLabelChange(newId, v) }
    }));
    setMenu(null);
  };

  // --- FITUR TOPOLOGI OTOMATIS (YANG HILANG TADI) ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    if (view === 'simulasi') { setNodes([]); setEdges([]); return; }
    const count = 5;
    const newNodes = []; const newEdges = [];
    for (let i = 0; i < count; i++) {
      const id = `auto-${i}-${Date.now()}`;
      newNodes.push({
        id, type: 'universal',
        position: { x: view === 'bus' ? i * 220 + 50 : 350 + 180 * Math.cos(2*Math.PI*i/count), y: 250 + (view === 'mesh' ? 180 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', icon: iconLib.pc, label: `PC-${i+1}`, onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      });
    }
    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: false, style: { strokeWidth: 3, stroke: '#334155' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#334155' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: false, style: { strokeWidth: 3, stroke: '#334155' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#334155' } });
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
    const position = { x: event.clientX - rect.left - 75, y: event.clientY - rect.top - 75 };
    const id = `node_${Date.now()}`;

    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { 
        type, shapeType: val, icon: (type === 'device' || val === 'chat') ? iconLib[val] : null, label: val.toUpperCase(), 
        bgColor: type === 'device' ? '#ffffff' : (val === 'cloud' ? '#f0fdf4' : '#ffffff'), 
        borderColor: type === 'device' ? '#2563eb' : '#64748b',
        onChange: (v: string) => onNodeLabelChange(id, v) 
      },
      style: { width: type === 'device' ? 85 : 180, height: type === 'device' ? 85 : 150 }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl print:hidden">
        <div className="p-6 bg-blue-900 text-white font-black italic uppercase tracking-tighter flex items-center gap-2 text-[13px]">
          <ShieldCheck size={28}/> MEJATIKA LAB SANPIO | XII INF
        </div>
        
        {/* TAB TOPOLOGI OTOMATIS */}
        <div className="flex bg-slate-200 p-1 m-4 rounded-xl">
          {(['simulasi', 'bus', 'mesh'] as const).map((v) => (
            <button key={v} onClick={() => handleTopologyChange(v)} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${activeView === v ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{v}</button>
          ))}
        </div>

        <div className="flex bg-slate-50 border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            ['router', 'switch', 'pc', 'wifi', 'server', 'hub', 'bridge', 'gateway', 'firewall', 'ap'].map(d => (
              <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="flex flex-col items-center justify-center p-4 border border-transparent hover:border-blue-200 hover:bg-blue-50 rounded-2xl cursor-grab transition-all group text-center">
                <div className="text-blue-600 group-hover:scale-110 transition-transform">
                  {iconLib[d]}
                </div>
                <span className="text-[9px] font-bold uppercase mt-2 text-slate-600">{d === 'ap' ? 'Access Point' : d}</span>
              </div>
            ))
          ) : (
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center hover:bg-emerald-50 hover:border-emerald-500 cursor-grab transition-all group">
                {iconLib[s]}
                <span className="text-[10px] font-bold uppercase mt-2 text-slate-500">{s}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto p-4 border-t bg-slate-50">
          <button onClick={() => window.print()} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl active:scale-95"><Camera size={18}/> Export PDF</button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({
            ...p, 
            animated: false,
            style:{ strokeWidth: 3, stroke: '#334155' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#334155' }
          }, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
          fitView
        >
          <Background gap={30} size={1} color="#cbd5e1" />
          <Controls className="print:hidden" />
          
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 min-w-[240px] animate-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest border-b pb-2">Palet Warna & Aksi</p>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#64748b', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm hover:scale-125 transition-transform" style={{ background: c }} />
                ))}
              </div>

              <div className="flex flex-col gap-1 mb-3 pt-2 border-t">
                <button onClick={() => {
                  const n = nodes.find(x => x.id === menu.id);
                  const l = prompt("Rename:", n?.data.label);
                  if(l) onNodeLabelChange(menu.id, l);
                  setMenu(null);
                }} className="w-full py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"><Edit3 size={14}/> Rename</button>
                <button onClick={() => duplicateNode(menu.id)} className="w-full py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"><Copy size={14}/> Duplicate</button>
              </div>

              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"><Eraser size={14}/> Hapus</button>
            </div>
          )}
        </ReactFlow>
      </div>
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .react-flow__viewport, .react-flow__viewport * { visibility: visible !important; }
          .react-flow__viewport { position: absolute !important; left: 0 !important; top: 0 !important; width: 100vw !important; height: 100vh !important; background: white !important; }
          .react-flow__controls, .print\:hidden { display: none !important; }
        }
        .react-flow__handle { opacity: 0; transition: opacity 0.2s; }
        .react-flow__node:hover .react-flow__handle { opacity: 1; }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
