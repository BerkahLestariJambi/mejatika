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
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Zap, HardDrive, DoorOpen, Flame, Radio, Save, FolderOpen, 
  RefreshCcw, ChevronRight, Play, Square as StopSquare, 
  AlertTriangle, Link2Off, Globe, Cpu, Info, Eye, EyeOff,
  CheckCircle2, Users, ChevronLeft, XCircle
} from 'lucide-react';

// --- CONFIGURATION ---
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
  ap: <Radio size={40} />
};

const curriculumMaterials = [
  { id: 'materi_1', category: 'The Hook', title: 'Krisis 60 Menit Tanpa Internet', icon: <Globe size={20} />, description: 'Dunia.' },
  { id: 'materi_2', category: 'Arsitektur', title: 'Anatomi Jaringan', icon: <Cpu size={20} />, description: 'Harmoni.' }
];

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ data, selected }: any) => {
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  const isSimulating = data.isSimulating;
  
  if (data.type === 'junction') {
    return (
      <div className="relative flex items-center justify-center">
        <div className={`w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white shadow-md ${isDown ? 'bg-red-500' : ''}`} />
        <Handle type="target" position={Position.Left} id="left" className="opacity-0" />
        <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
        <Handle type="source" position={Position.Top} id="top" className="opacity-0" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-110' : ''} ${isDown || isDisconnected ? 'opacity-70' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="b" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="l" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="r" className="opacity-0" />
      
      <div className={`w-full h-full flex flex-col items-center justify-center text-center bg-white border-[3px] ${isDown || isDisconnected ? 'border-red-400' : 'border-slate-800'} rounded-2xl p-4 shadow-lg transition-colors`}>
        <div className="mb-1 relative">
          {isSimulating && !isDown && !isDisconnected && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150"></div>}
          <div className={`${isSimulating && !isDown && !isDisconnected ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-700'}`}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
            {(isDown || isDisconnected) && <AlertTriangle size={16} className="absolute -top-2 -right-2 text-red-600 animate-bounce" />}
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

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: string; isEdge?: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);
  const [topologyInfo, setTopologyInfo] = useState<'bus' | 'mesh' | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  // LOGIKA SIMULASI (TETAP ADA & LENGKAP)
  const checkConnectivity = useCallback(() => {
    if (!isLive || nodes.length === 0) return;
    const startNode = nodes.find(n => n.data.shapeType === 'router' || n.data.shapeType === 'server') || nodes[0];
    const visited = new Set();
    const queue = [startNode.id];
    visited.add(startNode.id);

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = nodes.find(n => n.id === currentId);
      if (currentNode?.data.status === 'down') continue;
      edges.forEach(edge => {
        if (edge.data?.status === 'broken') return;
        let neighborId = edge.source === currentId ? edge.target : edge.target === currentId ? edge.source : null;
        if (neighborId && !visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }

    setNodes(nds => nds.map(node => ({ ...node, data: { ...node.data, isSimulating: isLive, isDisconnected: !visited.has(node.id) } })));
    setEdges(eds => eds.map(edge => ({
      ...edge,
      animated: isLive && edge.data?.status !== 'broken',
      style: { ...edge.style, stroke: edge.data?.status === 'broken' ? '#ef4444' : (isLive ? '#22c55e' : '#0f172a'), strokeWidth: edge.id.includes('backbone') ? 8 : 4 }
    })));
  }, [isLive, nodes.length, edges.length]);

  useEffect(() => { checkConnectivity(); }, [isLive, edges.filter(e => e.data?.status === 'broken').length, nodes.filter(n => n.data.status === 'down').length]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    setTopologyInfo(type);
    setShowPanel(true);
    const timestamp = Date.now();
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    if (type === 'bus') {
      for (let i = 0; i < 5; i++) {
        const juncId = `junc-${i}`; const devId = `node-${i}`; const posX = i * 250 + 200;
        newNodes.push({ id: juncId, type: 'universal', position: { x: posX, y: 300 }, data: { type: 'junction' } });
        if (i > 0) newEdges.push({ id: `backbone-${i}`, source: `junc-${i-1}`, target: juncId, sourceHandle: 'right', targetHandle: 'left', style: { strokeWidth: 8, stroke: '#0f172a' }, type: 'straight' });
        newNodes.push({ id: devId, type: 'universal', position: { x: posX - 55, y: i % 2 === 0 ? 100 : 450 }, data: { type: 'device', shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `PC-${i}`, status: 'up', onChange: (v: string) => onNodeLabelChange(devId, v) }, style: { width: 110, height: 110 } });
        newEdges.push({ id: `drop-${i}`, source: juncId, target: devId, sourceHandle: i % 2 === 0 ? 'top' : 'bottom', targetHandle: i % 2 === 0 ? 'b' : 't', style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight' });
      }
    } else {
      const meshNodes = Array.from({ length: 5 }).map((_, i) => ({ id: `m-${i}`, type: 'universal', position: { x: 450 + 250 * Math.cos(2*Math.PI*i/5), y: 350 + 250 * Math.sin(2*Math.PI*i/5) }, data: { type: 'device', shapeType: 'pc', label: `PC-${i}`, status: 'up', onChange: (v: string) => onNodeLabelChange(`m-${i}`, v) }, style: { width: 100, height: 100 } }));
      newNodes.push(...meshNodes);
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) newEdges.push({ id: `e-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 3, stroke: '#2563eb' } });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 4, stroke: '#0f172a' } }, eds));
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'universal', position: { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 }, data: { type: 'device', shapeType: val, label: val.toUpperCase(), status: 'up', onChange: (v: string) => onNodeLabelChange(id, v) }, style: { width: 100, height: 100 } }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR LAMA (LENGKAP) */}
      <aside className="w-80 bg-white border-r flex flex-col z-[60] shadow-2xl relative">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-500"/>
          <div>MEJATIKA LAB <div className="text-[9px] mt-1 opacity-70 font-normal tracking-widest text-blue-400">SANPIO EDITION</div></div>
        </div>

        <div className="flex bg-slate-50 border-b">
          {['inventory', 'learning', 'simulasi'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-4 text-[8px] font-black uppercase transition-all ${activeTab === t ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>{t}</button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).map(item => (
                <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/value', item); }} className="p-3 border rounded-xl flex flex-col items-center bg-white hover:bg-slate-50 cursor-grab shadow-sm transition-all hover:scale-105">
                  {iconLib[item]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          ) : activeTab === 'learning' ? (
            <div className="space-y-3">
              {curriculumMaterials.map((mat) => (
                <div key={mat.id} className="p-4 rounded-xl border bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-blue-600">{mat.icon}</div>
                    <p className="font-bold text-slate-800">{mat.title}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black transition-all ${isLive ? 'bg-red-500 text-white' : 'bg-blue-600 text-white shadow-blue-200'} shadow-lg`}>
                {isLive ? <><StopSquare size={18}/> STOP SIMULASI</> : <><Play size={18}/> START SIMULASI</>}
              </button>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Klik kanan kabel/alat untuk manipulasi</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => alert('Saved!')} className="py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Save size={14}/> SAVE</button>
            <button onClick={() => alert('Loaded!')} className="py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><FolderOpen size={14}/> LOAD</button>
          </div>
          <button onClick={() => {setNodes([]); setEdges([]); setTopologyInfo(null); setShowPanel(false);}} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200 uppercase">Hapus Canvas</button>
        </div>
      </aside>

      {/* CANVAS AREA */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {/* BUTTONS TOP LEFT */}
        <div className="absolute top-4 left-4 z-[100] flex gap-2">
            <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all uppercase"><RefreshCcw size={12}/> Gen Bus</button>
            <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-white text-indigo-600 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all uppercase"><RefreshCcw size={12}/> Gen Mesh</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: n.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge', isEdge: true }); }}
          fitView
        >
          <Background gap={25} size={1} color="#cbd5e1" />
          <Controls />
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px]">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1">Quick Action</p>
              {!menu.isEdge ? (
                <button onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data: {...n.data, status: n.data.status === 'down' ? 'up' : 'down'}} : n))} className="w-full py-2 bg-amber-100 text-amber-600 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2">
                  <Zap size={14}/> FAIL/FIX DEVICE
                </button>
              ) : (
                <button onClick={() => setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {...e.data, status: e.data?.status === 'broken' ? 'fine' : 'broken'}} : e))} className="w-full py-2 bg-red-100 text-red-600 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2">
                  <Link2Off size={14}/> CUT/FIX CABLE
                </button>
              )}
              <button onClick={() => menu.isEdge ? setEdges(eds => eds.filter(e => e.id !== menu.id)) : setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full mt-2 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">Delete Object</button>
            </div>
          )}
        </ReactFlow>

        {/* NAMA KELOMPOK (KANAN BAWAH CANVAS) */}
        {topologyInfo && (
          <div className="absolute bottom-6 right-[45px] bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-2xl z-[80] animate-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-3 text-blue-600 border-b pb-2">
              <Users size={18} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Team Members</span>
            </div>
            <ul className="text-[12px] font-bold text-slate-800 space-y-1.5">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Ahmad Mejatika</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Siti Jaringan</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Budi Topology</li>
            </ul>
          </div>
        )}

        {/* SLIDE-IN INFO PANEL (RIGHT SIDE) */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ease-in-out ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <div className="h-full flex flex-col justify-center">
            <button 
              onClick={() => setShowPanel(!showPanel)}
              className="bg-slate-900 text-white p-2 rounded-l-2xl shadow-2xl flex flex-col items-center gap-3 py-10 hover:bg-blue-600 transition-all border-y border-l border-slate-700"
            >
              {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
              <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.3em]">
                {showPanel ? 'SEMBUNYI' : 'SHOW INFO'}
              </span>
            </button>
          </div>

          <div className="w-[400px] bg-white h-full shadow-[-15px_0_40px_rgba(0,0,0,0.15)] border-l border-slate-200 p-8 overflow-y-auto">
            {topologyInfo ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100"><Info size={24} /></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Topologi {topologyInfo}</h2>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="text-slate-300 hover:text-red-500 transition-colors"><XCircle size={24}/></button>
                </div>
                
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-blue-50 py-3 rounded-r-xl">
                  {topologyInfo === 'bus' 
                    ? 'Struktur di mana semua perangkat terhubung ke kabel tunggal (backbone).' 
                    : 'Struktur di mana setiap perangkat terhubung langsung ke setiap perangkat lainnya.'}
                </p>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black uppercase text-emerald-600 flex items-center gap-2 tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full"><CheckCircle2 size={16}/> Kelebihan</h3>
                    <ul className="text-xs font-bold text-slate-700 space-y-2.5 pl-2">
                      {topologyInfo === 'bus' ? (
                        <><li>• Biaya kabel sangat ekonomis</li><li>• Instalasi paling sederhana</li><li>• Mudah menambah workstation baru</li></>
                      ) : (
                        <><li>• Fault Tolerance sangat tinggi</li><li>• Keamanan data sangat terjamin</li><li>• Pengiriman data sangat cepat</li></>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black uppercase text-red-600 flex items-center gap-2 tracking-widest bg-red-50 w-fit px-3 py-1 rounded-full"><AlertTriangle size={16}/> Kekurangan</h3>
                    <ul className="text-xs font-bold text-slate-700 space-y-2.5 pl-2">
                      {topologyInfo === 'bus' ? (
                        <><li>• Backbone rusak = Jaringan lumpuh total</li><li>• Sering terjadi tabrakan data (collision)</li><li>• Sulit mendeteksi lokasi kabel putus</li></>
                      ) : (
                        <><li>• Boros penggunaan kabel (mahal)</li><li>• Konfigurasi sangat rumit</li><li>• Membutuhkan banyak port I/O</li></>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center space-y-4">
                <RefreshCcw size={64} className="opacity-10 animate-spin-slow" />
                <p className="text-sm font-black uppercase tracking-widest">Silakan Generate Topologi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .react-flow__handle { background: transparent !important; border: none !important; }
        .react-flow__edge.animated path { stroke-dasharray: 10; animation: dash 0.6s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { 
  return (
    <ReactFlowProvider>
      <NetworkLabContent />
    </ReactFlowProvider>
  );
}
