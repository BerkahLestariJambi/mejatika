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
  Zap, HardDrive, DoorOpen, Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw,
  ChevronRight, Info, BookOpen, Globe, Terminal, Shield, HelpCircle
} from 'lucide-react';

// --- KONFIGURASI ICON & MATERI (SINKRON DENGAN NARASI MODERN) ---

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
    description: 'Bayangkan dunia berhenti berputar karena konektivitas mati total.',
    points: [
      'Finansial: Transaksi senilai $2.1 Miliar terhenti seketika.',
      'Logistik: Pesawat & Rantai pasok dunia macet tanpa data navigasi.',
      'Analogi: Data (Barang), IP (Alamat), Protokol (Kendaraan), Fisik (Jalan).'
    ]
  },
  {
    id: 'materi_2',
    category: 'Arsitektur',
    title: 'Anatomi & Kasta Jaringan',
    icon: <Cpu size={20} />,
    description: 'Bagaimana perangkat keras bekerja dalam harmoni membagi data.',
    points: [
      'Cakupan: PAN (Bluetooth), LAN (Gedung), MAN (Kota), WAN (Internet).',
      'Topologi Star: Paling stabil, pusat ada pada Switch/Hub.',
      'Hardware: Switch (Layer 2 - MAC) & Router (Layer 3 - IP Path).'
    ]
  },
  {
    id: 'materi_3',
    category: 'Protokol',
    title: 'Live Terminal & OSI Layer',
    icon: <Terminal size={20} />,
    description: 'Komputer bicara melalui model lapisan bahasa yang terstandarisasi.',
    points: [
      'OSI Layer: Dari urusan listrik kabel hingga aplikasi di layar.',
      'Identitas: Gunakan "ipconfig" untuk melihat Alamat Rumah Digital.',
      'Transport: Memastikan data sampai utuh tanpa cacat menggunakan TCP.'
    ]
  },
  {
    id: 'materi_4',
    category: 'Keamanan',
    title: 'Penjaga Gerbang Digital',
    icon: <Shield size={20} />,
    description: 'Melindungi data agar tidak seperti rumah tanpa pintu.',
    points: [
      'HTTP vs HTTPS: HTTPS ibarat mengirim surat di dalam brankas baja.',
      'Encryption: Mengubah data menjadi kode rahasia yang tak terbaca.',
      'Rain Fade: Alasan internet melambat saat hujan (Sinyal terganggu air).'
    ]
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
  const shouldAnimate = isDevice && (data.shapeType === 'router' || data.shapeType === 'wifi' || data.shapeType === 'ap');
  
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
      <Handle type="target" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5" />
      
      <div style={getNodeStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-1 relative">
          {shouldAnimate && (
             <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25 scale-150"></div>
          )}
          <div className={`${shouldAnimate ? 'animate-pulse text-blue-600' : ''}`}>
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
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

// --- MAIN LAB CONTENT ---

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

  const clearCanvas = () => { if(confirm("Hapus semua objek di canvas?")) { setNodes([]); setEdges([]); setSelectedLesson(null); } };

  const saveProject = () => {
    const nodesToSave = nodes.map(n => ({ ...n, data: { ...n.data, icon: null, onChange: null } }));
    const data = JSON.stringify({ nodes: nodesToSave, edges });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
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
        const restoredNodes = parsed.nodes.map((n: any) => ({
          ...n,
          data: { ...n.data, icon: iconLib[n.data.shapeType], onChange: (v: string) => onNodeLabelChange(n.id, v) }
        }));
        setNodes(restoredNodes);
        setEdges(parsed.edges);
      } catch (err) { alert("File error!"); }
    };
    reader.readAsText(file);
    e.target.value = null;
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
    const isNetworkConnection = sourceNode?.data.type === 'device' || targetNode?.data.type === 'device';

    setEdges((eds) => addEdge({
      ...params,
      animated: isNetworkConnection,
      style: { strokeWidth: 3, stroke: isNetworkConnection ? '#2563eb' : '#64748b' },
      markerEnd: { type: MarkerType.ArrowClosed, color: isNetworkConnection ? '#2563eb' : '#64748b' }
    }, eds));
  }, [nodes]);

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
      {/* SIDEBAR LENGKAP */}
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl print:hidden">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase leading-none">
          <ShieldCheck size={28} className="mb-2 text-blue-500"/> MEJATIKA LAB SANPIO
          <div className="text-[9px] mt-1 opacity-70">Projek Kelas Peminatan Informatika</div>
        </div>

        {/* TAB NAVIGASI */}
        <div className="flex bg-slate-50 border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[9px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('learning')} className={`flex-1 py-4 text-[9px] font-black uppercase transition-all ${activeTab === 'learning' ? 'bg-white text-indigo-600 border-b-4 border-indigo-600' : 'text-slate-400'}`}>Kurikulum</button>
          <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-[9px] font-black uppercase transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {activeTab === 'learning' ? (
            <div className="p-4 space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-gradient-to-br from-slate-800 to-indigo-900 p-4 rounded-xl text-white shadow-md mb-4">
                <p className="text-[10px] font-black uppercase opacity-70">Kurikulum Bab 4</p>
                <p className="text-lg font-black italic leading-tight tracking-tight">Digital Nerve System</p>
              </div>
              {curriculumMaterials.map((mat) => (
                <button 
                  key={mat.id} 
                  onClick={() => setSelectedLesson(mat)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${selectedLesson?.id === mat.id ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-100' : 'bg-white border-slate-100 hover:border-blue-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${selectedLesson?.id === mat.id ? 'text-blue-600' : 'text-slate-400'}`}>
                      {mat.icon}
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{mat.category}</span>
                      <p className="font-bold text-slate-800 text-xs">{mat.title}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={selectedLesson?.id === mat.id ? 'text-blue-500' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 gap-3">
              {(activeTab === 'inventory' ? Object.keys(iconLib).slice(0, 10) : ['cloud', 'circle', 'square', 'chat']).map(item => (
                <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/type', activeTab === 'inventory' ? 'device' : 'shape'); e.dataTransfer.setData('application/value', item); }} className="p-3 border rounded-xl flex flex-col items-center bg-white hover:bg-slate-50 cursor-grab transition-all shadow-sm">
                  {iconLib[item]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg"><Save size={14}/> SAVE</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"><FolderOpen size={14}/> LOAD</button>
            <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200"><Trash2 size={16}/> HAPUS CANVAS</button>
        </div>
        <footer className="p-3 text-center text-[8px] font-bold text-slate-400 uppercase border-t">
          Copyright @2026 | Kelas Peminatan Informatika Sanpio
        </footer>
      </aside>

      {/* CANVAS AREA */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-[0.07] z-0 select-none">
          <h1 className="text-[12rem] font-black text-slate-900 leading-none">SANPIO</h1>
          <p className="text-4xl font-bold text-slate-700 uppercase tracking-widest">Projek Kelas Peminatan Informatika</p>
        </div>

        {/* OVERLAY MATERI (DYNAMIC POPUP) */}
        {selectedLesson && (
          <div className="absolute top-4 right-4 z-50 w-80 bg-white/95 backdrop-blur-xl border-2 border-blue-500/20 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-500 overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
             <button onClick={() => setSelectedLesson(null)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
             
             <div className="flex items-center gap-2 mb-2">
               <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                 {selectedLesson.icon}
               </div>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{selectedLesson.category}</span>
             </div>

             <h4 className="text-xl font-black text-slate-800 tracking-tighter leading-tight">{selectedLesson.title}</h4>
             <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed italic border-l-2 border-blue-500 pl-3">
               "{selectedLesson.description}"
             </p>

             <div className="mt-5 space-y-3">
                {selectedLesson.points.map((p: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="mt-1 bg-emerald-100 p-1 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm"><Zap size={10}/></div>
                    <p className="text-[11px] font-extrabold text-slate-600 leading-tight group-hover:text-slate-900 transition-colors">{p}</p>
                  </div>
                ))}
             </div>

             <div className="mt-6 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 p-3 rounded-xl animate-pulse">
                  <Info size={14}/> SIMULASIKAN DENGAN INVENTORY
               </div>
             </div>
          </div>
        )}

        {/* TOOLBAR TOPOLOGI */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-xl border border-blue-100">
          <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-blue-50 text-blue-600 rounded-xl flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><RefreshCcw size={12}/> GENERATE BUS</button>
          <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-indigo-50 text-indigo-600 rounded-xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"><RefreshCcw size={12}/> GENERATE MESH</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          fitView
        >
          <Background gap={30} size={1} color="#cbd5e1" />
          <Controls />
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border shadow-2xl rounded-2xl p-4 min-w-[220px]">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Ubah Ikon {menu.type}</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.keys(iconLib).filter(k => menu.type === 'device' ? !['cloud','circle','square','chat'].includes(k) : ['cloud','circle','square','chat'].includes(k)).map(ico => (
                  <button key={ico} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, icon: iconLib[ico], shapeType: ico}} : n))} className="p-2 hover:bg-blue-50 rounded-lg border flex items-center justify-center">
                    {React.cloneElement(iconLib[ico], { size: 18 })}
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Warna</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [menu.type === 'shape' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-7 h-7 rounded-full border shadow-sm" style={{ background: c }} />
                ))}
              </div>
              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all">HAPUS OBJEK</button>
            </div>
          )}
        </ReactFlow>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .react-flow__edge.animated path { stroke-dasharray: 5; animation: dash 1s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
