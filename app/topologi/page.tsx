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
  Trash2, Link2Off, Spline, Play, Square, Circle, Star, GitMerge
} from 'lucide-react';

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

// --- CUSTOM NODE COMPONENT (ICON ONLY) ---
const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  
  // Warna ikon berdasarkan status
  const iconColor = isDown 
    ? 'text-red-500 opacity-50' 
    : data.isLive 
      ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' 
      : 'text-slate-700 hover:text-blue-400';

  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${data.isLive ? 'bg-blue-500 animate-ping' : 'bg-slate-800'}`} />
        <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="r" style={{ opacity: 0 }} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center group transition-transform hover:scale-110">
      {/* Invisible Handles untuk koneksi kabel */}
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0, top: '20%' }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ opacity: 0, bottom: '20%' }} />
      <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0, left: '20%' }} />
      <Handle type="source" position={Position.Right} id="r" style={{ opacity: 0, right: '20%' }} />
      
      {/* Icon Area */}
      <div className={`${iconColor} transition-all duration-300 ${data.isLive && !isDown ? 'animate-bounce' : ''}`}>
        {iconLib[data.shapeType] || <Monitor size={42}/>}
      </div>

      {/* Label di bawah ikon */}
      <input 
        defaultValue={data.label} 
        onChange={(e) => data.onChange(id, e.target.value)}
        className={`bg-transparent border-none text-[10px] font-bold uppercase text-center focus:ring-0 w-24 mt-1 p-0 cursor-text ${isDown ? 'text-red-400' : 'text-slate-600'}`}
      />

      {/* Status Down Overlay */}
      {isDown && (
        <div className="absolute top-0 right-4 bg-red-600 text-white rounded-full p-1 shadow-md">
          <Link2Off size={10}/>
        </div>
      )}
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge' } | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [topologyType, setTopologyType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
  }, [setNodes]);

  const toggleSimulation = () => {
    const nextState = !isLive;
    setIsLive(nextState);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isLive: nextState } })));
    setEdges((eds) => eds.map((e) => ({ 
      ...e, 
      animated: nextState && e.data?.status !== 'broken',
      style: { ...e.style, stroke: nextState && e.data?.status !== 'broken' ? '#3b82f6' : (e.data?.status === 'broken' ? '#ef4444' : '#1e293b') }
    })));
  };

  const generateTopology = (type: 'bus' | 'mesh' | 'star' | 'ring' | 'hybrid') => {
    setNodes([]); setEdges([]); setTopologyType(type); setIsLive(false);
    const newNodes: any[] = []; const newEdges: any[] = [];
    const centerX = 600, centerY = 400;

    if (type === 'bus') {
      for (let i = 0; i < 5; i++) {
        const xPos = i * 250 + 200;
        newNodes.push({ id: `j-${i}`, type: 'universal', position: { x: xPos, y: 350 }, data: { type: 'junction', isLive: false } });
        if (i > 0) newEdges.push({ id: `back-${i}`, source: `j-${i-1}`, target: `j-${i}`, style: { strokeWidth: 6, stroke: '#1e293b' } });
        const isTop = i % 2 === 0;
        newNodes.push({ id: `n-${i}`, type: 'universal', position: { x: xPos - 55, y: isTop ? 180 : 480 }, data: { shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `NODE-${i}`, onChange: updateNodeData, isLive: false } });
        newEdges.push({ id: `drop-${i}`, source: `j-${i}`, target: `n-${i}`, style: { strokeWidth: 3, stroke: '#64748b' } });
      }
    } 
    else if (type === 'star') {
      const hubId = 'central-hub';
      newNodes.push({ id: hubId, type: 'universal', position: { x: centerX - 60, y: centerY - 40 }, data: { shapeType: 'switch', label: 'CENTER SWITCH', onChange: updateNodeData, isLive: false } });
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const x = centerX + 280 * Math.cos(angle) - 60;
        const y = centerY + 280 * Math.sin(angle) - 40;
        newNodes.push({ id: `s-pc-${i}`, type: 'universal', position: { x, y }, data: { shapeType: 'pc', label: `CLIENT-${i+1}`, onChange: updateNodeData, isLive: false } });
        newEdges.push({ id: `es-${i}`, source: hubId, target: `s-pc-${i}`, style: { strokeWidth: 3, stroke: '#1e293b' } });
      }
    }
    else if (type === 'ring') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
        newNodes.push({ id: `r-${i}`, type: 'universal', position: { x: centerX + 240 * Math.cos(angle) - 60, y: centerY + 240 * Math.sin(angle) - 40 }, data: { shapeType: 'pc', label: `PC-${i+1}`, onChange: updateNodeData, isLive: false } });
      }
      for (let i = 0; i < count; i++) {
        newEdges.push({ id: `er-${i}`, source: `r-${i}`, target: `r-${(i+1)%count}`, style: { strokeWidth: 3, stroke: '#1e293b' } });
      }
    }
    else if (type === 'hybrid') {
        const hubA = 'ha'; const hubB = 'hb';
        newNodes.push({ id: hubA, type: 'universal', position: { x: 400, y: 350 }, data: { shapeType: 'switch', label: 'HUB A', onChange: updateNodeData, isLive: false } });
        newNodes.push({ id: hubB, type: 'universal', position: { x: 800, y: 350 }, data: { shapeType: 'switch', label: 'HUB B', onChange: updateNodeData, isLive: false } });
        
        [hubA, hubB].forEach((h, idx) => {
            for(let j=0; j<2; j++) {
                const pcId = `p-${h}-${j}`;
                newNodes.push({ id: pcId, type: 'universal', position: { x: (idx === 0 ? 400 : 800) + (j === 0 ? -150 : 150), y: 180 }, data: { shapeType: 'pc', label: `USER-${idx+1}.${j+1}`, onChange: updateNodeData, isLive: false } });
                newEdges.push({ id: `e-${pcId}`, source: h, target: pcId, style: { strokeWidth: 3, stroke: '#1e293b' } });
            }
        });
        newEdges.push({ id: 'backbone', source: hubA, target: hubB, style: { strokeWidth: 8, stroke: '#1e293b', strokeDasharray: '10,5' }, label: 'BACKBONE' });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={28}/>
          <div className="text-sm tracking-tighter uppercase leading-none">Mejatika Lab<br/><span className="text-[10px] text-slate-400 not-italic">Visual Topology</span></div>
        </div>

        <div className="flex bg-slate-100 text-[10px] font-black border-b uppercase">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('simulasi')} className={`flex-1 py-4 transition-all ${activeTab === 'simulasi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).filter(k => k !== 'kabel').map(key => (
                <div key={key} draggable onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-4 border-2 border-slate-50 rounded-2xl flex flex-col items-center bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md cursor-grab active:scale-95 transition-all group">
                  <div className="text-slate-600 group-hover:text-blue-500 transition-colors">{iconLib[key]}</div>
                  <span className="text-[9px] font-bold mt-2 uppercase text-slate-400 group-hover:text-slate-600">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={toggleSimulation} className={`w-full py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-3 transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                {isLive ? <><Square size={16}/> STOP SIMULASI</> : <><Play size={16}/> START SIMULASI</>}
              </button>
              <div className={`p-4 rounded-xl border-2 text-center transition-colors ${isLive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isLive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                  {isLive ? "Traffic Data Aktif" : "Network Standby"}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">SANPIO AI LAB © 2026</div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-grow relative" ref={reactFlowWrapper} onClick={() => setMenu(null)}>
        {/* TOPOLOGY SELECTOR */}
        <div className="absolute top-4 left-4 z-[50] flex flex-wrap gap-2">
          {['Bus', 'Ring', 'Star', 'Hybrid'].map((label) => (
            <button key={label} onClick={() => generateTopology(label.toLowerCase() as any)} className="px-5 py-2.5 bg-white shadow-lg rounded-full text-[10px] font-black border border-slate-100 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter">
              {label}
            </button>
          ))}
          <button onClick={() => {setNodes([]); setEdges([]); setTopologyType(null)}} className="px-5 py-2.5 bg-slate-900 text-white shadow-lg rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors">Clear</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onDrop={(e) => {
            const type = e.dataTransfer.getData('application/value');
            if (!type) return;
            const rect = reactFlowWrapper.current?.getBoundingClientRect();
            if (!rect) return;
            setNodes((nds) => nds.concat({ id: `n-${Date.now()}`, type: 'universal', position: { x: e.clientX - rect.left - 30, y: e.clientY - rect.top - 30 }, data: { shapeType: type, label: type.toUpperCase(), onChange: updateNodeData, isLive } }));
          }}
          onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes}
          onConnect={(p) => setEdges(eds => addEdge({...p, style:{strokeWidth:3, stroke: isLive ? '#3b82f6' : '#1e293b'}, animated: isLive}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }}
          connectionMode={ConnectionMode.Loose} fitView
        >
          <Background color="#e2e8f0" gap={30} variant={"dots" as any} /><Controls />
        </ReactFlow>

        {/* FOOTER */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 p-4 rounded-full border border-slate-200 shadow-xl z-40 backdrop-blur-md">
           <div className="flex items-center gap-3 text-slate-800 font-bold text-[10px] uppercase px-4">
             <Users size={14} className="text-blue-600" /><span>Kelompok: Farel, Andri, Eklan, Boven</span>
           </div>
        </div>

        {/* CONTEXT MENU */}
        {menu && (
          <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-52 animate-in zoom-in-95">
              <div className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-2 tracking-widest text-center">Settings</div>
              {menu.type === 'node' ? (
                <div className="space-y-1">
                  <button onClick={() => { updateNodeData(menu.id, { status: 'down' }); setMenu(null); }} className="w-full py-2 hover:bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg uppercase transition-colors">Matikan Node</button>
                  <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Trash2 size={12}/> Hapus</button>
                </div>
              ) : (
                <div className="space-y-1">
                 <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}, animated: false, style: {stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '5,5'}} : e)); setMenu(null); }} className="w-full py-2 hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Link2Off size={12}/> Putus Kabel</button>
                 <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== menu.id)); setMenu(null); }} className="w-full py-2 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Trash2 size={12}/> Hapus Jalur</button>
                </div>
              )}
          </div>
        )}

        {/* ANALISIS PANEL */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">Reports</span>
          </button>
          <div className="w-[340px] bg-white h-full p-8 shadow-2xl overflow-y-auto">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800"><Info className="text-blue-600"/> Analisis Sistem</h2>
            <div className="space-y-4 text-[10px] font-bold text-slate-600 uppercase">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">Topology: <span className="text-blue-600">{topologyType || 'Custom'}</span></div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">Nodes Count: <span>{nodes.length} Devices</span></div>
               
               <div className="mt-8 border-t pt-4">
                  <h4 className="text-blue-600 mb-3 tracking-widest">Teori Jaringan:</h4>
                  <div className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-blue-100 pl-4 normal-case font-medium">
                    {topologyType === 'ring' && "Data mengalir secara estafet dari satu node ke node berikutnya. Sangat efisien namun rawan karena jika satu node mati, seluruh jaringan bisa lumpuh."}
                    {topologyType === 'star' && "Topologi paling populer saat ini. Semua perangkat terhubung ke switch pusat. Sangat mudah diperbaiki jika ada satu kabel yang putus."}
                    {topologyType === 'hybrid' && "Menggabungkan dua atau lebih topologi yang berbeda. Memberikan skalabilitas maksimal untuk perusahaan besar."}
                    {topologyType === 'bus' && "Menggunakan satu kabel utama (backbone). Sederhana dan murah, namun performa menurun jika terlalu banyak node yang terhubung."}
                    {!topologyType && "Silakan rancang topologi atau pilih template di atas untuk melihat analisis teknis."}
                  </div>
               </div>
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
