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
  Zap, HardDrive, DoorOpen, Flame, Radio, Play, Square as StopSquare, 
  AlertTriangle, Link2Off, RefreshCcw, Info, ChevronLeft, ChevronRight,
  CheckCircle2, Users, HardDriveDownload
} from 'lucide-react';

// --- CONFIGURATION & COMPONENTS ---
const iconLib: any = {
  router: <Router size={40} />, 
  pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, 
  server: <Server size={40} />, 
  gateway: <DoorOpen size={40} />, 
};

const UniversalNode = ({ data, selected }: any) => {
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  const isSimulating = data.isSimulating;
  
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
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-105' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="b" className="opacity-0" />
      <div className={`w-full h-full flex flex-col items-center justify-center text-center bg-white border-[3px] ${isDown || isDisconnected ? 'border-red-400' : 'border-slate-800'} rounded-2xl p-4 shadow-md transition-colors`}>
        <div className={`${isSimulating && !isDown && !isDisconnected ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-700'}`}>
          {iconLib[data.shapeType] || <Monitor size={40}/>}
        </div>
        <div className="text-[10px] font-black uppercase text-slate-800 mt-1">{data.label}</div>
      </div>
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLive, setIsLive] = useState(false);
  const [topologyInfo, setTopologyInfo] = useState<'bus' | 'mesh' | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');

  // Logic Simulasi
  useEffect(() => {
    if (!isLive) return;
    setNodes(nds => nds.map(n => ({...n, data: {...n.data, isSimulating: isLive}})));
    setEdges(eds => eds.map(e => ({...e, animated: isLive && e.data?.status !== 'broken'})));
  }, [isLive]);

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
        const juncId = `junc-${i}`;
        const devId = `node-${i}`;
        const posX = i * 250 + 200;
        newNodes.push({ id: juncId, type: 'universal', position: { x: posX, y: 300 }, data: { type: 'junction' } });
        if (i > 0) newEdges.push({ id: `b-${i}`, source: `junc-${i-1}`, target: juncId, style: { strokeWidth: 8, stroke: '#0f172a' }, type: 'straight' });
        newNodes.push({
          id: devId, type: 'universal', position: { x: posX - 55, y: i % 2 === 0 ? 100 : 450 },
          data: { type: 'device', shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `PC-${i}` },
          style: { width: 110, height: 110 }
        });
        newEdges.push({ id: `d-${i}`, source: juncId, target: devId, style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight' });
      }
    } else {
      // Mesh Logic
      const meshNodes = Array.from({ length: 5 }).map((_, i) => ({
        id: `m-${i}`, type: 'universal', position: { x: 450 + 200 * Math.cos(2*Math.PI*i/5), y: 350 + 200 * Math.sin(2*Math.PI*i/5) },
        data: { type: 'device', shapeType: 'pc', label: `PC-${i}` }, style: { width: 100, height: 100 }
      }));
      newNodes.push(...meshNodes);
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) 
        newEdges.push({ id: `e-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 3, stroke: '#2563eb' } });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR LEFT */}
      <aside className="w-72 bg-white border-r flex flex-col z-50 shadow-lg">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase flex items-center gap-3">
          <ShieldCheck size={24} className="text-blue-500"/>
          <span className="text-sm">MEJATIKA LAB</span>
        </div>
        <div className="flex-grow p-4 space-y-4">
          <button onClick={() => generateTopology('bus')} className="w-full py-3 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-blue-500 transition-all"><RefreshCcw size={14}/> Gen Bus</button>
          <button onClick={() => generateTopology('mesh')} className="w-full py-3 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:border-blue-500 transition-all"><RefreshCcw size={14}/> Gen Mesh</button>
          <hr />
          <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl font-black text-xs text-white shadow-lg transition-all ${isLive ? 'bg-red-500' : 'bg-blue-600'}`}>
            {isLive ? 'STOP SIMULATION' : 'START SIMULATION'}
          </button>
        </div>
      </aside>

      {/* CANVAS AREA */}
      <main className="flex-grow relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} fitView>
          <Background color="#cbd5e1" gap={20} />
          <Controls />
        </ReactFlow>

        {/* ANGGOTA KELOMPOK (POJOK KANAN BAWAH) */}
        {topologyInfo && (
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl z-40 animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Users size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Team Members</span>
            </div>
            <ul className="text-xs font-bold text-slate-700 space-y-1">
              <li>1. Ahmad Mejatika</li>
              <li>2. Siti Jaringan</li>
              <li>3. Budi Topology</li>
            </ul>
          </div>
        )}

        {/* SLIDE-IN INFO PANEL (RIGHT) */}
        <div className={`absolute top-0 right-0 h-full flex z-[100] transition-transform duration-500 ease-in-out ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          {/* Toggle Handle Button */}
          <div className="h-full flex flex-col justify-center">
            <button 
              onClick={() => setShowPanel(!showPanel)}
              className="bg-blue-600 text-white p-2 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 py-8 hover:bg-blue-700 transition-colors"
            >
              {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
              <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.2em]">
                {showPanel ? 'Tutup' : 'Show Info'}
              </span>
            </button>
          </div>

          {/* Content Panel */}
          <div className="w-[350px] bg-white h-full shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-slate-200 p-8 overflow-y-auto">
            {topologyInfo ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-blue-600">
                  <Info size={24} />
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Topologi {topologyInfo}</h2>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                  {topologyInfo === 'bus' ? 'Menggunakan satu kabel backbone sebagai jalur utama data.' : 'Setiap node terhubung satu sama lain secara dedicated.'}
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase text-emerald-600 flex items-center gap-2"><CheckCircle2 size={16}/> Kelebihan</h3>
                  <ul className="text-xs font-bold text-slate-700 space-y-2 pl-4">
                    {topologyInfo === 'bus' ? (
                      <><li>• Irit kabel & biaya</li><li>• Layout simpel</li><li>• Mudah dikembangkan</li></>
                    ) : (
                      <><li>• Sangat Reliabel</li><li>• Privacy Terjamin</li><li>• Identifikasi masalah cepat</li></>
                    )}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase text-red-600 flex items-center gap-2"><AlertTriangle size={16}/> Kekurangan</h3>
                  <ul className="text-xs font-bold text-slate-700 space-y-2 pl-4">
                    {topologyInfo === 'bus' ? (
                      <><li>• Backbone putus = Mati total</li><li>• Sering tabrakan data</li><li>• Performa turun jika node banyak</li></>
                    ) : (
                      <><li>• Sangat boros kabel</li><li>• Biaya instalasi mahal</li><li>• Konfigurasi rumit</li></>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <HardDriveDownload size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">Pilih topologi di sidebar untuk melihat informasi</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .react-flow__handle { background: transparent !important; border: none !important; }
        .react-flow__edge-path { stroke-linecap: round; }
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
