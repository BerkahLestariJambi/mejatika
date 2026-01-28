'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  Panel,
  MarkerType,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import DeviceNode from '@/components/DeviceNode';
import { 
  ShieldCheck, XCircle, Eraser, Camera, 
  Square, Circle, Tablet as Capsule, 
  Palette, MousePointer2, Link,
  Router, Server, Globe, Wifi, Database, User, Cpu, Lock,
  Network, Share2
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

const iconList = [
  { id: 'router', icon: <Router size={24}/> },
  { id: 'server', icon: <Server size={24}/> },
  { id: 'globe', icon: <Globe size={24}/> },
  { id: 'wifi', icon: <Wifi size={24}/> },
  { id: 'db', icon: <Database size={24}/> },
  { id: 'user', icon: <User size={24}/> },
  { id: 'cpu', icon: <Cpu size={24}/> },
  { id: 'lock', icon: <Lock size={24}/> },
];

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  // --- GENERATE TOPOLOGI ---
  const generateTopology = (type: 'bus' | 'mesh') => {
    const newNodes = []; const newEdges = []; const count = 4;
    const timestamp = Date.now();
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `auto-${type}-${i}-${timestamp}`, 
        type: 'device',
        position: { 
          x: type === 'bus' ? i * 200 + 100 : 350 + 150 * Math.cos(2*Math.PI*i/count), 
          y: type === 'bus' ? 250 : 250 + 150 * Math.sin(2*Math.PI*i/count) 
        },
        data: { label: `PC-${i+1}`, type: 'pc', ip: `192.168.1.${i+10}` }
      });
    }
    if (type === 'bus') {
      for (let i = 0; i < count-1; i++) newEdges.push({ id: `eb-${i}-${timestamp}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `em-${i}-${j}-${timestamp}`, source: newNodes[i].id, target: newNodes[j].id });
      }
    }
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const shape = event.dataTransfer.getData('application/shape');
    const deviceType = event.dataTransfer.getData('application/reactflow');
    if (!reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 60, y: event.clientY - rect.top - 60 };

    if (shape) {
      setNodes((nds) => nds.concat({
        id: `shape_${Date.now()}`, type: 'default', position,
        data: { iconId: 'globe', label: <textarea placeholder="Tulis..." className="bg-transparent border-none text-[10px] font-bold uppercase text-center focus:ring-0 resize-none w-full" rows={2}/> },
        style: { background: '#ffffff', border: '3px solid #2563eb', width: 120, height: 120, borderRadius: shape === 'circle' ? '50%' : shape === 'capsule' ? '40px' : '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
      }));
    } else if (deviceType) {
      setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'device', position, data: { label: deviceType.toUpperCase(), type: deviceType, ip: '192.168.1.x' } }));
    }
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Lab Pro</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {if(confirm("Hapus?")) {setNodes([]); setEdges([]);}}} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Eraser size={20}/></button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-xl hover:bg-blue-700 transition-all"><Camera size={18}/> CETAK PDF</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex bg-slate-100 p-2 gap-1 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-5 overflow-y-auto flex-grow">
            {activeTab === 'inventory' ? (
              <div className="flex flex-col gap-6">
                {/* TOMBOL TOPOLOGI KHUSUS DI TAB INVENTORY */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => generateTopology('bus')} className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Network size={14}/> Bus
                  </button>
                  <button onClick={() => generateTopology('mesh')} className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Share2 size={14}/> Mesh
                  </button>
                </div>
                
                <div className="h-[1px] bg-slate-100 w-full" />

                <div className="grid grid-cols-2 gap-3">
                  {['router', 'switch', 'pc', 'smartphone'].map((dev) => (
                    <div key={dev} draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', dev)} className="flex flex-col items-center p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all">
                      <div className="bg-slate-100 p-4 rounded-xl mb-2">{dev === 'router' ? <Router size={24}/> : dev === 'switch' ? <Cpu size={24}/> : dev === 'pc' ? <Database size={24}/> : <Wifi size={24}/>}</div>
                      <span className="text-[9px] font-black uppercase text-slate-500">{dev}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[{ id: 'square', icon: <Square/>, label: 'Kotak' }, { id: 'circle', icon: <Circle/>, label: 'Bulat' }, { id: 'capsule', icon: <Capsule/>, label: 'Kapsul' }].map((s) => (
                  <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', s.id)} className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all">
                    <div className="text-slate-400 group-hover:text-blue-600">{s.icon}</div>
                    <span className="text-[10px] font-black uppercase text-slate-700">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onDrop={onDrop} onDragOver={onDragOver} connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:4, stroke:'#2563eb'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)} nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#e2e8f0" />
            <Controls />
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[240px]">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-3">Ganti Icon / Warna</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {iconList.map((item) => (
                    <button key={item.id} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, iconId:item.id}} : n)) || setMenu(null)} className="p-2 border rounded-lg hover:bg-blue-50">{item.icon}</button>
                  ))}
                </div>
                <div className="flex gap-2 mb-4">
                  {['#2563eb', '#dc2626', '#16a34a', '#d97706'].map(c => (
                    <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, style:{...n.style, background:c+'10', borderColor:c}} : n)) || setMenu(null)} className="w-7 h-7 rounded-full shadow border-2 border-white" style={{background:c}} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id)) || setMenu(null)} className="w-full py-2 text-[10px] text-red-600 font-black uppercase bg-red-50 rounded-lg">Hapus</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
