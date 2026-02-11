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
          rows={2}
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
  const [showDefinition, setShowDefinition] = useState(true);

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
    setShowDefinition(true); // Pastikan panel terbuka saat generate baru
    
    const count = 5;
    const timestamp = Date.now();

    // Node Kelompok (Selalu Muncul Otomatis)
    const groupNodeId = `group-${timestamp}`;
    const groupNode = {
        id: groupNodeId,
        type: 'universal',
        position: { x: 450, y: 50 },
        data: { 
            type: 'shape', 
            shapeType: 'chat', 
            label: 'KELOMPOK:\nFarel Gaut | Andri Jelau | Eklan Ilang | Boven Jelanu',
            bgColor: '#f8fafc',
            borderColor: '#2563eb',
            onChange: (v: string) => onNodeLabelChange(groupNodeId, v)
        },
        style: { width: 400, height: 80 }
    };

    const deviceNodes = Array.from({ length: count }).map((_, i) => {
      const id = `node-${i}-${timestamp}`;
      return {
        id, type: 'universal',
        position: { x: type === 'bus' ? i * 200 + 150 : 400 + 250 * Math.cos(2*Math.PI*i/count), y: 350 + (type === 'mesh' ? 250 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', shapeType: i === 0 && type === 'bus' ? 'router' : 'pc', label: i === 0 && type === 'bus' ? 'GATEWAY' : `PC-${i}`, status: 'up', onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      }
    });

    const newEdges = [];
    if (type === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: deviceNodes[i].id, target: deviceNodes[i+1].id, style: { strokeWidth: 3, stroke: '#2563eb' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: deviceNodes[i].id, target: deviceNodes[j].id, style: { strokeWidth: 3, stroke: '#2563eb' } });
      }
    }
    
    setNodes([groupNode, ...deviceNodes]); 
    setEdges(newEdges);
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
              </
