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
  ShieldCheck, Camera, Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, Zap, HardDrive, DoorOpen, 
  Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw, PlayCircle, Activity, Users
} from 'lucide-react';

// Konfigurasi Ikon
const iconLib: any = {
  router: <Router size={40} />, switch: <Network size={40} />, pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, server: <Server size={40} />, hub: <Zap size={40} />,
  bridge: <HardDrive size={40} />, gateway: <DoorOpen size={40} />, firewall: <Flame size={40} />,
  ap: <Radio size={40} />, cloud: <Cloud size={40} />, circle: <Circle size={40} />,
  square: <Square size={40} />, chat: <MessageSquare size={40} />
};

const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const shouldAnimate = isDevice && ['router', 'wifi', 'ap'].includes(data.shapeType);
  
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
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2 !h-2" />
      
      <div style={getNodeStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-1 relative">
          {shouldAnimate && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150" />}
          <div className={shouldAnimate ? 'animate-pulse text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'text-slate-700'}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
          </div>
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-bold uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1"
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
  
  // NAMA ANGGOTA KELOMPOK TETAP
  const [kelompok] = useState('Eklan Ilang | Andri Jelau | Farel Gaut | Boven Jelanu');

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const clearCanvas = () => { if(confirm("Hapus semua objek?")) { setNodes([]); setEdges([]); } };

  const saveProject = () => {
    const nodesToSave = nodes.map(n => ({ ...n, data: { ...n.data, icon: null, onChange: null } }));
    const data = JSON.stringify({ nodes: nodesToSave, edges, kelompok });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanpio_lab_${Date.now()}.mjtika`;
    link.click();
  };

  const loadProject = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      try {
        const parsed = JSON.parse(f.target?.result as string);
        const restoredNodes = parsed.nodes.map((n: any) => ({
          ...n,
          data: { ...n.data, icon: iconLib[n.data.shapeType], onChange: (v: string) => onNodeLabelChange(n.id, v) }
        }));
        setNodes(restoredNodes);
        setEdges(parsed.edges);
      } catch (err) { alert("Format file tidak dikenali!"); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const generateTopology = (type: 'bus' | 'mesh' | 'empty') => {
    setNodes([]); setEdges([]);
    if (type === 'empty') return;
    const count = 5;
    const newNodes = Array.from({ length: count }).map((_, i) => {
      const id = `node-${i}-${Date.now()}`;
      return {
        id, type: 'universal',
        position: { x: type === 'bus' ? i * 200 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), y: 300 + (type === 'mesh' ? 200 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', shapeType: 'pc', label: `PC-${i+1}`, onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      }
    });
    const newEdges = [];
    if (type === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 3, stroke: '#2563eb' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 3, stroke: '#2563eb' } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onConnect = useCallback((params: any) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    const isNetwork = sourceNode?.data.type === 'device' || targetNode?.data.type === 'device';
    setEdges((eds) => addEdge({
      ...params,
      animated: isNetwork,
      style: { strokeWidth: 3, stroke: isNetwork ? '#2563eb' : '#94a3b8' },
      markerEnd: { type: MarkerType.ArrowClosed, color: isNetwork ? '#2563eb' : '#94a3b8' }
    }, eds));
  }, [nodes]);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const position = { x: event.clientX - rect.left - 45, y: event.clientY - rect.top - 45 };
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { type, shapeType: val, label: val.toUpperCase(), bgColor: '#ffffff', borderColor: '#334155', onChange: (v: string) => onNodeLabelChange(id, v) },
      style: { width: type === 'device' ? 85 : 180, height: type === 'device' ? 85 : 150 }
    }));
  }, [nodes]);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl print:hidden">
        <div className="p-6 bg-blue-900 text-white font-black italic uppercase leading-none flex items-center gap-3">
          <ShieldCheck size={32} className="text-emerald-400"/>
          <div>MEJATIKA LAB <div className="text-[10px] opacity-70 font-normal tracking-widest text-emerald-300">SANPIO EDITION</div></div>
        </div>

        <div className="flex bg-slate-50 border-b p-1">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[11px] font-black rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>INVENTORY</button>
          <button onClick={() => { setActiveTab('shapes'); setNodes([]); setEdges([]); }} className={`flex-1 py-3 text-[11px] font-black rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>SHAPES</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {(activeTab === 'inventory' ? Object.keys(iconLib).slice(0, 10) : ['cloud', 'circle', 'square', 'chat']).map(item => (
            <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/type', activeTab === 'inventory' ? 'device' : 'shape'); e.dataTransfer.setData('application/value', item); }} className="p-4 border rounded-2xl flex flex-col items-center bg-white hover:bg-blue-50 cursor-grab shadow-sm transition-all hover:scale-105 active:scale-95 group">
              <div className="text-slate-600 group-hover:text-blue-600">{iconLib[item]}</div>
              <span className="text-[9px] mt-2 font-bold uppercase text-slate-400">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all uppercase"><Save size={14}/> Save</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 shadow-lg transition-all uppercase"><FolderOpen size={14}/> Load</button>
            <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-white text-red-500 text-[10px] font-black rounded-xl border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all uppercase flex items-center justify-center gap-2"><Trash2 size={16}/> Reset Canvas</button>
          <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 uppercase"><Camera size={16}/> Export PDF</button>
        </div>
      </aside>

      <main className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        
        {/* WATERMARK SANPIO LENGKAP */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-[0.08] z-0 select-none w-full">
          <h1 className="text-[16rem] font-black text-slate-900 leading-none tracking-tighter">SANPIO</h1>
          <p className="text-5xl font-black text-slate-800 uppercase tracking-[2rem] -mt-8">MEJATIKA LAB</p>
          <div className="mt-4 flex justify-center gap-10">
            <span className="text-2xl font-bold border-y-2 border-slate-900 py-2 px-4 uppercase">Project Peminatan</span>
            <span className="text-2xl font-bold border-y-2 border-slate-900 py-2 px-4 uppercase">Informatika 2026</span>
          </div>
        </div>

        {/* NAMA KELOMPOK DITAMPILKAN PADA TAB INVENTORY (BUS & MESH) */}
        {activeTab === 'inventory' && (
          <>
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50">
              <button onClick={() => generateTopology('empty')} className="px-5 py-2.5 text-[10px] font-black bg-slate-900 text-white rounded-xl flex items-center gap-2 hover:scale-105 transition-all">
                 <PlayCircle size={16} className="text-emerald-400 animate-pulse"/> SIMULASI BARU
              </button>
              <div className="w-[1px] h-8 bg-slate-200 mx-1" />
              <button onClick={() => generateTopology('bus')} className="px-5 py-2.5 text-[10px] font-black bg-blue-50 text-blue-600 rounded-xl flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"><RefreshCcw size={14}/> AUTO BUS</button>
              <button onClick={() => generateTopology('mesh')} className="px-5 py-2.5 text-[10px] font-black bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"><Activity size={14}/> AUTO MESH</button>
            </div>

            {/* NAMA KELOMPOK DI BAWAH CANVAS (DISPLAY SAJA) */}
            <div className="absolute bottom-6 left-6 z-10 bg-blue-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-sm">
              <div className="bg-white/20 p-2 rounded-lg"><Users size={20} className="text-emerald-300" /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-0.5">Anggota Kelompok</span>
                <span className="text-[12px] font-black uppercase tracking-wider leading-none">{kelompok}</span>
              </div>
            </div>
          </>
        )}

        {/* FITUR EDITABLE DI REMARK/DISABLE SESUAI PERMINTAAN
        <div className="absolute bottom-6 right-6 z-10 ...">
           <input type="text" value={kelompok} ... />
        </div> 
        */}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          fitView
        >
          <Background gap={35} size={1} color="#cbd5e1" />
          <Controls />
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 min-w-[240px]">
              <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter">Konfigurasi Warna</p>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#1e293b'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [menu.type === 'shape' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125" style={{ background: c }} />
                ))}
              </div>
              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase flex items-center justify-center gap-2"><Trash2 size={14}/> Hapus Objek</button>
            </div>
          )}
        </ReactFlow>
      </main>

      <style jsx global>{`
        .react-flow__edge.animated path { stroke-dasharray: 8; animation: dash 0.8s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
        @media print { .print\:hidden { display: none !important; } }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
