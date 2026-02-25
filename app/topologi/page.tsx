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

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  const activeClass = data.isLive && !isDown ? 'animate-pulse text-blue-600' : isDown ? 'text-red-600' : 'text-slate-700';
  
  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${data.isLive ? 'bg-blue-500 animate-ping' : 'bg-slate-900'}`} />
        <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* MODIFIKASI: DYNAMIC HANDLES 
          Handle disebar menutupi area node agar koneksi bisa ditarik dari titik manapun (Bebas)
      */}
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0, width: '100%', height: '50%', top: 0 }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ opacity: 0, width: '100%', height: '50%', bottom: 0 }} />
      
      <div className={`flex flex-col items-center justify-center min-w-[120px] p-4 bg-white border-[3px] rounded-xl shadow-xl transition-all ${isDown ? 'border-red-500 bg-red-50 scale-95 opacity-80' : data.isLive ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-800 hover:border-blue-500'}`}>
        <div className={activeClass}>
          {iconLib[data.shapeType] || <Monitor size={32}/>}
        </div>
        <input 
          defaultValue={data.label} 
          onChange={(e) => data.onChange(id, e.target.value)}
          className="bg-transparent border-none text-[11px] font-black uppercase text-center focus:ring-0 w-full mt-1 p-0 cursor-text relative z-10"
        />
        {isDown && <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><Link2Off size={12}/></div>}
      </div>
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

// --- MAIN CONTENT ---
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
      style: { ...e.style, stroke: nextState && e.data?.status !== 'broken' ? '#2563eb' : (e.data?.status === 'broken' ? '#ef4444' : '#0f172a') }
    })));
  };

  const generateTopology = (type: 'bus' | 'mesh' | 'star' | 'ring' | 'hybrid') => {
    setNodes([]); setEdges([]); setTopologyType(type); setIsLive(false);
    const newNodes: any[] = []; const newEdges: any[] = [];
    const centerX = 600, centerY = 350;

    if (type === 'bus') {
      for (let i = 0; i < 5; i++) {
        const xPos = i * 250 + 200;
        newNodes.push({ id: `j-${i}`, type: 'universal', position: { x: xPos, y: 350 }, data: { type: 'junction', isLive: false } });
        if (i > 0) newEdges.push({ id: `back-${i}`, source: `j-${i-1}`, target: `j-${i}`, style: { strokeWidth: 8, stroke: '#0f172a' } });
        const isTop = i % 2 === 0;
        newNodes.push({ id: `n-${i}`, type: 'universal', position: { x: xPos - 55, y: isTop ? 150 : 450 }, data: { shapeType: i === 0 ? 'router' : 'pc', label: i === 0 ? 'GATEWAY' : `NODE-${i}`, onChange: updateNodeData, isLive: false } });
        newEdges.push({ id: `drop-${i}`, source: `j-${i}`, target: `n-${i}`, style: { strokeWidth: 4, stroke: '#0f172a' } });
      }
    } 
    else if (type === 'ring') {
      const distance = 200;
      const ringPositions = [
        { x: centerX, y: centerY - distance, label: 'PC-1' },
        { x: centerX + distance, y: centerY, label: 'PC-2' },
        { x: centerX, y: centerY + distance, label: 'PC-3' },
        { x: centerX - distance, y: centerY, label: 'PC-4' }
      ];

      ringPositions.forEach((pos, i) => {
        newNodes.push({
          id: `ring-${i}`,
          type: 'universal',
          position: { x: pos.x - 60, y: pos.y - 40 },
          data: { shapeType: 'pc', label: pos.label, onChange: updateNodeData, isLive: false }
        });
      });

      const connections = [
        { source: 'ring-0', target: 'ring-1' },
        { source: 'ring-1', target: 'ring-2' },
        { source: 'ring-2', target: 'ring-3' },
        { source: 'ring-3', target: 'ring-4' }
           { source: 'ring-4', target: 'ring-0' }
      ];

      connections.forEach((conn, i) => {
        newEdges.push({
          id: `e-ring-${i}`,
          source: conn.source,
          target: conn.target,
          type: 'smoothstep', // Menggunakan smoothstep agar belokan kabel fleksibel
          style: { strokeWidth: 4, stroke: '#0f172a' },
          animated: false
        });
      });
    }
    else if (type === 'star') {
      const hubId = 'central-hub';
      newNodes.push({ id: hubId, type: 'universal', position: { x: centerX - 60, y: centerY - 40 }, data: { shapeType: 'switch', label: 'SWITCH PUSAT', onChange: updateNodeData, isLive: false } });
      for (let i = 0; i < 6; i++) {
        const nodeId = `star-pc-${i}`;
        const angle = (i * 2 * Math.PI) / 6;
        newNodes.push({ id: nodeId, type: 'universal', position: { x: centerX + 300 * Math.cos(angle) - 60, y: centerY + 300 * Math.sin(angle) - 40 }, data: { shapeType: 'pc', label: `CLIENT-${i+1}`, onChange: updateNodeData, isLive: false } });
        newEdges.push({ id: `e-star-${i}`, source: hubId, target: nodeId, type: 'smoothstep', style: { strokeWidth: 4, stroke: '#0f172a' } });
      }
    }
    else if (type === 'mesh') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        newNodes.push({ id: `m-${i}`, type: 'universal', position: { x: centerX + 250 * Math.cos(2*Math.PI*i/count), y: centerY + 250 * Math.sin(2*Math.PI*i/count) }, data: { shapeType: 'pc', label: `NODE-${i}`, onChange: updateNodeData, isLive: false } });
      }
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          newEdges.push({ id: `e-mesh-${i}-${j}`, source: `m-${i}`, target: `m-${j}`, style: { strokeWidth: 2, stroke: '#6366f1', opacity: 0.6 } });
        }
      }
    }
    else if (type === 'hybrid') {
      const hubs = [{ id: 'h1', x: 300, label: 'HUB LAN A' }, { id: 'h2', x: 900, label: 'HUB LAN B' }];
      hubs.forEach((hub) => {
        newNodes.push({ id: hub.id, type: 'universal', position: { x: hub.x, y: 350 }, data: { shapeType: 'switch', label: hub.label, onChange: updateNodeData, isLive: false } });
        for (let j = 0; j < 3; j++) {
          const pcId = `pc-${hub.id}-${j}`;
          const yOffset = j === 0 ? -200 : j === 1 ? 200 : 0;
          const xOffset = j === 2 ? (hub.id === 'h1' ? -200 : 200) : 0;
          newNodes.push({ id: pcId, type: 'universal', position: { x: hub.x + xOffset, y: 350 + yOffset }, data: { shapeType: 'pc', label: `USER-${hub.id}.${j+1}`, onChange: updateNodeData, isLive: false } });
          newEdges.push({ id: `e-${pcId}`, source: hub.id, target: pcId, style: { strokeWidth: 3, stroke: '#0f172a' } });
        }
      });
      newEdges.push({ id: 'backbone-link', source: 'h1', target: 'h2', style: { strokeWidth: 12, stroke: '#475569', strokeDasharray: '15,5' }, label: 'BACKBONE' });
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={28}/>
          <div className="text-sm tracking-tighter uppercase leading-none">Mejatika Lab<br/><span className="text-[10px] text-slate-400 not-italic">Network Simulator</span></div>
        </div>

        <div className="flex bg-slate-100 text-[10px] font-black border-b uppercase">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('simulasi')} className={`flex-1 py-4 transition-all ${activeTab === 'simulasi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).map(key => (
                <div key={key} draggable={key !== 'kabel'} onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-3 border-2 border-slate-100 rounded-xl flex flex-col items-center bg-white hover:border-blue-500 shadow-sm cursor-grab active:scale-95 transition-all">
                  <div className="text-slate-700">{iconLib[key]}</div>
                  <span className="text-[9px] font-black mt-1 uppercase text-slate-500">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={toggleSimulation} className={`w-full py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-3 transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                {isLive ? <><Square size={16}/> STOP SIMULASI</> : <><Play size={16}/> START SIMULASI</>}
              </button>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100 text-center">
                <p className="text-[10px] font-bold text-blue-600 uppercase">{isLive ? "Data mengalir..." : "System Idle"}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t text-[9px] text-slate-400 text-center font-black italic uppercase">SANPIO AI LAB © 2026</div>
      </aside>

      <main className="flex-grow relative" ref={reactFlowWrapper} onClick={() => setMenu(null)}>
        <div className="absolute top-4 left-4 z-[50] flex flex-wrap gap-2 max-w-2xl">
          {[
            { id: 'bus', label: 'Bus', icon: <Spline size={14}/>, color: 'text-blue-600' },
            { id: 'ring', label: 'Ring', icon: <Circle size={14}/>, color: 'text-emerald-600' },
            { id: 'star', label: 'Star', icon: <Star size={14}/>, color: 'text-amber-600' },
            { id: 'mesh', label: 'Mesh', icon: <GitMerge size={14}/>, color: 'text-indigo-600' },
            { id: 'hybrid', label: 'Hybrid', icon: <Zap size={14}/>, color: 'text-purple-600' },
          ].map((top) => (
            <button key={top.id} onClick={() => generateTopology(top.id as any)} className={`px-4 py-2 bg-white shadow-xl rounded-xl text-[10px] font-black border border-slate-100 hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter ${top.color}`}>
              {top.icon} {top.label}
            </button>
          ))}
          <button onClick={() => {setNodes([]); setEdges([]); setTopologyType('praktek')}} className="px-4 py-2 bg-slate-900 text-white shadow-xl rounded-xl text-[10px] font-black uppercase tracking-tighter">Clear Canvas</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onDrop={(e) => {
            const type = e.dataTransfer.getData('application/value');
            if (!type || type === 'kabel') return;
            const rect = reactFlowWrapper.current?.getBoundingClientRect();
            if (!rect) return;
            setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'universal', position: { x: e.clientX - rect.left - 60, y: e.clientY - rect.top - 40 }, data: { shapeType: type, label: type.toUpperCase(), onChange: updateNodeData, isLive } }));
          }}
          onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes}
          // MODIFIKASI: Menambahkan type: 'smoothstep' agar jalur kabel lebih luwes
          onConnect={(p) => setEdges(eds => addEdge({...p, type: 'smoothstep', style:{strokeWidth:4, stroke:'#0f172a'}, animated: isLive}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }}
          connectionMode={ConnectionMode.Loose} 
          fitView
        >
          <Background color="#cbd5e1" gap={25} variant={"dots" as any} /><Controls />
        </ReactFlow>

        <div className="absolute bottom-6 right-[400px] bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xl z-40 backdrop-blur-sm">
           <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase">
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
                  <button onClick={() => { updateNodeData(menu.id, { status: 'down' }); setMenu(null); }} className="w-full py-2 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-orange-100">Matikan Perangkat</button>
                  <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-red-100 flex items-center justify-center gap-2"><Trash2 size={14}/> Hapus</button>
                </div>
              ) : (
                <div className="space-y-2">
                 <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}, animated: false, style: {stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '5,5'}} : e)); setMenu(null); }} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase hover:bg-red-100 flex items-center justify-center gap-2"><Link2Off size={14}/> Putus Kabel</button>
                 <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== menu.id)); setMenu(null); }} className="w-full py-2 border text-[10px] font-black rounded-lg uppercase text-slate-400 hover:bg-slate-50 flex items-center justify-center gap-2"><Trash2 size={14}/> Hapus Kabel</button>
                </div>
              )}
          </div>
        )}

        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">ANALISIS</span>
          </button>
          <div className="w-[340px] bg-white h-full p-8 shadow-2xl overflow-y-auto">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4"><Info className="text-blue-600"/> Detail Lab</h2>
            <div className="space-y-4 text-xs font-bold text-slate-600 uppercase">
               <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex justify-between items-center">Status: <span className={isLive ? 'text-green-600 animate-pulse' : 'text-red-600'}>{isLive ? 'AKTIF' : 'IDLE'}</span></div>
               <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900 flex justify-between items-center">Topologi: <span className="text-blue-600">{topologyType || 'Praktek'}</span></div>
               <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-900 flex justify-between items-center">Nodes: <span>{nodes.length} Unit</span></div>
               
               <div className="mt-8 border-t pt-4">
                  <h4 className="text-blue-600 mb-2 tracking-widest text-[10px]">INFO KURIKULUM:</h4>
                  <div className="text-[10px] text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                    {topologyType === 'ring' && "Ring: Sesuai hal 95, setiap komputer terhubung ke dua tetangga membentuk lingkaran melalui jalur terdekat secara dinamis."}
                    {topologyType === 'star' && "Star: Sesuai hal 95, Switch/Hub menjadi pusat transmisi data ke semua client."}
                    {topologyType === 'hybrid' && "Hybrid: Sesuai hal 96, gabungan Topologi Star dan Bus untuk fleksibilitas tinggi."}
                    {!topologyType && "Silakan pilih topologi di atas."}
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
