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
  AlertTriangle, Link2Off, Globe, Cpu, Info, Eye, EyeOff
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
  { id: 'materi_1', category: 'The Hook', title: 'Krisis 60 Menit Tanpa Internet', icon: <Globe size={20} />, description: 'Dunia berhenti berputar tanpa konektivitas.' },
  { id: 'materi_2', category: 'Arsitektur', title: 'Anatomi Jaringan', icon: <Cpu size={20} />, description: 'Harmoni perangkat keras membagi data.' }
];

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ data, selected }: any) => {
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  const isSimulating = data.isSimulating;
  
  const shouldAnimate = (['router', 'wifi', 'ap'].includes(data.shapeType) && !isDown && !isDisconnected) || (isSimulating && !isDown && !isDisconnected);
  
  // NODE KHUSUS UNTUK TITIK DI KABEL (JUNCTION)
  if (data.type === 'junction') {
    return (
      <div className="relative flex items-center justify-center">
        {/* Bulatan hitam kecil di tengah kabel */}
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
      {/* Handle disembunyikan tapi tetap berfungsi */}
      <Handle type="target" position={Position.Top} id="t" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="b" className="opacity-0" />
      
      <div className={`w-full h-full flex flex-col items-center justify-center text-center bg-white border-[3px] ${isDown || isDisconnected ? 'border-red-400' : 'border-slate-800'} rounded-2xl p-4 shadow-md transition-colors`}>
        <div className="mb-1 relative">
          {shouldAnimate && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150"></div>}
          <div className={`${shouldAnimate ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-800'}`}>
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
  const [showDefinition, setShowDefinition] = useState(true);

  // LOGIKA SIMULASI (TETAP DIJAGA)
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
    if (!isLive) setNodes(nds => nds.map(n => ({...n, data: {...n.data, isDisconnected: false, isSimulating: false}})));
  }, [isLive, edges.filter(e => e.data?.status === 'broken').length, nodes.filter(n => n.data.status === 'down').length]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  // --- GENERATE TOPOLOGY BUS (FIXED) ---
  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    setTopologyInfo(type);
    
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

        // 1. Titik Junction (Pusat Kabel)
        newNodes.push({
          id: junctionId,
          type: 'universal',
          position: { x: posX, y: 300 },
          data: { type: 'junction' },
        });

        // 2. Backbone (Kabel Horizontal)
        if (i > 0) {
          newEdges.push({
            id: `backbone-${i}`,
            source: `junc-${i-1}-${timestamp}`,
            target: junctionId,
            sourceHandle: 'right',
            targetHandle: 'left',
            style: { strokeWidth: 8, stroke: '#0f172a' },
            type: 'straight'
          });
        }

        // 3. Perangkat (PC/Router)
        newNodes.push({
          id: deviceId,
          type: 'universal',
          position: { x: posX - 50, y: isTop ? 100 : 450 },
          data: { 
            type: 'device', 
            shapeType: i === 0 ? 'router' : 'pc', 
            label: i === 0 ? 'GATEWAY' : `PC-${i}`, 
            status: 'up', 
            onChange: (v: string) => onNodeLabelChange(deviceId, v) 
          },
          style: { width: 110, height: 110 }
        });

        // 4. Kabel Drop (Vertikal Tegak Lurus)
        newEdges.push({
          id: `drop-${i}`,
          source: junctionId,
          target: deviceId,
          sourceHandle: isTop ? 'top' : 'bottom',
          targetHandle: isTop ? 'b' : 't',
          style: { strokeWidth: 4, stroke: '#0f172a' },
          type: 'straight'
        });
      }
    } else {
      // Mesh Logic (Tetap)
      const meshNodes = Array.from({ length: 5 }).map((_, i) => {
        const id = `mesh-${i}-${timestamp}`;
        return {
          id, type: 'universal',
          position: { x: 400 + 250 * Math.cos(2*Math.PI*i/5), y: 350 + 250 * Math.sin(2*Math.PI*i/5) },
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

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 4, stroke: '#0f172a' } }, eds));
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type: 'universal', position: { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 },
      data: { type: 'device', shapeType: val, label: val.toUpperCase(), status: 'up', onChange: (v: string) => onNodeLabelChange(id, v) },
      style: { width: 100, height: 100 }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* Sidebar (Sama seperti sebelumnya) */}
      <aside className="w-80 bg-white border-r flex flex-col z-[60] shadow-xl relative">
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
                <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', item); }} className="p-3 border rounded-xl flex flex-col items-center bg-white hover:bg-slate-50 cursor-grab shadow-sm transition-all hover:scale-105">
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
            <div className="space-y-4">
              <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black transition-all ${isLive ? 'bg-red-500 text-white shadow-red-200' : 'bg-blue-600 text-white shadow-blue-200'} shadow-lg`}>
                {isLive ? <><StopSquare size={18}/> STOP SIMULATION</> : <><Play size={18}/> START SIMULATION</>}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => alert('Saved!')} className="py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Save size={14}/> SAVE</button>
            <button onClick={() => alert('Loaded!')} className="py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><FolderOpen size={14}/> LOAD</button>
          </div>
          <button onClick={() => {setNodes([]); setEdges([]);}} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200 uppercase">Hapus Canvas</button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"><RefreshCcw size={12}/> Gen Bus</button>
            <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-white text-indigo-600 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"><RefreshCcw size={12}/> Gen Mesh</button>
          </div>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge', isEdge: true }); }}
          fitView
        >
          <Background gap={25} size={1} color="#e2e8f0" />
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
      </div>

      {/* Global CSS for perfection */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        /* Hilangkan lingkaran biru default react-flow handle */
        .react-flow__handle {
          background: transparent !important;
          border: none !important;
          min-width: 1px !important;
          min-height: 1px !important;
        }

        /* Styling garis simulasi agar lebih halus */
        .react-flow__edge.animated path {
          stroke-dasharray: 8;
          animation: dash 0.8s linear infinite;
        }
        @keyframes dash {
          from { stroke-dashoffset: 16; }
          to { stroke-dashoffset: 0; }
        }
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
