'use client';

import React, { useRef, useState, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Zap, Flame, Radio, Info, Users, ChevronLeft, ChevronRight,
  CheckCircle2, Trash2, Link2Off, AlertTriangle, PencilRuler
} from 'lucide-react';

const iconLib: any = {
  pc: <Monitor size={32} />,
  router: <Router size={32} />, 
  switch: <Network size={32} />, 
  wifi: <Wifi size={32} />, 
  server: <Server size={32} />, 
  hub: <Zap size={32} />,
  firewall: <Flame size={32} />,
  ap: <Radio size={32} />
};

const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md" />
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
      <div className={`flex flex-col items-center justify-center min-w-[120px] p-4 bg-white border-[3px] rounded-xl shadow-xl transition-all ${isDown ? 'border-red-500 bg-red-50' : 'border-slate-800 hover:border-blue-500'}`}>
        <div className={data.isSimulating && !isDown ? 'animate-pulse text-blue-600' : 'text-slate-700'}>
          {iconLib[data.shapeType] || <Monitor size={32}/>}
        </div>
        <input 
          defaultValue={data.label} 
          onBlur={(e) => data.onChange(id, e.target.value)}
          className="bg-transparent border-none text-[11px] font-black uppercase text-center focus:ring-0 w-full mt-1 p-0 cursor-text"
        />
        {isDown && <AlertTriangle size={14} className="absolute -top-1 -right-1 text-red-600 animate-bounce" />}
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
  const [showPanel, setShowPanel] = useState(false);
  const [topologyType, setTopologyType] = useState<'bus' | 'mesh' | 'praktek' | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');

  const updateNode = (id: string, newData: any) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
  };

  const handleTabClick = (tab: 'inventory' | 'simulasi') => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      setNodes([]); setEdges([]); setTopologyType('praktek'); setShowPanel(false); setIsLive(false);
    }
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]); setTopologyType(type); setShowPanel(true);
    const newNodes: any[] = []; const newEdges: any[] = [];

    if (type === 'bus') {
      const backboneY = 350;
      for (let i = 0; i < 5; i++) {
        const xPos = i * 250 + 200;
        const jId = `j-${i}`; const dId = `n-${i}`;
        const isTop = i % 2 === 0;

        newNodes.push({ id: jId, type: 'universal', position: { x: xPos, y: backboneY }, data: { type: 'junction' } });
        if (i > 0) {
          newEdges.push({ 
            id: `back-${i}`, source: `j-${i-1}`, target: jId, sourceHandle: 'right', targetHandle: 'left',
            style: { strokeWidth: 10, stroke: '#0f172a' }, type: 'straight' 
          });
        }
        newNodes.push({ 
          id: dId, type: 'universal', position: { x: xPos - 55, y: isTop ? backboneY - 180 : backboneY + 80 }, 
          data: { shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `PC-${i}`, onChange: (id:string, val:string) => updateNode(id, {label: val}) } 
        });
        newEdges.push({ 
          id: `drop-${i}`, source: jId, target: dId, sourceHandle: isTop ? 'top' : 'bottom', targetHandle: isTop ? 'b' : 't', 
          style: { strokeWidth: 4, stroke: '#0f172a' }, type: 'straight' 
        });
      }
    } else {
      const mNodes = Array.from({ length: 4 }).map((_, i) => ({ id: `m-${i}`, type: 'universal', position: { x: 400 + 200 * Math.cos(2*Math.PI*i/4), y: 300 + 200 * Math.sin(2*Math.PI*i/4) }, data: { shapeType: 'pc', label: `PC-${i}`, onChange: (id:string, val:string) => updateNode(id, {label: val}) } }));
      newNodes.push(...mNodes);
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) newEdges.push({ id: `e-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 3, stroke: '#2563eb' } });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = (event: any) => {
    const type = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'universal', position: { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 40 }, data: { shapeType: type, label: type.toUpperCase(), onChange: (id:string, val:string) => updateNode(id, {label: val}) } }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={28}/>
          <div className="leading-none text-sm tracking-tighter">MEJATIKA LAB</div>
        </div>
        <div className="flex bg-slate-50 text-[10px] font-black uppercase border-b">
          <button onClick={() => handleTabClick('inventory')} className={`flex-1 py-4 ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => handleTabClick('simulasi')} className={`flex-1 py-4 ${activeTab === 'simulasi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).map(key => (
                <div key={key} draggable onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-3 border-2 border-slate-100 rounded-xl flex flex-col items-center bg-white hover:border-blue-500 cursor-grab shadow-sm transition-all active:scale-95">
                  <div className="text-slate-700">{iconLib[key]}</div>
                  <span className="text-[9px] font-black mt-1 uppercase text-slate-500">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => setIsLive(!isLive)} className={`w-full py-4 rounded-xl font-black text-xs shadow-lg transition-all ${isLive ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
              {isLive ? 'STOP SIMULASI' : 'START SIMULASI'}
            </button>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 text-[9px] text-slate-400 text-center uppercase tracking-widest font-black italic">SANPIO AI LAB © 2026</div>
      </aside>

      <main className="flex-grow relative" ref={reactFlowWrapper}>
        {/* TAB CANVAS PRAKTIK (Hanya Muncul saat Mode Inventory/Praktek) */}
        {topologyType === 'praktek' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
            <div className="flex flex-col items-center">
              <PencilRuler size={200} className="text-slate-900" />
              <h1 className="text-8xl font-black tracking-[0.2em] uppercase text-slate-900">CANVAS PRAKTIK</h1>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 z-[50] flex gap-2">
          <button onClick={() => generateTopology('bus')} className="px-5 py-2 bg-white shadow-xl rounded-xl text-[10px] font-black text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">GEN BUS</button>
          <button onClick={() => generateTopology('mesh')} className="px-5 py-2 bg-white shadow-xl rounded-xl text-[10px] font-black text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">GEN MESH</button>
        </div>

        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} nodeTypes={nodeTypes} onConnect={(p) => setEdges(eds => addEdge({...p, style:{strokeWidth:4, stroke:'#0f172a'}}, eds))} onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }} onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }} fitView>
          <Background color="#cbd5e1" gap={25} variant={"dots" as any} /><Controls />
        </ReactFlow>

        {/* ANGGOTA KELOMPOK */}
        {topologyType && (
          <div className="absolute bottom-6 right-12 bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xl z-40">
            <div className="flex items-center gap-2 mb-2 text-blue-600 border-b pb-1 font-black text-[10px] uppercase tracking-widest">
              <Users size={16} /><span>Anggota Kelompok</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700 leading-tight">1. Ahmad Mejatika <br/> 2. Siti Jaringan <br/> 3. Budi Topology</div>
          </div>
        )}

        {/* CONTEXT MENU */}
        {menu && (
          <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-52 animate-in zoom-in-95" onMouseLeave={() => setMenu(null)}>
             <div className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-1 tracking-widest">Opsi Objek</div>
             {menu.type === 'node' ? (
               <div className="space-y-2">
                 <div className="grid grid-cols-4 gap-1">
                   {Object.keys(iconLib).map(ico => (
                     <button key={ico} onClick={() => { updateNode(menu.id, { shapeType: ico }); setMenu(null); }} className="p-2 border rounded hover:bg-blue-50 transition-colors">{React.cloneElement(iconLib[ico], { size: 14 })}</button>
                   ))}
                 </div>
                 <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg flex items-center justify-center gap-2 mt-2 uppercase tracking-widest"><Trash2 size={14}/> Hapus</button>
               </div>
             ) : (
                <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}, style: {stroke: '#ef4444', strokeWidth: 4}} : e)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest"><Link2Off size={14}/> Putus Kabel</button>
             )}
          </div>
        )}

        {/* SIDE INFO */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ease-in-out ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <div className="h-full flex flex-col justify-center">
            <button onClick={() => setShowPanel(!showPanel)} className="bg-slate-900 text-white p-2 rounded-l-2xl shadow-2xl flex flex-col items-center gap-3 py-10 hover:bg-blue-600 transition-colors border-l border-white/20">
              {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
              <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.3em]">{showPanel ? 'TUTUP INFO' : 'TAMPIL INFO'}</span>
            </button>
          </div>
          <div className="w-[380px] bg-white h-full border-l border-slate-200 p-8 overflow-y-auto shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"><Info size={24} /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Analisis Jaringan</h2>
             </div>
             {topologyType && topologyType !== 'praktek' ? (
               <div className="space-y-6">
                 <div className="p-4 bg-blue-50 border-l-4 border-blue-500 italic text-sm text-slate-700 font-medium">{topologyType === 'bus' ? 'Jaringan dengan satu jalur kabel utama (Backbone).' : 'Koneksi penuh antar perangkat.'}</div>
                 <div className="space-y-4">
                    <h4 className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b pb-1"><CheckCircle2 size={16}/> Kelebihan</h4>
                    <ul className="text-xs space-y-2 font-bold text-slate-700"><li>• Sangat hemat biaya kabel</li><li>• Mudah untuk diimplementasikan</li></ul>
                    <h4 className="text-red-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mt-6 border-b pb-1"><AlertTriangle size={16}/> Kekurangan</h4>
                    <ul className="text-xs space-y-2 font-bold text-slate-700"><li>• Jika kabel utama putus, semua mati</li><li>• Sering terjadi tabrakan data</li></ul>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center opacity-50">
                  <PencilRuler size={60} />
                  <p className="mt-4 font-black uppercase text-[10px] tracking-widest italic">Mode Praktik Mandiri Aktif</p>
               </div>
             )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .react-flow__handle { background: transparent !important; border: none !important; }
        .react-flow__edge.animated path { stroke-dasharray: 10; animation: dash 0.6s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        .cursor-text { cursor: text !important; }
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
