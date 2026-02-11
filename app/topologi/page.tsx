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
  CheckCircle2, XCircle
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

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ data, selected }: any) => {
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  const isSimulating = data.isSimulating;
  
  const shouldAnimate = (['router', 'wifi', 'ap'].includes(data.shapeType) && !isDown && !isDisconnected) || (isSimulating && !isDown && !isDisconnected);
  
  if (data.type === 'junction') {
    return (
      <div className="relative flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full bg-slate-900 border border-white shadow-sm ${isDown ? 'bg-red-500' : ''}`} />
        <Handle type="target" position={Position.Left} id="left" className="opacity-0" />
        <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
        <Handle type="source" position={Position.Top} id="top" className="opacity-0" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-105' : ''} ${isDown || isDisconnected ? 'opacity-70' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="b" className="opacity-0" />
      
      <div className={`w-full h-full flex flex-col items-center justify-center text-center bg-white border-[3px] ${isDown || isDisconnected ? 'border-red-400' : 'border-slate-800'} rounded-2xl p-4 shadow-md transition-colors`}>
        <div className="mb-1 relative">
          {shouldAnimate && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150"></div>}
          <div className={`${shouldAnimate ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-700'}`}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
            {(isDown || isDisconnected) && <AlertTriangle size={16} className="absolute -top-2 -right-2 text-red-600 animate-bounce" />}
          </div>
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className={`bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1 overflow-hidden ${isDown || isDisconnected ? 'text-red-600' : 'text-slate-800'}`}
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

  // LOGIKA SIMULASI
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

  useEffect(() => {
    checkConnectivity();
  }, [isLive, edges.filter(e => e.data?.status === 'broken').length, nodes.filter(n => n.data.status === 'down').length]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    setTopologyInfo(type);
    setShowPanel(true);
    
    const count = 5;
    const timestamp = Date.now();
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    if (type === 'bus') {
      for (let i = 0; i < count; i++) {
        const junctionId = `junc-${i}-${timestamp}`;
        const deviceId = `node-${i}-${timestamp}`;
        const isTop = i % 2 === 0;
        const posX = i * 250 + 200;

        newNodes.push({ id: junctionId, type: 'universal', position: { x: posX, y: 300 }, data: { type: 'junction' } });

        if (i > 0) {
          newEdges.push({
            id: `backbone-${i}`, source: `junc-${i-1}-${timestamp}`, target: junctionId,
            sourceHandle: 'right', targetHandle: 'left', style: { strokeWidth: 8, stroke: '#0f172a' }, type: 'straight'
          });
        }

        newNodes.push({
          id: deviceId, type: 'universal', position: { x: posX - 55, y: isTop ? 100 : 450 },
          data: { 
            type: 'device', shapeType: i === 0 ? 'router' : 'pc', 
            label: i === 0 ? 'GATEWAY' : `PC-${i}`, status: 'up', 
            onChange: (v: string) => onNodeLabelChange(deviceId, v) 
          },
          style: { width: 110, height: 110 }
        });

        newEdges.push({
          id: `drop-${i}`, source: junctionId, target: deviceId,
          sourceHandle: isTop ? 'top' : 'bottom', targetHandle: isTop ? 'b' : 't',
          style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight'
        });
      }
    } else {
      const meshNodes = Array.from({ length: 5 }).map((_, i) => {
        const id = `mesh-${i}-${timestamp}`;
        return {
          id, type: 'universal',
          position: { x: 450 + 250 * Math.cos(2*Math.PI*i/5), y: 350 + 250 * Math.sin(2*Math.PI*i/5) },
          data: { type: 'device', shapeType: 'pc', label: `PC-${i}`, status: 'up', onChange: (v: string) => onNodeLabelChange(id, v) },
          style: { width: 100, height: 100 }
        };
      });
      newNodes.push(...meshNodes);
      for (let i = 0; i < meshNodes.length; i++) {
        for (let j = i + 1; j < meshNodes.length; j++) {
          newEdges.push({ id: `e${i}-${j}`, source: meshNodes[i].id, target: meshNodes[j].id, style: { strokeWidth: 3, stroke: '#2563eb' } });
        }
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col z-[60] shadow-xl relative">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-500"/>
          <div>MEJATIKA LAB <div className="text-[9px] mt-1 opacity-70 font-normal tracking-widest text-blue-400">SANPIO EDITION</div></div>
        </div>
        <div className="flex bg-slate-50 border-b">
          {['inventory', 'simulasi'].map((t) => (
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
          ) : (
            <div className="space-y-4">
              <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black transition-all ${isLive ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'} shadow-lg`}>
                {isLive ? <><StopSquare size={18}/> STOP SIMULATION</> : <><Play size={18}/> START SIMULATION</>}
              </button>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 space-y-2">
           <button onClick={() => {setNodes([]); setEdges([]); setTopologyInfo(null); setShowPanel(false);}} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200 uppercase">Hapus Canvas</button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        <div className="absolute top-4 left-4 z-[100] flex gap-2">
            <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"><RefreshCcw size={12}/> Gen Bus</button>
            <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-white text-indigo-600 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"><RefreshCcw size={12}/> Gen Mesh</button>
            <button onClick={() => setShowPanel(!showPanel)} className={`px-5 py-2 text-[10px] font-black rounded-xl shadow-lg border flex items-center gap-2 transition-all uppercase tracking-widest ${showPanel ? 'bg-amber-500 text-white' : 'bg-white text-slate-600'}`}>
               {showPanel ? <EyeOff size={12}/> : <Eye size={12}/>} Info Panel
            </button>
        </div>

        {/* --- INFO PANEL BARU --- */}
        {topologyInfo && showPanel && (
          <div className="absolute bottom-6 right-6 z-[100] bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-2xl w-[450px] animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white"><Info size={20} /></div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Topologi {topologyInfo}</h4>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20}/></button>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium italic">
              {topologyInfo === 'bus' 
                ? 'Struktur jaringan di mana semua node terhubung ke satu kabel pusat tunggal yang disebut backbone.' 
                : 'Struktur jaringan di mana setiap perangkat terhubung langsung ke satu sama lain, menciptakan jalur komunikasi ganda.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="text-[11px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest">
                  <CheckCircle2 size={14}/> Kelebihan
                </h5>
                <ul className="text-[11px] text-slate-700 space-y-2 font-bold leading-tight">
                  {topologyInfo === 'bus' ? (
                    <>
                      <li>• Biaya kabel sangat murah</li>
                      <li>• Sangat mudah diinstalasi</li>
                      <li>• Tidak butuh hub/switch</li>
                    </>
                  ) : (
                    <>
                      <li>• Sangat tahan kegagalan</li>
                      <li>• Data terkirim lebih cepat</li>
                      <li>• Keamanan data terjamin</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="space-y-3 border-l pl-4 border-slate-100">
                <h5 className="text-[11px] font-black text-red-600 uppercase flex items-center gap-2 tracking-widest">
                  <AlertTriangle size={14}/> Kekurangan
                </h5>
                <ul className="text-[11px] text-slate-700 space-y-2 font-bold leading-tight">
                  {topologyInfo === 'bus' ? (
                    <>
                      <li>• Jika kabel utama putus, total mati</li>
                      <li>• Sering terjadi tabrakan data</li>
                      <li>• Sulit mencari lokasi kerusakan</li>
                    </>
                  ) : (
                    <>
                      <li>• Biaya instalasi sangat mahal</li>
                      <li>• Pengaturan sangat rumit</li>
                      <li>• Boros penggunaan kabel</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background gap={25} size={1} color="#e2e8f0" />
          <Controls />
        </ReactFlow>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .react-flow__handle { background: transparent !important; border: none !important; }
        .react-flow__edge.animated path { stroke-dasharray: 8; animation: dash 0.8s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
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
