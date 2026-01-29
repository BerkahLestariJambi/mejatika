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
  ShieldCheck, Eraser, Camera, Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, PlusSquare, Copy, Edit3,
  Zap, HardDrive, DoorOpen, Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw
} from 'lucide-react';

// --- ICON LIBRARY ---
// Kita simpan mapping agar mudah di-load kembali tanpa error
const iconLib: any = {
  router: <Router size={40} />, 
  switch: <Network size={40} />, 
  pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, 
  server: <Server size={40} />, 
  hub: <Zap size={40} />,
  bridge: <HardDrive size={40} />, 
  gateway: <DoorOpen size={40} />, 
  firewall: <Flame size={40} />,
  ap: <Radio size={40} />, 
  cloud: <Cloud size={40} />, 
  circle: <Circle size={40} />,
  square: <Square size={40} />, 
  chat: <MessageSquare size={40} />
};

const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE ---
const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const isWireless = data.shapeType === 'router' || data.shapeType === 'wifi' || data.shapeType === 'ap';
  
  const getNodeStyle = (): React.CSSProperties => {
    if (isDevice) return { background: 'transparent', border: 'none' };
    if (isCloud) return { 
      backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), 
      backgroundSize: '100% 100%', padding: '45px 30px', border: 'none'
    };
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: data.shapeType === 'circle' ? '50%' : data.shapeType === 'chat' ? '4px 4px 4px 0' : '12px',
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
        {/* EFEK KEDIP WIRELESS */}
        <div className={`mb-1 relative`}>
          {isWireless && (
             <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150"></div>
          )}
          <div className={`${isWireless ? 'animate-pulse text-blue-600' : ''}`}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
          </div>
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1"
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

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const clearCanvas = () => { if(confirm("Hapus semua objek di canvas?")) { setNodes([]); setEdges([]); } };

  // --- LOGIKA SAVE (Hanya simpan string, bukan JSX) ---
  const saveProject = () => {
    const nodesToSave = nodes.map(n => ({
      ...n,
      data: { ...n.data, icon: null, onChange: null } // Hapus fungsi & JSX sebelum save
    }));
    const data = JSON.stringify({ nodes: nodesToSave, edges });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanpio_${Date.now()}.mjtika`;
    link.click();
  };

  // --- LOGIKA LOAD (Pasang kembali JSX & fungsi) ---
  const loadProject = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      try {
        const parsed = JSON.parse(f.target?.result as string);
        const restoredNodes = parsed.nodes.map((n: any) => ({
          ...n,
          data: { 
            ...n.data, 
            icon: iconLib[n.data.shapeType], // Pasang icon berdasarkan key string
            onChange: (v: string) => onNodeLabelChange(n.id, v) 
          }
        }));
        setNodes(restoredNodes);
        setEdges(parsed.edges);
      } catch (err) {
        alert("File .mjtika tidak valid atau korup!");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input file
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    const count = 5;
    const newNodes = Array.from({ length: count }).map((_, i) => {
      const id = `node-${i}-${Date.now()}`;
      return {
        id, type: 'universal',
        position: { x: type === 'bus' ? i * 200 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), y: 300 + (type === 'mesh' ? 200 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', shapeType: 'pc', icon: iconLib.pc, label: `PC-${i+1}`, onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      }
    });
    
    const newEdges: any = [];
    if (type === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 3, stroke: '#2563eb' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 3, stroke: '#2563eb' } });
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
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
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
          <ShieldCheck size={28} className="mb-2 text-emerald-400"/> MEJATIKA LAB SANPIO
          <div className="text-[9px] mt-1 opacity-70">Projek Kelas Peminatan Informatika</div>
        </div>

        <div className="flex bg-slate-50 border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => { setActiveTab('shapes'); setNodes([]); setEdges([]); }} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {activeTab === 'inventory' ? 
            Object.keys(iconLib).slice(0, 10).map(d => (
              <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="p-3 border rounded-xl flex flex-col items-center hover:bg-blue-50 cursor-grab transition-all hover:scale-105 active:scale-95 bg-white shadow-sm">
                {iconLib[d]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{d}</span>
              </div>
            )) : 
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-3 border-2 border-dashed rounded-xl flex flex-col items-center hover:bg-emerald-50 cursor-grab transition-all bg-white shadow-sm">
                {iconLib[s]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{s}</span>
              </div>
            ))
          }
        </div>

        <div className="mt-auto p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 shadow-md"><Save size={14}/> SAVE .MJTIKA</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 shadow-md"><FolderOpen size={14}/> LOAD</button>
            <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-200"><Trash2 size={16}/> HAPUS CANVAS</button>
          <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-2 hover:bg-black"><Camera size={16}/> EXPORT PDF</button>
        </div>
        
        <footer className="p-3 text-center text-[8px] font-bold text-slate-400 uppercase border-t">
          Copyright @2026 | Kelas Peminatan Informatika Sanpio
        </footer>
      </aside>

      {/* CANVAS AREA */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {/* WATERMARK */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-[0.07] z-0 select-none">
          <h1 className="text-[12rem] font-black text-slate-900 leading-none">SANPIO</h1>
          <p className="text-4xl font-bold text-slate-700 uppercase tracking-widest">Projek Kelas Peminatan Informatika</p>
        </div>

        {/* TOPOLOGY CONTROLS */}
        {activeTab === 'inventory' && (
          <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-2xl border border-blue-100">
            <button onClick={() => { setNodes([]); setEdges([]); }} className="px-5 py-2 text-[10px] font-black bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">SIMULASI KOSONG</button>
            <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-blue-200"><RefreshCcw size={12}/> AUTO BUS</button>
            <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-200"><RefreshCcw size={12}/> AUTO MESH</button>
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({
            ...p, 
            animated: true, // KABEL LANGSUNG KEDIP SAAT DIHUBUNGKAN
            style: { strokeWidth: 3, stroke: '#2563eb' }, 
            markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
          }, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          fitView
        >
          <Background gap={30} size={1} color="#cbd5e1" />
          <Controls />

          {/* CONTEXT MENU */}
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 min-w-[220px] animate-in zoom-in-95 duration-150">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Ganti Ikon {menu.type}</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.keys(iconLib).filter(k => menu.type === 'device' ? !['cloud','circle','square','chat'].includes(k) : ['cloud','circle','square','chat'].includes(k)).map(ico => (
                  <button key={ico} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon: iconLib[ico], shapeType: ico}} : n))} className="p-2 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all flex items-center justify-center">
                    {React.cloneElement(iconLib[ico], { size: 18 })}
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Warna Objek</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-7 h-7 rounded-full border shadow-inner transition-transform hover:scale-110" style={{ background: c }} />
                ))}
              </div>
              <div className="space-y-1">
                <button onClick={() => {
                  const label = prompt("Ubah Nama:", nodes.find(n => n.id === menu.id)?.data.label);
                  if(label) onNodeLabelChange(menu.id, label);
                }} className="w-full py-2 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2"><Edit3 size={12}/> RENAME</button>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"><Eraser size={12}/> HAPUS OBJEK</button>
              </div>
            </div>
          )}
        </ReactFlow>
      </div>

      <style jsx global>{`
        .react-flow__handle { width: 8px !important; height: 8px !important; background: #2563eb !important; border: 2px solid white !important; }
        .react-flow__edge-path { stroke-dasharray: 5; animation: dash 1s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }
        @media print {
          .print\:hidden { display: none !important; }
          .react-flow__controls { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
