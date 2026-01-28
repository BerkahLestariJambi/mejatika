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
  ShieldCheck, Eraser, Camera, 
  Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, PlusSquare, Copy
} from 'lucide-react';

// --- SVG CLOUD GENERATOR ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE ENGINE ---
const UniversalNode = ({ data, selected }: any) => {
  const isDevice = data.type === 'device';
  const isCloud = data.shapeType === 'cloud';
  const isCircle = data.shapeType === 'circle';
  const isChat = data.shapeType === 'chat';

  const getNodeStyle = (): React.CSSProperties => {
    if (isDevice) return { background: 'transparent', border: 'none' };
    if (isCloud) return { backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), backgroundSize: '100% 100%', padding: '40px' };
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: isCircle ? '50%' : isChat ? '15px 15px 15px 0' : '12px',
      padding: '15px',
    };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center transition-all ${selected ? 'scale-110 drop-shadow-2xl' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5 border-none" />

      <div style={getNodeStyle()} className={`w-full h-full flex flex-col items-center justify-center text-center ${!isDevice && 'shadow-md'}`}>
        <div className={`${isDevice ? 'text-blue-700' : 'text-slate-700'} mb-1 scale-125`}>
          {data.icon}
        </div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className={`bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full leading-tight p-0 mt-1 overflow-hidden ${isDevice ? 'text-blue-900 bg-white/60 rounded px-1' : 'text-slate-800'}`}
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
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');
  const [activeView, setActiveView] = useState<'simulasi' | 'bus' | 'mesh'>('simulasi');

  useEffect(() => {
    setNodes([]); setEdges([]);
    setActiveView('simulasi');
  }, [activeTab]);

  const onNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  };

  const updateNodeIcon = (id: string, icon: any) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, icon } } : n));
    setMenu(null);
  };

  // --- DUPLICATE LOGIC ---
  const duplicateNode = (nodeId: string) => {
    const nodeToCopy = nodes.find(n => n.id === nodeId);
    if (!nodeToCopy) return;

    const newNode = {
      ...nodeToCopy,
      id: `node_dup_${Date.now()}`,
      position: { x: nodeToCopy.position.x + 40, y: nodeToCopy.position.y + 40 },
      selected: false,
      data: {
        ...nodeToCopy.data,
        onChange: (v: string) => onNodeLabelChange(`node_dup_${Date.now()}`, v)
      }
    };
    // Re-bind the onChange with the new ID properly
    newNode.data.onChange = (v: string) => onNodeLabelChange(newNode.id, v);

    setNodes((nds) => nds.concat(newNode));
    setMenu(null);
  };

  // --- TOPOLOGI GENERATOR ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    if (view === 'simulasi') { setNodes([]); setEdges([]); return; }
    
    const count = 5;
    const newNodes = []; const newEdges = [];
    for (let i = 0; i < count; i++) {
      const id = `auto-${i}-${Date.now()}`;
      newNodes.push({
        id, type: 'universal',
        position: { x: view === 'bus' ? i * 220 + 50 : 350 + 180 * Math.cos(2*Math.PI*i/count), y: 250 + (view === 'mesh' ? 180 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', icon: <Monitor size={48} strokeWidth={1.5}/>, label: `PC-${i+1}`, onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 85, height: 85 }
      });
    }
    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 4, stroke: '#2563eb' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 2, stroke: '#3b82f6' } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const val = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const position = { x: event.clientX - rect.left - 40, y: event.clientY - rect.top - 40 };
    const id = `node_${Date.now()}`;

    const iconMap: any = {
      router: <Router size={48} strokeWidth={1.5}/>, switch: <Network size={48} strokeWidth={1.5}/>, 
      pc: <Monitor size={48} strokeWidth={1.5}/>, wifi: <Wifi size={48} strokeWidth={1.5}/>, 
      server: <Server size={48} strokeWidth={1.5}/>, cloud: <Cloud size={40}/>,
      circle: <Circle size={40}/>, square: <Square size={40}/>, chat: <MessageSquare size={40}/>
    };

    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { 
        type, shapeType: val, icon: iconMap[val], label: val.toUpperCase(), 
        bgColor: '#ffffff', borderColor: type === 'device' ? '#2563eb' : '#64748b',
        onChange: (v: string) => onNodeLabelChange(id, v) 
      },
      style: { width: type === 'device' ? 85 : 125, height: type === 'device' ? 85 : 125 }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col z-50 shadow-2xl print:hidden">
        <div className="p-6 bg-blue-900 text-white font-black italic uppercase tracking-tighter flex items-center gap-2">
          <ShieldCheck size={28}/> MEJATIKA LAB V15
        </div>
        
        <div className="flex bg-slate-50 border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-[11px] font-black uppercase transition-all ${activeTab === 'shapes' ? 'bg-white text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            ['router', 'switch', 'pc', 'wifi', 'server'].map(d => (
              <div key={d} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', d); }} className="flex flex-col items-center justify-center p-4 border border-transparent hover:border-blue-200 hover:bg-blue-50 rounded-2xl cursor-grab transition-all group">
                <div className="text-blue-600 group-hover:scale-110 transition-transform">
                    {d === 'router' ? <Router size={40}/> : d === 'switch' ? <Network size={40}/> : d === 'pc' ? <Monitor size={40}/> : d === 'wifi' ? <Wifi size={40}/> : <Server size={40}/>}
                </div>
                <span className="text-[10px] font-bold uppercase mt-2 text-slate-600">{d}</span>
              </div>
            ))
          ) : (
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center hover:bg-emerald-50 hover:border-emerald-500 cursor-grab transition-all group">
                <PlusSquare size={32} className="text-emerald-500 group-hover:rotate-90 transition-transform"/>
                <span className="text-[10px] font-bold uppercase mt-2 text-slate-500">{s}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto p-4 border-t bg-slate-50">
          <button onClick={() => window.print()} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl active:scale-95"><Camera size={18}/> Export PDF</button>
        </div>
      </aside>

      {/* CANVAS */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {activeTab === 'inventory' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-40 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/50 print:hidden">
            {['simulasi', 'bus', 'mesh'].map(v => (
              <button key={v} onClick={() => handleTopologyChange(v as any)} className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${activeView === v ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>{v}</button>
            ))}
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({...p, animated: activeTab === 'inventory', style:{strokeWidth: 4, stroke: activeTab === 'inventory' ? '#2563eb' : '#94a3b8'}}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
          fitView
        >
          <Background gap={30} size={1} color="#cbd5e1" />
          <Controls className="print:hidden" />
          
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 min-w-[220px] animate-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest border-b pb-2">Konfigurasi Objek</p>
              
              <div className="flex gap-2 mb-4">
                {['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#ffffff'].map(c => (
                  <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>

              <div className="flex flex-col gap-2 mb-4 pt-2 border-t">
                <button onClick={() => duplicateNode(menu.id)} className="w-full py-2.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"><Copy size={14}/> Duplicate Objek</button>
              </div>

              {activeTab === 'inventory' && (
                <div className="grid grid-cols-4 gap-2 mb-4 pt-2 border-t">
                  <button onClick={() => updateNodeIcon(menu.id, <Router size={32}/>)} className="p-2 border rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"><Router size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Network size={32}/>)} className="p-2 border rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"><Network size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Monitor size={32}/>)} className="p-2 border rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"><Monitor size={16}/></button>
                  <button onClick={() => updateNodeIcon(menu.id, <Server size={32}/>)} className="p-2 border rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"><Server size={16}/></button>
                </div>
              )}

              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"><Eraser size={14}/> Hapus Objek</button>
            </div>
          )}
        </ReactFlow>
      </div>
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .react-flow__viewport, .react-flow__viewport * { visibility: visible !important; }
          .react-flow__viewport { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100vw !important; 
            height: 100vh !important; 
            background: white !important; 
          }
          .react-flow__controls, .print\:hidden { display: none !important; }
        }
        .react-flow__handle { opacity: 0; transition: opacity 0.2s; }
        .react-flow__node:hover .react-flow__handle { opacity: 1; }
      `}</style>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
