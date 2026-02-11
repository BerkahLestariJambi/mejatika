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
  CheckCircle2, Trash2, Link2Off, AlertTriangle, PencilRuler,
  Spline, Play, Square
} from 'lucide-react';

const iconLib: any = {
  pc: <Monitor size={32} />,
  router: <Router size={32} />, 
  switch: <Network size={32} />, 
  wifi: <Wifi size={32} />, 
  server: <Server size={32} />, 
  hub: <Zap size={32} />,
  firewall: <Flame size={32} />,
  ap: <Radio size={32} />,
  kabel: <Spline size={32} /> 
};

const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  const activeClass = data.isLive && !isDown ? 'animate-pulse text-blue-600' : isDown ? 'text-red-600' : 'text-slate-700';
  
  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${data.isLive ? 'bg-blue-500 animate-ping' : 'bg-slate-900'}`} />
        <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      </div>
    );
  }

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="r" style={{ opacity: 0 }} />
      
      <div className={`flex flex-col items-center justify-center min-w-[120px] p-4 bg-white border-[3px] rounded-xl shadow-xl transition-all ${isDown ? 'border-red-500 bg-red-50 scale-95 opacity-80' : data.isLive ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-800 hover:border-blue-500'}`}>
        <div className={activeClass}>
          {iconLib[data.shapeType] || <Monitor size={32}/>}
        </div>
        <input 
          defaultValue={data.label} 
          onChange={(e) => data.onChange(id, e.target.value)}
          className="bg-transparent border-none text-[11px] font-black uppercase text-center focus:ring-0 w-full mt-1 p-0 cursor-text"
        />
        {isDown && <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><Link2Off size={12}/></div>}
      </div>
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
  const [topologyType, setTopologyType] = useState<'bus' | 'mesh' | 'praktek' | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
  }, [setNodes]);

  const toggleSimulation = () => {
    const nextState = !isLive;
    setIsLive(nextState);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isLive: nextState } })));
    setEdges((eds) => eds.map((e) => ({ ...e, animated: nextState && e.data?.status !== 'broken' })));
  };

  const handleTabClick = (tab: 'inventory' | 'simulasi') => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      setNodes([]); setEdges([]); setTopologyType('praktek'); setIsLive(false);
    }
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]); setTopologyType(type); setIsLive(false);
    const newNodes: any[] = []; const newEdges: any[] = [];

    if (type === 'bus') {
      const backboneY = 350;
      for (let i = 0; i < 5; i++) {
        const xPos = i * 250 + 200;
        newNodes.push({ id: `j-${i}`, type: 'universal', position: { x: xPos, y: backboneY }, data: { type: 'junction', isLive: false } });
        if (i > 0) newEdges.push({ id: `back-${i}`, source: `j-${i-1}`, target: `j-${i}`, style: { strokeWidth: 10, stroke: '#0f172a' }, type: 'straight' });
        const isTop = i % 2 === 0;
        newNodes.push({ id: `n-${i}`, type: 'universal', position: { x: xPos - 55, y: isTop ? backboneY - 200 : backboneY + 100 }, data: { shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `PC-${i}`, onChange: updateNodeData, isLive: false } });
        newEdges.push({ id: `drop-${i}`, source: `j-${i}`, target: `n-${i}`, sourceHandle: isTop ? 'top' : 'bottom', targetHandle: isTop ? 'b' : 't', style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight' });
      }
    } else {
      const count = 5;
      for (let i = 0; i < count; i++) {
        newNodes.push({ id: `m-${i}`, type: 'universal', position: { x: 450 + 250 * Math.cos(2*Math.PI*i/count), y: 350 + 250 * Math.sin(2*Math.PI*i/count) }, data: { shapeType: 'pc', label: `NODE-${i}`, onChange: updateNodeData, isLive: false } });
      }
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          newEdges.push({ id: `e-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 3, stroke: '#2563eb' } });
        }
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = (event: any) => {
    const type = event.dataTransfer.getData('application/value');
    if (!type || type === 'kabel') return;
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'universal', position: { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 40 }, data: { shapeType: type, label: type.toUpperCase(), onChange: updateNodeData, isLive } }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={28}/>
          <div className="text-sm tracking-tighter uppercase">Mejatika Lab</div>
        </div>
        <div className="flex bg-slate-50 text-[10px] font-black border-b uppercase">
          <button onClick={() => handleTabClick('inventory')} className={`flex-1 py-4 ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => handleTabClick('simulasi')} className={`flex-1 py-4 ${activeTab === 'simulasi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).map(key => (
                <div key={key} draggable={key !== 'kabel'} onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-3 border-2 border-slate-100 rounded-xl flex flex-col items-center bg-white hover:border-blue-500 shadow-sm cursor-grab">
                  <div className="text-slate-700">{iconLib[key]}</div>
                  <span className="text-[9px] font-black mt-1 uppercase text-slate-500">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={toggleSimulation} className={`w-full py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-3 transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
              {isLive ? <><Square size={16}/> STOP SIMULASI</> : <><Play size={16}/> START SIMULASI</>}
            </button>
          )}
        </div>
        <div className="p-4 border-t text-[9px] text-slate-400 text-center font-black italic">SANPIO AI LAB © 2026</div>
      </aside>

      <main className="flex-grow relative" ref={reactFlowWrapper} onClick={() => setMenu(null)}>
        {topologyType === 'praktek' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
            <h1 className="text-8xl font-black uppercase text-slate-900 text-center">CANVAS<br/>PRAKTIK</h1>
          </div>
        )}

        <div className="absolute top-4 left-4 z-[50] flex gap-2">
          <button onClick={() => generateTopology('bus')} className="px-5 py-2 bg-white shadow-xl rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all uppercase">Gen Bus</button>
          <button onClick={() => generateTopology('mesh')} className="px-5 py-2 bg-white shadow-xl rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase">Gen Mesh</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} 
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()} 
          nodeTypes={nodeTypes} 
          onConnect={(p) => setEdges(eds => addEdge({...p, style:{strokeWidth:4, stroke:'#0f172a'}, animated: isLive}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }}
          connectionMode={ConnectionMode.Loose} fitView
        >
          <Background color="#cbd5e1" gap={25} variant={"dots" as any} /><Controls />
        </ReactFlow>

        <div className="absolute bottom-6 right-[400px] bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xl z-40">
           <div className="flex items-center gap-2 mb-2 text-blue-600 border-b pb-1 font-black text-[10px] uppercase">
             <Users size={16} /><span>Kelompok: Farel, Andri, Eklan, Boven</span>
           </div>
        </div>

        {menu && (
          <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-52 animate-in zoom-in-95">
              <div className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1 tracking-widest text-center">Opsi Objek</div>
              {menu.type === 'node' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    {Object.keys(iconLib).filter(k => k !== 'kabel').map(ico => (
                      <button key={ico} onClick={() => { updateNodeData(menu.id, { shapeType: ico }); setMenu(null); }} className="p-2 border rounded hover:bg-blue-50 transition-colors flex items-center justify-center text-slate-700">{React.cloneElement(iconLib[ico], { size: 16 })}</button>
                    ))}
                  </div>
                  <button onClick={() => { updateNodeData(menu.id, { status: 'down' }); setMenu(null); }} className="w-full py-2 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg flex items-center justify-center gap-2 mt-2 uppercase tracking-widest">Matikan Perangkat</button>
                  <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest"><Trash2 size={14}/> Hapus</button>
                </div>
              ) : (
                <div className="space-y-2">
                 <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}, animated: false, style: {stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '5,5'}} : e)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest"><Link2Off size={14}/> Putus Koneksi</button>
                 <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== menu.id)); setMenu(null); }} className="w-full py-2 border text-[10px] font-black rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest text-slate-400 hover:bg-slate-50"><Trash2 size={14}/> Hapus Kabel</button>
                </div>
              )}
          </div>
        )}

        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">ANALISIS</span>
          </button>
          <div className="w-[340px] bg-white h-full p-8 shadow-2xl overflow-y-auto">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Info className="text-blue-600"/> Detail Lab</h2>
            <div className="space-y-4 text-xs font-bold text-slate-600 uppercase tracking-tighter">
               <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex justify-between items-center">Status: <span className={isLive ? 'text-green-600' : 'text-red-600'}>{isLive ? 'AKTIF' : 'IDLE'}</span></div>
               <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900 flex justify-between items-center">Nodes: <span>{nodes.length} Unit</span></div>
               <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900 flex justify-between items-center">Edges: <span>{edges.length} Jalur</span></div>
               <div className="mt-8 border-t pt-4">
                  <h4 className="text-blue-600 mb-2">Panduan Cepat:</h4>
                  <ul className="space-y-2 text-[10px] text-slate-400 leading-relaxed">
                    <li>• KLIK KANAN NODE: Ganti Icon/Hapus</li>
                    <li>• KLIK KANAN KABEL: Putus Jalur</li>
                    <li>• TAB SIMULASI: Jalankan Data</li>
                  </ul>
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
