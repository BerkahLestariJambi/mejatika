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
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, Zap, HardDrive, DoorOpen, 
  Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw, 
  ChevronRight, Info, Globe, Terminal, Shield, Cpu 
} from 'lucide-react';

// --- KONFIGURASI ICON ---
const iconLib: any = {
  router: <Router size={40} />, switch: <Network size={40} />, pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, server: <Server size={40} />, hub: <Zap size={40} />,
  bridge: <HardDrive size={40} />, gateway: <DoorOpen size={40} />, firewall: <Flame size={40} />,
  ap: <Radio size={40} />, cloud: <Cloud size={40} />, circle: <Circle size={40} />,
  square: <Square size={40} />, chat: <MessageSquare size={40} />
};

const curriculumMaterials = [
  {
    id: 'materi_1',
    category: 'The Hook',
    title: 'Krisis 60 Menit Tanpa Internet',
    icon: <Globe size={20} />,
    description: 'Dunia berhenti berputar tanpa konektivitas.',
    points: ['Finansial terhenti', 'Logistik macet', 'Analogi: Data itu barang.']
  },
  {
    id: 'materi_2',
    category: 'Arsitektur',
    title: 'Anatomi Jaringan',
    icon: <Cpu size={20} />,
    description: 'Harmoni perangkat keras membagi data.',
    points: ['PAN, LAN, MAN, WAN', 'Topologi Star', 'Layer 2 vs Layer 3']
  }
];

const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- KOMPONEN NODE ---
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
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <div style={getNodeStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-1 relative">
          {shouldAnimate && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25 scale-150"></div>}
          <div className={`${shouldAnimate ? 'animate-pulse text-blue-600' : 'text-slate-700'}`}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
          </div>
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1 overflow-hidden"
          rows={1}
        />
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5" />
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning' | 'shapes'>('inventory');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const clearCanvas = () => { if(confirm("Hapus semua objek di canvas?")) { setNodes([]); setEdges([]); } };

  const saveProject = () => {
    const data = JSON.stringify({ nodes: nodes.map(n => ({...n, data: {...n.data, icon: null, onChange: null}})), edges });
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sanpio_${Date.now()}.mjtika`;
    link.click();
  };

  const loadProject = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      try {
        const parsed = JSON.parse(f.target?.result as string);
        setNodes(parsed.nodes.map((n: any) => ({ ...n, data: { ...n.data, onChange: (v: string) => onNodeLabelChange(n.id, v) } })));
        setEdges(parsed.edges);
      } catch (err) { alert("File error!"); }
    };
    reader.readAsText(file);
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    const count = 5;
    const newNodes = Array.from({ length: count }).map((_, i) => {
      const id = `node-${i}-${Date.now()}`;
      return {
        id, type: 'universal',
        position: { x: type === 'bus' ? i * 200 + 150 : 400 + 250 * Math.cos(2*Math.PI*i/count), y: 350 + (type === 'mesh' ? 250 * Math.sin(2*Math.PI*i/count) : 0) },
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
    setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 3, stroke: '#2563eb' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' } }, eds));
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type: 'universal', position: { x: event.clientX - rect.left - 45, y: event.clientY - rect.top - 45 },
      data: { type, shapeType: val, label: val.toUpperCase(), bgColor: '#ffffff', borderColor: '#334155', onChange: (v: string) => onNodeLabelChange(id, v) },
      style: { width: type === 'device' ? 85 : 180, height: type === 'device' ? 85 : 150 }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col z-[60] shadow-2xl relative">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase leading-none flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-500"/>
          <div>MEJATIKA LAB <div className="text-[9px] mt-1 opacity-70 font-normal tracking-widest text-blue-400">SANPIO EDITION</div></div>
        </div>

        <div className="flex bg-slate-50 border-b">
          {['inventory', 'learning', 'shapes'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-4 text-[9px] font-black uppercase transition-all ${activeTab === t ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>{t}</button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'learning' ? (
            <div className="space-y-3">
              {curriculumMaterials.map((mat) => (
                <button key={mat.id} onClick={() => setSelectedLesson(mat)} className="w-full p-4 rounded-xl border bg-white flex items-center justify-between hover:border-blue-300">
                  <div className="flex items-center gap-3 text-left">
                    <div className="text-blue-600">{mat.icon}</div>
                    <div><p className="font-bold text-slate-800 text-xs">{mat.title}</p></div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(activeTab === 'inventory' ? Object.keys(iconLib).slice(0, 10) : ['cloud', 'circle', 'square', 'chat']).map(item => (
                <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/type', activeTab === 'inventory' ? 'device' : 'shape'); e.dataTransfer.setData('application/value', item); }} className="p-3 border rounded-xl flex flex-col items-center bg-white hover:bg-slate-50 cursor-grab shadow-sm transition-all">
                  {iconLib[item]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Save size={14}/> SAVE</button>
            <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><FolderOpen size={14}/> LOAD</button>
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200 uppercase">Hapus Canvas</button>
          <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
        </div>
      </aside>

      {/* CANVAS AREA */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        
        {/* WATERMARK SANPIO (Di Luar ReactFlow agar tetap di belakang) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <h1 className="text-[22vw] font-black text-slate-900 opacity-[0.03] select-none leading-none">SANPIO</h1>
        </div>

        {/* NAMA KELOMPOK OVERLAY */}
        <div className="absolute bottom-6 right-6 z-[100] bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl pointer-events-none">
            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Project By:</p>
            <p className="text-sm font-black text-slate-800">KELOMPOK PEMINATAN INFORMATIKA</p>
            <p className="text-[10px] font-bold text-slate-500 italic">San Pio Lab v2.0</p>
        </div>

        {/* CURRICULUM POPUP */}
        {selectedLesson && (
          <div className="absolute top-4 right-4 z-[110] w-80 bg-white/95 backdrop-blur-xl border-2 border-blue-500/20 rounded-3xl p-6 shadow-2xl">
             <button onClick={() => setSelectedLesson(null)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
             <h4 className="text-xl font-black text-slate-800 tracking-tighter mb-2">{selectedLesson.title}</h4>
             <p className="text-[11px] text-slate-500 italic border-l-2 border-blue-500 pl-3 mb-4">"{selectedLesson.description}"</p>
             <div className="space-y-2">
                {selectedLesson.points.map((p: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center text-[11px] font-bold text-slate-600"><Zap size={10} className="text-emerald-500"/> {p}</div>
                ))}
             </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="absolute top-4 left-4 z-[100] flex gap-2">
          <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><RefreshCcw size={12}/> GEN BUS</button>
          <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-white text-indigo-600 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"><RefreshCcw size={12}/> GEN MESH</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          fitView
        >
          <Background gap={25} size={1} color="#cbd5e1" />
          <Controls className="!bg-white !shadow-xl !border-none !rounded-lg overflow-hidden" />
          
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px]">
              <p className="text-[9px] font-black text-slate-400 mb-3 uppercase border-b pb-1">Config {menu.type}</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.keys(iconLib).filter(k => menu.type === 'device' ? !['cloud','circle','square','chat'].includes(k) : ['cloud','circle','square','chat'].includes(k)).map(ico => (
                  <button key={ico} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, shapeType: ico}} : n))} className="p-2 hover:bg-blue-50 rounded-lg border flex items-center justify-center transition-colors">
                    {React.cloneElement(iconLib[ico], { size: 18 })}
                  </button>
                ))}
              </div>
              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all">HAPUS OBJEK</button>
            </div>
          )}
        </ReactFlow>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .react-flow__edge.animated path { stroke-dasharray: 8; animation: dash 1s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
