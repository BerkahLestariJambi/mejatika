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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  ShieldCheck, Eraser, Camera, Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, PlusSquare, Copy, Edit3,
  Zap, HardDrive, DoorOpen, Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw
} from 'lucide-react';

// --- SVG CLOUD GENERATOR ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- ICON LIBRARY ---
const iconLib: any = {
  router: <Router size={40} />, switch: <Network size={40} />, pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, server: <Server size={40} />, hub: <Zap size={40} />,
  bridge: <HardDrive size={40} />, gateway: <DoorOpen size={40} />, firewall: <Flame size={40} />,
  ap: <Radio size={40} />, cloud: <Cloud size={40} />, circle: <Circle size={40} />,
  square: <Square size={40} />, chat: <MessageSquare size={40} />
};

const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const isChat = data.shapeType === 'chat';
  
  const getNodeStyle = (): React.CSSProperties => {
    if (isDevice) return { background: 'transparent', border: 'none' };
    if (isCloud) return { 
      backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), 
      backgroundSize: '100% 100%', padding: '45px 30px', border: 'none'
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
      <Handle type="source" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <div style={getNodeStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-1">{data.icon}</div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0"
          rows={1}
        />
      </div>
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  // --- HAPUS CANVAS ---
  const clearCanvas = () => { if(confirm("Hapus semua objek di canvas?")) { setNodes([]); setEdges([]); } };

  // --- SAVE & LOAD .MJTIKA ---
  const saveProject = () => {
    const data = JSON.stringify({ nodes, edges });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_${Date.now()}.mjtika`;
    link.click();
  };

  const loadProject = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const { nodes: n, edges: e } = JSON.parse(f.target?.result as string);
      setNodes(n.map((node: any) => ({ ...node, data: { ...node.data, onChange: (v: string) => onNodeLabelChange(node.id, v) } })));
      setEdges(e);
    };
    reader.readAsText(file);
  };

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  // --- TOPOLOGI AUTOMATIC (Kabel Kedip) ---
  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    const count = 5;
    const newNodes = Array.from({ length: count }).map((_, i) => ({
      id: `node-${i}`, type: 'universal',
      position: { x: type === 'bus' ? i * 200 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), y: 300 + (type === 'mesh' ? 200 * Math.sin(2*Math.PI*i/count) : 0) },
      data: { type: 'device', icon: iconLib.pc, label: `PC-${i+1}`, onChange: (v: string) => onNodeLabelChange(`node-${i}`, v) },
      style: { width: 85, height: 85 }
    }));
    const newEdges: any = [];
    if (type === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: `node-${i}`, target: `node-${i+1}`, animated: true, style: { strokeWidth: 3 } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: `node-${i}`, target: `node-${j}`, animated: true, style: { strokeWidth: 3 } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const position = { x: event.clientX - 400, y: event.clientY - 100 };
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { type, shapeType: val, icon: iconLib[val], label: val.toUpperCase(), bgColor: '#ffffff', borderColor: '#334155', onChange: (v: string) => onNodeLabelChange(id, v) },
      style: { width: type === 'device' ? 85 : 180, height: type === 'device' ? 85 : 150 }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl print:hidden">
        <div className="p-6 bg-blue-900 text-white font-black italic uppercase leading-none">
          <ShieldCheck size={28} className="mb-2"/> MEJATIKA LAB SANPIO
          <div className="text-[9px] mt-1 opacity-70">Projek Kelas Peminatan Informatika</div>
        </div>

        <div className="flex bg-slate-50 border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[11px] font-black uppercase ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => { setActiveTab('shapes'); setNodes([]); setEdges([]); }} className={`flex-1 py-4 text-[11px] font-black uppercase ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {activeTab === 'inventory' ? 
            Object.keys(iconLib).slice(0, 10).map(d => (
              <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="p-3 border rounded-xl flex flex-col items-center hover:bg-blue-50 cursor-grab">
                {iconLib[d]} <span className="text-[9px] mt-1 font-bold uppercase">{d}</span>
              </div>
            )) : 
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-3 border-2 border-dashed rounded-xl flex flex-col items-center hover:bg-emerald-50 cursor-grab">
                {iconLib[s]} <span className="text-[9px] mt-1 font-bold uppercase">{s}</span>
              </div>
            ))
          }
        </div>

        <div className="mt-auto p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all"><Save size={14}/> SAVE</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all"><FolderOpen size={14}/> LOAD</button>
            <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-red-100 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-600 hover:text-white flex items-center justify-center gap-2"><Trash2 size={16}/> HAPUS CANVAS</button>
          <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-2"><Camera size={16}/> EXPORT PDF</button>
        </div>
        
        <footer className="p-3 text-center text-[8px] font-bold text-slate-400 uppercase border-t">
          Copyright @2026 | Kelas Peminatan Informatika Sanpio
        </footer>
      </aside>

      {/* CANVAS */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {/* WATERMARK */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-10 z-0">
          <h1 className="text-9xl font-black text-slate-900 leading-none">SANPIO</h1>
          <p className="text-2xl font-bold text-slate-700">Projek Kelas Peminatan Informatika</p>
        </div>

        {/* TAB TOPOLOGI (Hanya muncul saat tab Inventory aktif) */}
        {activeTab === 'inventory' && (
          <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/80 backdrop-blur p-2 rounded-2xl shadow-xl border">
            <button onClick={() => { setNodes([]); setEdges([]); }} className="px-4 py-2 text-[10px] font-bold bg-slate-100 rounded-lg hover:bg-blue-100">SIMULASI</button>
            <button onClick={() => generateTopology('bus')} className="px-4 py-2 text-[10px] font-bold bg-slate-100 rounded-lg hover:bg-blue-100 flex items-center gap-2"><RefreshCcw size={12}/> BUS</button>
            <button onClick={() => generateTopology('mesh')} className="px-4 py-2 text-[10px] font-bold bg-slate-100 rounded-lg hover:bg-blue-100 flex items-center gap-2"><RefreshCcw size={12}/> MESH</button>
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({...p, style:{strokeWidth: 3}, markerEnd:{type: MarkerType.ArrowClosed}}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          fitView
        >
          <Background gap={25} size={1} color="#cbd5e1" />
          <Controls />

          {/* CUSTOM CONTEXT MENU */}
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border shadow-2xl rounded-xl p-3 min-w-[200px]">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Ganti Icon ({menu.type})</p>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {Object.keys(iconLib).filter(k => menu.type === 'device' ? !['cloud','circle','square','chat'].includes(k) : ['cloud','circle','square','chat'].includes(k)).map(ico => (
                  <button key={ico} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon: iconLib[ico], shapeType: ico}} : n))} className="p-1 hover:bg-slate-100 rounded border">
                    {React.cloneElement(iconLib[ico], { size: 16 })}
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Warna</p>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-6 h-6 rounded-full border shadow-sm" style={{ background: c }} />
                ))}
              </div>
              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"><Eraser size={12}/> Hapus Objek</button>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
