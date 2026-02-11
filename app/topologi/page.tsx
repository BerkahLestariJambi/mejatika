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
  Circle, Cloud, Square, MessageSquare, Zap, HardDrive, DoorOpen, 
  Flame, Radio, Trash2, Save, FolderOpen, RefreshCcw, 
  ChevronRight, Play, Square as StopSquare, AlertTriangle, Link2Off,
  Globe, Cpu, Info
} from 'lucide-react';

// --- KONFIGURASI ICON ---
const iconLib: any = {
  router: <Router size={40} />, switch: <Network size={40} />, pc: <Monitor size={40} />,
  wifi: <Wifi size={40} />, server: <Server size={40} />, hub: <Zap size={40} />,
  bridge: <HardDrive size={40} />, gateway: <DoorOpen size={40} />, firewall: <Flame size={40} />,
  ap: <Radio size={40} />, cloud: <Cloud size={40} />, circle: <Circle size={40} />,
  square: <Square size={40} />, chat: <MessageSquare size={40} />
};

const curriculumMaterials = [
  {
    id: 'materi_1',
    category: 'The Hook',
    title: 'Krisis 60 Menit Tanpa Internet',
    icon: <Globe size={20} />,
    description: 'Dunia berhenti berputar tanpa konektivitas.',
    points: ['Finansial terhenti', 'Logistik macet', 'Analogi: Data itu barang.']
  },
  {
    id: 'materi_2',
    category: 'Arsitektur',
    title: 'Anatomi Jaringan',
    icon: <Cpu size={20} />,
    description: 'Harmoni perangkat keras membagi data.',
    points: ['PAN, LAN, MAN, WAN', 'Topologi Star', 'Layer 2 vs Layer 3']
  }
];

const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- KOMPONEN NODE ---
const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const isSimulating = data.isSimulating;
  const isDown = data.status === 'down';
  const isDisconnected = data.isDisconnected;
  
  const shouldAnimate = (isDevice && ['router', 'wifi', 'ap'].includes(data.shapeType) && !isDown && !isDisconnected) || (isSimulating && !isDown && !isDisconnected);
  
  const getNodeStyle = (): React.CSSProperties => {
    if (isDevice) return { background: 'transparent', border: 'none' };
    if (isCloud) return { 
      backgroundImage: getCloudPath(isDown || isDisconnected ? '#fef2f2' : (data.bgColor || '#f0fdf4'), isDown || isDisconnected ? '#ef4444' : (data.borderColor || '#22c55e')), 
      backgroundSize: '100% 100%', padding: '45px 30px', border: 'none'
    };
    return {
      background: isDown || isDisconnected ? '#fef2f2' : (data.bgColor || '#ffffff'),
      border: `3px solid ${isDown || isDisconnected ? '#ef4444' : (data.borderColor || '#cbd5e1')}`,
      borderRadius: data.shapeType === 'circle' ? '50%' : data.shapeType === 'chat' ? '4px 4px 4px 0' : '12px',
      padding: '15px',
    };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-110 drop-shadow-2xl' : ''} ${isDown || isDisconnected ? 'opacity-70' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <div style={getNodeStyle()} className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="mb-1 relative">
          {shouldAnimate && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25 scale-150"></div>}
          <div className={`${shouldAnimate ? 'animate-pulse text-blue-600' : isDown || isDisconnected ? 'text-red-600' : 'text-slate-700'}`}>
            {iconLib[data.shapeType] || <Monitor size={40}/>}
            {(isDown || isDisconnected) && <AlertTriangle size={16} className="absolute -top-1 -right-1 text-red-600 animate-bounce" />}
          </div>
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className={`bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1 overflow-hidden ${isDown || isDisconnected ? 'text-red-600' : 'text-slate-800'}`}
          rows={1}
        />
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5" />
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: string; isEdge?: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'learning' | 'shapes' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);
  const [topologyInfo, setTopologyInfo] = useState<'bus' | 'mesh' | null>(null);

  // --- LOGIC SIMULASI TERPUTUS (BFS) ---
  const checkConnectivity = useCallback(() => {
    if (!isLive || nodes.length === 0) return;

    const startNode = nodes.find(n => n.data.shapeType === 'server' || n.data.shapeType === 'router') || nodes[0];
    const startNodeId = startNode.id;

    const visited = new Set();
    const queue = [startNodeId];
    visited.add(startNodeId);

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = nodes.find(n => n.id === currentId);
      
      if (currentNode?.data.status === 'down') continue;

      edges.forEach(edge => {
        if (edge.data?.status === 'broken') return;
        
        let neighborId = null;
        if (edge.source === currentId) neighborId = edge.target;
        else if (edge.target === currentId) neighborId = edge.source;

        if (neighborId && !visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }

    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSimulating: isLive,
        isDisconnected: !visited.has(node.id)
      }
    })));

    setEdges((eds) => eds.map(edge => {
      const isBroken = edge.data?.status === 'broken';
      return {
        ...edge,
        animated: isLive && !isBroken,
        style: {
          ...edge.style,
          stroke: isBroken ? '#ef4444' : (isLive ? '#22c55e' : '#2563eb'),
          strokeWidth: isBroken ? 2 : 3,
          strokeDasharray: isBroken ? '5,5' : '0'
        }
      };
    }));
  }, [isLive, nodes.length, edges.length]);

  useEffect(() => {
    checkConnectivity();
    if (!isLive) {
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, isDisconnected: false, isSimulating: false}})));
    }
  }, [isLive, edges.filter(e => e.data?.status === 'broken').length, nodes.filter(n => n.data.status === 'down').length]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const clearCanvas = () => { if(confirm("Hapus semua objek di canvas?")) { setNodes([]); setEdges([]); setTopologyInfo(null); } };

  const saveProject = () => {
    const data = JSON.stringify({ nodes: nodes.map(n => ({...n, data: {...n.data, icon: null, onChange: null}})), edges });
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sanpio_${Date.now()}.mjtika`;
    link.click();
  };

  const loadProject = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      try {
        const parsed = JSON.parse(f.target?.result as string);
        setNodes(parsed.nodes.map((n: any) => ({ ...n, data: { ...n.data, onChange: (v: string) => onNodeLabelChange(n.id, v) } })));
        setEdges(parsed.edges);
      } catch (err) { alert("File error!"); }
    };
    reader.readAsText(file);
  };

  const generateTopology = (type: 'bus' | 'mesh') => {
    setNodes([]); setEdges([]);
    setTopologyInfo(type);
    const count = 5;
    const newNodes = Array.from({ length: count }).map((_, i) => {
      const id = `node-${i}-${Date.now()}`;
      return {
        id, type: 'universal',
        position: { x: type === 'bus' ? i * 200 + 150 : 400 + 250 * Math.cos(2*Math.PI*i/count), y: 350 + (type === 'mesh' ? 250 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', shapeType: i === 0 && type === 'bus' ? 'router' : 'pc', label: i === 0 && type === 'bus' ? 'GATEWAY' : `PC-${i}`, status: 'up', onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      }
    });
    const newEdges = [];
    if (type === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, style: { strokeWidth: 3, stroke: '#2563eb' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, style: { strokeWidth: 3, stroke: '#2563eb' } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 3, stroke: '#2563eb' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' } }, eds));
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const id = `node_${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type: 'universal', position: { x: event.clientX - rect.left - 45, y: event.clientY - rect.top - 45 },
      data: { type, shapeType: val, label: val.toUpperCase(), status: 'up', bgColor: '#ffffff', borderColor: '#334155', onChange: (v: string) => onNodeLabelChange(id, v) },
      style: { width: type === 'device' ? 85 : 180, height: type === 'device' ? 85 : 150 }
    }));
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: any) => {
    event.preventDefault();
    setMenu({ id: edge.id, x: event.clientX, y: event.clientY, type: 'edge', isEdge: true });
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      <aside className="w-80 bg-white border-r flex flex-col z-[60] shadow-2xl relative">
        <div className="p-6 bg-slate-900 text-white font-black italic uppercase leading-none flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-500"/>
          <div>MEJATIKA LAB <div className="text-[9px] mt-1 opacity-70 font-normal tracking-widest text-blue-400">SANPIO EDITION</div></div>
        </div>

        <div className="flex bg-slate-50 border-b overflow-x-auto custom-scrollbar">
          {['inventory', 'learning', 'shapes', 'simulasi'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 min-w-[80px] py-4 text-[8px] font-black uppercase transition-all ${activeTab === t ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>{t}</button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'simulasi' ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl text-white shadow-lg transition-all ${isLive ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                <p className="text-[10px] font-black opacity-80 mb-1">NETWORK ANALYSIS</p>
                <h3 className="text-lg font-black leading-tight uppercase">{isLive ? 'Simulation Running' : 'Simulation Offline'}</h3>
                <p className="text-[10px] mt-2 font-medium opacity-90 italic">Klik kanan objek untuk merusak koneksi.</p>
              </div>

              <button 
                onClick={() => setIsLive(!isLive)}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black transition-all shadow-md ${isLive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isLive ? <><StopSquare size={18}/> STOP SIMULATION</> : <><Play size={18}/> START SIMULATION</>}
              </button>

              {isLive && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Status</p>
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Zap size={14} className="text-amber-500"/> Nodes: {nodes.length}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                      <Link2Off size={14}/> Broken: {edges.filter(e => e.data?.status === 'broken').length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'learning' ? (
            <div className="space-y-3">
              {curriculumMaterials.map((mat) => (
                <button key={mat.id} className="w-full p-4 rounded-xl border bg-white flex items-center justify-between hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-3 text-left">
                    <div className="text-blue-600">{mat.icon}</div>
                    <div><p className="font-bold text-slate-800 text-xs">{mat.title}</p></div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(activeTab === 'inventory' ? Object.keys(iconLib).slice(0, 10) : ['cloud', 'circle', 'square', 'chat']).map(item => (
                <div key={item} draggable onDragStart={e => { e.dataTransfer.setData('application/type', activeTab === 'inventory' ? 'device' : 'shape'); e.dataTransfer.setData('application/value', item); }} className="p-3 border rounded-xl flex flex-col items-center bg-white hover:bg-slate-50 cursor-grab shadow-sm transition-all hover:scale-105 active:scale-95">
                  {iconLib[item]} <span className="text-[9px] mt-1 font-bold uppercase text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveProject} className="py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><Save size={14}/> SAVE</button>
            <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2"><FolderOpen size={14}/> LOAD</button>
          </div>
          <button onClick={clearCanvas} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-200 uppercase">Hapus Canvas</button>
          <input type="file" ref={fileInputRef} onChange={loadProject} accept=".mjtika" className="hidden" />
        </div>
      </aside>

      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <h1 className="text-[22vw] font-black text-slate-900 opacity-[0.03] select-none leading-none">SANPIO</h1>
        </div>

        <div className="absolute top-4 left-4 z-[100] flex gap-2">
          <button onClick={() => generateTopology('bus')} className="px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><RefreshCcw size={12}/> GEN BUS</button>
          <button onClick={() => generateTopology('mesh')} className="px-5 py-2 text-[10px] font-black bg-white text-indigo-600 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"><RefreshCcw size={12}/> GEN MESH</button>
        </div>

        {/* --- DYNAMIC TOPOLOGY INFO PANEL --- */}
        {topologyInfo && (
          <div className="absolute bottom-24 left-6 z-[100] bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-blue-100 shadow-2xl w-[400px] animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                  <Info size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">Topology Insight</p>
                  <h4 className="text-lg font-black text-slate-800 uppercase leading-tight">
                    {topologyInfo === 'bus' ? 'Bus Topology' : 'Mesh Topology'}
                  </h4>
                </div>
              </div>
              <button onClick={() => setTopologyInfo(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <StopSquare size={16} />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mb-4 italic">
              {topologyInfo === 'bus' 
                ? 'Semua node terhubung ke media transmisi tunggal (backbone). Data dikirimkan secara broadcast di sepanjang jalur utama.'
                : 'Setiap node memiliki koneksi point-to-point ke setiap node lainnya. Memberikan redundansi tinggi dan performa stabil.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1">
                  <Zap size={10}/> Kelebihan
                </p>
                <div className="text-[10px] text-slate-700 font-medium space-y-1">
                  {topologyInfo === 'bus' ? (
                    <>
                      <p>• Hemat biaya kabel</p>
                      <p>• Mudah dipasang</p>
                    </>
                  ) : (
                    <>
                      <p>• Tidak ada kegagalan tunggal</p>
                      <p>• Keamanan data terjamin</p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 border-l pl-4">
                <p className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1">
                  <AlertTriangle size={10}/> Kekurangan
                </p>
                <div className="text-[10px] text-slate-700 font-medium space-y-1">
                  {topologyInfo === 'bus' ? (
                    <>
                      <p>• Backbone putus = Mati total</p>
                      <p>• Sering tabrakan data</p>
                    </>
                  ) : (
                    <>
                      <p>• Sangat boros kabel</p>
                      <p>• Konfigurasi rumit</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={onConnect}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: n.data.type }); }}
          onEdgeContextMenu={onEdgeContextMenu}
          fitView
        >
          <Background gap={25} size={1} color="#cbd5e1" />
          <Controls />
          
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border shadow-2xl rounded-2xl p-4 min-w-[220px]">
              <p className="text-[9px] font-black text-slate-400 mb-3 uppercase border-b pb-1">Config {menu.type}</p>
              
              {!menu.isEdge ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Object.keys(iconLib).filter(k => menu.type === 'device' ? !['cloud','circle','square','chat'].includes(k) : ['cloud','circle','square','chat'].includes(k)).map(ico => (
                      <button key={ico} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, shapeType: ico}} : n))} className="p-2 hover:bg-blue-50 rounded-lg border flex items-center justify-center">
                        {React.cloneElement(iconLib[ico], { size: 18 })}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data: {...n.data, status: n.data.status === 'down' ? 'up' : 'down'}} : n))}
                    className={`w-full py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${nodes.find(n => n.id === menu.id)?.data.status === 'down' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                  >
                    <Zap size={14}/> {nodes.find(n => n.id === menu.id)?.data.status === 'down' ? 'REPAIR' : 'FAIL DEVICE'}
                  </button>
                  <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg">DELETE</button>
                </div>
              ) : (
                <div className="space-y-2">
                   <button 
                      onClick={() => setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {...e.data, status: e.data?.status === 'broken' ? 'fine' : 'broken'}} : e))}
                      className={`w-full py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${edges.find(e => e.id === menu.id)?.data?.status === 'broken' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                    >
                      <RefreshCcw size={14}/> {edges.find(e => e.id === menu.id)?.data?.status === 'broken' ? 'RESTORE' : 'CUT CABLE'}
                    </button>
                    <button onClick={() => setEdges(eds => eds.filter(e => e.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg">DELETE</button>
                </div>
              )}
            </div>
          )}
        </ReactFlow>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .react-flow__edge.animated path { stroke-dasharray: 10; animation: dash 0.5s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
