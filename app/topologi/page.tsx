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
  getRectOfNodes,
  getTransformForBounds,
} from '@xyflow/react';
import { toPdf } from 'html-to-image'; // Pastikan install html-to-image atau ganti ke window.print
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Eraser, Camera, 
  Monitor, Network, Router, Server, Wifi, 
  Circle, Cloud, Square, MessageSquare, Type
} from 'lucide-react';

// --- SVG CLOUD PATH ---
const getCloudPath = (color: string, stroke: string) => {
  const encodedColor = encodeURIComponent(color);
  const encodedStroke = encodeURIComponent(stroke);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cpath d='M200 120c15 0 30-15 30-35s-15-35-30-35c0-25-25-45-55-45-20 0-40 10-50 25-10-15-30-25-50-25-30 0-55 20-55 45-15 0-30 15-30 35s15 35 30 35c0 25 25 45 55 45 20 0 40-10 50-25 10 15 30 25 50 25 30 0 55-20 55-45z' fill='${encodedColor}' stroke='${encodedStroke}' stroke-width='6'/%3E%3C/svg%3E")`;
};

// --- CUSTOM NODE ---
const UniversalNode = ({ data, selected }: any) => {
  const isCloud = data.value === 'cloud';
  const isCircle = data.value === 'circle';
  const isChat = data.value === 'chat';
  
  const getBaseStyle = (): React.CSSProperties => {
    if (isCloud) return { backgroundImage: getCloudPath(data.bgColor || '#f0fdf4', data.borderColor || '#22c55e'), backgroundSize: '100% 100%', padding: '40px' };
    
    return {
      background: data.bgColor || '#ffffff',
      border: `3px solid ${data.borderColor || '#cbd5e1'}`,
      borderRadius: isCircle ? '50%' : isChat ? '16px 16px 16px 0' : '12px',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  return (
    <div className={`group relative w-full h-full transition-all ${selected ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
      <Handle type="source" position={Position.Top} className="!bg-blue-600" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600" />
      <Handle type="source" position={Position.Left} className="!bg-blue-600" />
      <Handle type="source" position={Position.Right} className="!bg-blue-600" />

      <div style={getBaseStyle()} className="w-full h-full text-center overflow-hidden shadow-sm">
        <div className="mb-1 pointer-events-none">{data.icon}</div>
        <textarea
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-bold text-center focus:ring-0 resize-none w-full p-0 leading-tight"
          rows={2}
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

  // Sync tab change logic
  useEffect(() => {
    setNodes([]); setEdges([]);
    setActiveView('simulasi');
  }, [activeTab]);

  const onNodeLabelChange = (nodeId: string, newLabel: string) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
  };

  const onUpdateNodeIcon = (nodeId: string, newIcon: any, newValue: string) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, icon: newIcon, value: newValue } } : n));
    setMenu(null);
  };

  // --- LOGIKA TOPOLOGI (TAB BUS & MESH) ---
  const handleTopologyChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    if (activeTab !== 'inventory') return;
    setNodes([]); setEdges([]);
    if (view === 'simulasi') return;

    const count = 5;
    const newNodes = []; const newEdges = [];
    for (let i = 0; i < count; i++) {
      const id = `auto-${i}`;
      newNodes.push({
        id, type: 'universal',
        position: { x: view === 'bus' ? i * 200 + 50 : 300 + 150 * Math.cos(2*Math.PI*i/count), y: 250 + (view === 'mesh' ? 150 * Math.sin(2*Math.PI*i/count) : 0) },
        data: { type: 'device', value: 'pc', icon: <Monitor size={24}/>, label: `Device ${i+1}`, borderColor: '#3b82f6', onChange: (v: string) => onNodeLabelChange(id, v) },
        style: { width: 100, height: 100 }
      });
    }

    if (view === 'bus') {
      for (let i = 0; i < count - 1; i++) newEdges.push({ id: `e${i}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true, style: { strokeWidth: 3, stroke: '#3b82f6' } });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `e${i}-${j}`, source: newNodes[i].id, target: newNodes[j].id, animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' } });
      }
    }
    setNodes(newNodes); setEdges(newEdges);
  };

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/type'); 
    const value = event.dataTransfer.getData('application/value');
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (!rect) return;
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    const id = `node_${Date.now()}`;

    const iconMap: any = {
      router: <Router/>, switch: <Network/>, pc: <Monitor/>, wifi: <Wifi/>, server: <Server/>,
      cloud: <Cloud/>, circle: <Circle/>, square: <Square/>, chat: <MessageSquare/>
    };

    setNodes((nds) => nds.concat({
      id, type: 'universal', position,
      data: { 
        type, value, icon: iconMap[value], label: value.toUpperCase(), 
        bgColor: '#ffffff', borderColor: activeTab === 'inventory' ? '#2563eb' : '#64748b',
        onChange: (v: string) => onNodeLabelChange(id, v) 
      },
      style: { width: value === 'cloud' ? 180 : 110, height: value === 'cloud' ? 140 : 110 }
    }));
  }, [activeTab, setNodes]);

  const downloadPDF = () => {
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (element) {
      toPdf(element, { backgroundColor: '#f8fafc' }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mejatika-lab-export.pdf';
        link.href = dataUrl;
        link.click();
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden" onClick={() => setMenu(null)}>
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r flex flex-col z-50 shadow-xl">
        <div className="p-6 bg-blue-900 text-white flex items-center gap-3 italic font-black uppercase tracking-tighter">
          <ShieldCheck/> Mejatika V14
        </div>
        
        <div className="flex border-b">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-xs font-black uppercase ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-xs font-black uppercase ${activeTab === 'shapes' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}>Shapes</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {activeTab === 'inventory' ? (
            ['router', 'switch', 'pc', 'wifi', 'server'].map(i => (
              <div key={i} draggable onDragStart={e => { e.dataTransfer.setData('application/type', 'device'); e.dataTransfer.setData('application/value', i); }} className="p-4 border rounded-xl flex flex-col items-center hover:bg-blue-50 cursor-grab transition-all group">
                <Monitor className="text-slate-400 group-hover:text-blue-500 transition-colors" size={28}/>
                <span className="text-[10px] mt-2 font-bold uppercase">{i}</span>
              </div>
            ))
          ) : (
            ['cloud', 'circle', 'square', 'chat'].map(s => (
              <div key={s} draggable onDragStart={e => { e.dataTransfer.setData('application/type', s === 'cloud' ? 'cloud' : 'shape'); e.dataTransfer.setData('application/value', s); }} className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center hover:bg-emerald-50 cursor-grab group">
                <PlusSquare className="text-slate-300 group-hover:text-emerald-500" size={28}/>
                <span className="text-[10px] mt-2 font-bold uppercase text-slate-500">{s}</span>
              </div>
            ))}
        </div>
        <div className="mt-auto p-4">
           <button onClick={downloadPDF} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"><Camera size={16}/> Export Area Canvas</button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <div className="flex-grow flex flex-col relative" ref={reactFlowWrapper}>
        {/* TOPOLOGY TAB - ONLY FOR INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50 bg-white/80 backdrop-blur p-2 rounded-2xl shadow-lg border">
            {['simulasi', 'bus', 'mesh'].map(v => (
              <button key={v} onClick={() => handleTopologyChange(v as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === v ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{v}</button>
            ))}
          </div>
        )}

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose}
          onConnect={p => setEdges(eds => addEdge({...p, animated: activeTab === 'inventory', style:{strokeWidth: 3, stroke: activeTab === 'inventory' ? '#3b82f6' : '#94a3b8'}}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
          fitView
        >
          <Background gap={25} size={1} color="#e2e8f0" />
          <Controls />

          {/* DYNAMIC CONTEXT MENU */}
          {menu && (
            <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border shadow-2xl rounded-2xl p-4 min-w-[220px]">
              <div className="mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Warna {activeTab === 'shapes' ? '& Background' : 'Border'}</p>
                <div className="flex gap-2">
                  {['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ffffff'].map(c => (
                    <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, [activeTab === 'shapes' ? 'bgColor' : 'borderColor']: c}} : n))} className="w-7 h-7 rounded-full border shadow-sm" style={{ background: c }} />
                  ))}
                </div>
              </div>
              
              {activeTab === 'inventory' && (
                <div className="mb-4 border-t pt-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Ganti Icon</p>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => onUpdateNodeIcon(menu.id, <Router/>, 'router')} className="p-2 border rounded hover:bg-slate-50"><Router size={16}/></button>
                    <button onClick={() => onUpdateNodeIcon(menu.id, <Server/>, 'server')} className="p-2 border rounded hover:bg-slate-50"><Server size={16}/></button>
                    <button onClick={() => onUpdateNodeIcon(menu.id, <Wifi/>, 'wifi')} className="p-2 border rounded hover:bg-slate-50"><Wifi size={16}/></button>
                    <button onClick={() => onUpdateNodeIcon(menu.id, <Monitor/>, 'pc')} className="p-2 border rounded hover:bg-slate-50"><Monitor size={16}/></button>
                  </div>
                </div>
              )}

              <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id))} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg">Hapus Objek</button>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
