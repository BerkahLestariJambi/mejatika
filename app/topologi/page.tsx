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
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Zap, HardDrive, DoorOpen, Flame, Radio, Save, FolderOpen, 
  RefreshCcw, ChevronRight, Play, Square as StopSquare, 
  AlertTriangle, Link2Off, Globe, Cpu, Info, Users, ChevronLeft, XCircle, Edit3, Trash2
} from 'lucide-react';

// --- LIBRARY ICON ---
const iconLib: any = {
  pc: <Monitor size={35} />,
  router: <Router size={35} />, 
  switch: <Network size={35} />, 
  wifi: <Wifi size={35} />, 
  server: <Server size={35} />, 
  hub: <Zap size={35} />,
  firewall: <Flame size={35} />,
  ap: <Radio size={35} />
};

// --- CUSTOM NODE ---
const UniversalNode = ({ id, data, selected }: any) => {
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  
  if (data.type === 'junction') {
    return (
      <div className="relative flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full bg-slate-900 border border-white shadow ${isDown ? 'bg-red-500' : ''}`} />
        <Handle type="target" position={Position.Left} id="left" className="opacity-0" />
        <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
        <Handle type="source" position={Position.Top} id="top" className="opacity-0" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      </div>
    );
  }

  return (
    <div className={`relative group transition-all ${selected ? 'scale-110' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="b" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="l" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="r" className="opacity-0" />
      
      <div className={`w-28 h-28 flex flex-col items-center justify-center bg-white border-[3px] shadow-xl rounded-2xl transition-all ${isDown || isDisconnected ? 'border-red-500 bg-red-50' : 'border-slate-800'}`}>
        <div className={`${data.isSimulating && !isDown && !isDisconnected ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-700'}`}>
          {iconLib[data.shapeType] || <Monitor size={35}/>}
        </div>
        <input 
          value={data.label} 
          onChange={(e) => data.onChange(id, e.target.value)}
          className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 w-full mt-1 p-0 cursor-text"
        />
        {(isDown || isDisconnected) && <AlertTriangle size={14} className="absolute -top-1 -right-1 text-red-600 animate-bounce" />}
      </div>
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: string; currentLabel?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);
  const [topologyInfo, setTopologyInfo] = useState<'bus' | 'mesh' | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  // FUNGSI RENAME & GANTI ICON
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n));
  };

  const onNodeLabelChange = (id: string, label: string) => {
    updateNodeData(id, { label });
  };

  // LOGIKA KONEKTIVITAS
  useEffect(() => {
    if (!isLive) {
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, isSimulating: false, isDisconnected: false}})));
        setEdges(eds => eds.map(e => ({...e, animated: false})));
        return;
    }
    setNodes(nds => nds.map(node => ({ ...node, data: { ...node.data, isSimulating: true } })));
    setEdges(eds => eds.map(edge => ({ ...edge, animated: edge.data?.status !== 'broken' })));
  }, [isLive]);

  // GENERATE TOPOLOGY
  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    setTopologyInfo(type); setShowPanel(true);
    const newNodes: any[] = []; const newEdges: any[] = [];

    if (type === 'bus') {
      for (let i = 0; i < 5; i++) {
        const jId = `j-${i}`; const dId = `n-${i}`; const px = i * 250 + 200;
        newNodes.push({ id: jId, type: 'universal', position: { x: px, y: 300 }, data: { type: 'junction' } });
        if (i > 0) newEdges.push({ id: `b-${i}`, source: `j-${i-1}`, target: jId, style: { strokeWidth: 8, stroke: '#0f172a' }, type: 'straight' });
        newNodes.push({ id: dId, type: 'universal', position: { x: px - 55, y: i % 2 === 0 ? 100 : 450 }, data: { type: 'device', shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `PC-${i}`, onChange: onNodeLabelChange }, style: { width: 110, height: 110 } });
        newEdges.push({ id: `drop-${i}`, source: jId, target: dId, sourceHandle: i % 2 === 0 ? 'top' : 'bottom', targetHandle: i % 2 === 0 ? 'b' : 't', style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight' });
      }
    } else {
      const meshNodes = Array.from({ length: 5 }).map((_, i) => ({ id: `m-${i}`, type: 'universal', position: { x: 450 + 200 * Math.cos(2*Math.PI*i/5), y: 350 + 200 * Math.sin(2*Math.PI*i/5) }, data: { type: 'device', shapeType: 'pc', label: `PC-${i}`, onChange: onNodeLabelChange } }));
      newNodes.push(...meshNodes);
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) newEdges.push({ id: `e-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 3, stroke: '#2563eb' } });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = (event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'universal', position: { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 }, data: { type: 'device', shapeType: type, label: type.toUpperCase(), onChange: onNodeLabelChange } }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      {/* SIDEBAR LAMA KEMBALI */}
      <aside className="w-80 bg-white border-r flex flex-col z-[100] shadow-2xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={30}/>
          <div>MEJATIKA LAB <div className="text-[10px] text-blue-400 font-normal">PRAKTIK JARINGAN</div></div>
        </div>
        <div className="flex border-b bg-slate-50">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[10px] font-black uppercase ${activeTab === 'inventory' ? 'bg-white border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('simulasi')} className={`flex-1 py-4 text-[10px] font-black uppercase ${activeTab === 'simulasi' ? 'bg-white border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).map(key => (
                <div key={key} draggable onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-4 border-2 rounded-2xl flex flex-col items-center bg-white hover:border-blue-500 cursor-grab shadow-sm transition-all hover:scale-105">
                  <div className="text-slate-700 mb-2">{iconLib[key]}</div>
                  <span className="text-[10px] font-bold uppercase">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isLive ? 'STOP SIMULATION' : 'START SIMULATION'}
            </button>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 space-y-2">
            <button onClick={() => {setNodes([]); setEdges([]); setTopologyInfo(null);}} className="w-full py-3 bg-red-100 text-red-600 text-[10px] font-black rounded-lg uppercase">Reset Canvas</button>
        </div>
      </aside>

      {/* CANVAS AREA */}
      <main className="flex-grow relative" ref={reactFlowWrapper}>
        <div className="absolute top-4 left-4 z-[100] flex gap-2">
            <button onClick={() => generateTopology('bus')} className="px-6 py-2 bg-white shadow-xl border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all tracking-widest uppercase">Gen Bus</button>
            <button onClick={() => generateTopology('mesh')} className="px-6 py-2 bg-white shadow-xl border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all tracking-widest uppercase">Gen Mesh</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes} onConnect={(p) => setEdges(eds => addEdge({...p, style:{strokeWidth:4, stroke:'#0f172a'}}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node', currentLabel: n.data.label as string }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }}
          fitView
        >
          <Background color="#cbd5e1" gap={25} />
          <Controls />
        </ReactFlow>

        {/* NAMA KELOMPOK */}
        {topologyInfo && (
          <div className="absolute bottom-6 right-[50px] bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-2xl z-[80]">
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-black text-[10px] uppercase border-b pb-1 tracking-tighter"><Users size={16}/> Anggota Kelompok</div>
            <div className="text-[12px] font-bold text-slate-800 italic">1. Ahmad Mejatika <br/> 2. Siti Jaringan <br/> 3. Budi Topology</div>
          </div>
        )}

        {/* CONTEXT MENU (GANTI ICON & RENAME) */}
        {menu && (
          <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-56 animate-in fade-in zoom-in-95">
             <div className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest border-b pb-1">Edit Perangkat</div>
             {menu.type === 'node' && (
               <div className="space-y-2">
                 <div className="grid grid-cols-4 gap-1 mb-2">
                   {Object.keys(iconLib).map(ico => (
                     <button key={ico} onClick={() => { updateNodeData(menu.id, { shapeType: ico }); setMenu(null); }} className="p-2 border rounded hover:bg-blue-50 text-slate-600">{React.cloneElement(iconLib[ico], { size: 16 })}</button>
                   ))}
                 </div>
                 <button onClick={() => { updateNodeData(menu.id, { status: 'down' }); setMenu(null); }} className="w-full py-2 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Zap size={14}/> Set Failure</button>
                 <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Trash2 size={14}/> Hapus</button>
               </div>
             )}
             {menu.type === 'edge' && (
               <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}} : e)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Link2Off size={14}/> Putuskan Kabel</button>
             )}
          </div>
        )}

        {/* SLIDE INFO PANEL */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ease-in-out ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <div className="h-full flex flex-col justify-center">
            <button onClick={() => setShowPanel(!showPanel)} className="bg-slate-900 text-white p-2 rounded-l-2xl shadow-2xl flex flex-col items-center gap-3 py-10">
              {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
              <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.3em]">{showPanel ? 'SEMBUNYI' : 'SHOW INFO'}</span>
            </button>
          </div>
          <div className="w-[400px] bg-white h-full shadow-2xl border-l border-slate-200 p-8 overflow-y-auto">
             <div className="flex items-center gap-3 mb-6">
                <Info className="text-blue-600" size={30} />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Info Topologi</h2>
             </div>
             {topologyInfo ? (
               <div className="space-y-6">
                 <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500 italic text-sm text-slate-700">
                   {topologyInfo === 'bus' ? 'Topologi Bus menggunakan kabel backbone tunggal.' : 'Topologi Mesh menghubungkan setiap node secara point-to-point.'}
                 </div>
                 <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="text-emerald-600 font-black text-[11px] uppercase tracking-widest">Kelebihan</h4>
                      <ul className="text-xs space-y-1 font-bold"><li>• Efisien biaya</li><li>• Mudah diatur</li><li>• Irit kabel</li></ul>
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <h4 className="text-red-600 font-black text-[11px] uppercase tracking-widest">Kekurangan</h4>
                      <ul className="text-xs space-y-1 font-bold"><li>• Rawan putus total</li><li>• Tabrakan data tinggi</li><li>• Sulit troubleshoot</li></ul>
                    </div>
                 </div>
               </div>
             ) : <p className="text-slate-400 font-bold text-center mt-20">Generate topologi untuk melihat info</p>}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .react-flow__handle { background: transparent !important; border: none !important; }
        .react-flow__edge.animated path { stroke-dasharray: 10; animation: dash 0.6s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
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
