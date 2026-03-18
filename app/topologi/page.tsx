'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  Handle,
  Position,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Zap, Flame, Radio, Info, Users, ChevronLeft, ChevronRight,
  Trash2, Link2Off, Spline, Play, Square, Activity
} from 'lucide-react';

// --- ICONS LIBRARY ---
const iconLib: any = {
  pc: <Monitor size={42} />,
  router: <Router size={42} />, 
  switch: <Network size={42} />, 
  wifi: <Wifi size={42} />, 
  server: <Server size={42} />, 
  hub: <Zap size={42} />,
  firewall: <Flame size={42} />,
  ap: <Radio size={42} />,
  kabel: <Spline size={42} /> 
};

// --- INTERNAL LOGIC: GENERATE BUS ---
const generateBushInternal = (updateNodeData: any) => {
  const busNodes: any[] = [];
  const busEdges: any[] = [];
  const nodeCount = 5;
  for (let i = 0; i < nodeCount; i++) {
    const jId = `j-${i}`;
    busNodes.push({
      id: jId,
      type: 'universal',
      position: { x: 100 + (i * 200), y: 300 },
      data: { type: 'junction', isLive: false }
    });
    const pcId = `pc-${i}`;
    busNodes.push({
      id: pcId,
      type: 'universal',
      position: { x: 100 + (i * 200), y: i % 2 === 0 ? 150 : 450 },
      data: { shapeType: 'pc', label: `PC-${i + 1}`, onChange: updateNodeData, isLive: false }
    });
    busEdges.push({ id: `e-pc-${i}`, source: jId, target: pcId, style: { stroke: '#1e293b', strokeWidth: 3 } });
    if (i > 0) {
      busEdges.push({ id: `e-b-${i}`, source: `j-${i-1}`, target: jId, style: { stroke: '#1e293b', strokeWidth: 5 } });
    }
  }
  return { nodes: busNodes, edges: busEdges };
};

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  const iconColor = isDown ? 'text-red-500 opacity-50' : data.isLive ? 'text-blue-500' : 'text-slate-700';

  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${data.isLive ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
        <Handle type="source" position={Position.Left} id="l" />
        <Handle type="source" position={Position.Right} id="r" />
        <Handle type="source" position={Position.Top} id="t" />
        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center group transition-transform hover:scale-110">
      <Handle type="source" position={Position.Top} id="t" style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Left} id="l" style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Right} id="r" style={{ background: '#3b82f6' }} />
      <div className={`${iconColor} transition-all duration-300`}>
        {iconLib[data.shapeType] || <Monitor size={42}/>}
      </div>
      <div className="text-[10px] font-bold uppercase text-slate-600 mt-1">{data.label}</div>
      {isDown && <div className="absolute top-0 right-4 bg-red-600 text-white rounded-full p-1"><Link2Off size={10}/></div>}
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showPanel, setShowPanel] = useState(true);
  const [topologyType, setTopologyType] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
  }, [setNodes]);

  const handleGenerateTopology = (type: string) => {
    setTopologyType(type);
    if (type === 'bus') {
      const result = generateBushInternal(updateNodeData);
      setNodes(result.nodes);
      setEdges(result.edges);
    } else {
      setNodes([]); setEdges([]); // Topologi lain bisa ditambahkan di sini
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR LEFT */}
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={28}/>
          <div className="text-sm tracking-tighter uppercase leading-none">Mejatika Lab<br/><span className="text-[10px] text-slate-400 not-italic">Visual Topology</span></div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
           <button onClick={() => handleGenerateTopology('bus')} className="w-full mb-2 p-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all uppercase">Generate Bus Topology</button>
           <button onClick={() => {setNodes([]); setEdges([]); setTopologyType(null)}} className="w-full p-3 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all uppercase">Clear Canvas</button>
        </div>
        <div className="p-4 border-t text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">SANPIO AI LAB © 2026</div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-grow relative" ref={reactFlowWrapper}>
        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} fitView
        >
          <Background color="#e2e8f0" gap={30} variant={"dots" as any} /><Controls />
        </ReactFlow>

        {/* --- REPORT PANEL (STATIC & FIX) --- */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest text-white">Knowledge Base</span>
          </button>
          
          <div className="w-[340px] bg-white h-full p-6 shadow-2xl overflow-y-auto border-l border-slate-200">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800">
              <Network className="text-blue-600"/> Katalog Topologi
            </h2>

            <div className="space-y-8 pb-20">
              {/* TOPOLOGI BUS */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase">
                  <div className="bg-blue-500 w-2 h-4 rounded-sm"></div> Topologi Bus
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Menghubungkan semua node ke satu kabel pusat (backbone). Fungsinya transmisi data sederhana pada jaringan skala kecil.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700"><b>+</b> Hemat kabel & murah.</div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700"><b>-</b> Backbone putus, semua mati.</div>
                </div>
              </section>

              {/* TOPOLOGI STAR */}
              <section className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase">
                  <div className="bg-yellow-500 w-2 h-4 rounded-sm"></div> Topologi Star
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Perangkat terhubung ke switch pusat. Sangat umum digunakan di lab komputer modern.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700"><b>+</b> Mudah troubleshoot.</div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700"><b>-</b> Butuh banyak kabel.</div>
                </div>
              </section>

              {/* Tambahkan Topologi lainnya di sini dengan format yang sama */}
            </div>
            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Sanpio AI Lab Knowledge Base © 2026
            </div>
          </div>
        </div>
      </main>
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
