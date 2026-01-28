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
  Router, Server, Globe, Wifi, Database, User, Cpu, Lock
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
        id: `shape_${Date.now()}`,
        type: 'default',
        position,
        data: { 
          iconId: 'globe',
          label: <textarea placeholder="Isi Materi..." className="bg-transparent border-none text-[10px] font-bold uppercase text-center focus:ring-0 resize-none w-full" rows={2}/>
        },
        style: { 
          background: '#ffffff', border: '3px solid #2563eb', 
          width: 130, height: 130, 
          borderRadius: shape === 'circle' ? '50%' : shape === 'capsule' ? '40px' : '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px'
        }
      }));
    } else if (deviceType) {
      setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'device', position, data: { label: deviceType.toUpperCase(), type: deviceType, ip: '192.168.1.x' } }));
    }
  }, [setNodes]);

  const updateNode = (id: string, updates: any) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...updates.data }, style: { ...node.style, ...updates.style } };
      }
      return node;
    }));
    setMenu(null);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* HEADER */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-lg font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Concept & Lab</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {if(confirm("Hapus semua?")) {setNodes([]); setEdges([]);}}} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100"><Eraser size={20}/></button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase italic shadow-xl hover:bg-blue-700 transition-all"><Camera size={18}/> CETAK PDF</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR FIXED (Hanya Inventory & Shapes) */}
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex bg-slate-50 p-2 gap-2">
            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`flex-1 py-3 text-[11px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('shapes')} 
              className={`flex-1 py-3 text-[11px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Shapes
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-grow">
            {activeTab === 'inventory' ? (
              <div className="grid grid-cols-2 gap-4">
                {['router', 'switch', 'pc', 'smartphone'].map((dev) => (
                  <div 
                    key={dev} draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', dev)}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all group"
                  >
                    <div className="bg-slate-100 p-3 rounded-xl mb-2 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {dev === 'router' ? <Router/> : dev === 'switch' ? <Cpu/> : dev === 'pc' ? <Database/> : <Wifi/>}
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{dev}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'square', icon: <Square/>, label: 'Kotak Konsep' },
                  { id: 'circle', icon: <Circle/>, label: 'Lingkaran Pusat' },
                  { id: 'capsule', icon: <Capsule/>, label: 'Kapsul Alur' }
                ].map((s) => (
                  <div 
                    key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', s.id)}
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all"
                  >
                    <div className="text-blue-600">{s.icon}</div>
                    <span className="text-[11px] font-black uppercase text-slate-700">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* AREA KERJA */}
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver} connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:4, stroke:'#2563eb'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#e2e8f0" />
            <Controls />

            {/* FLOATING INSTRUCTION */}
            <Panel position="bottom-center" className="mb-6">
              <div className="bg-blue-950 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-6 border-2 border-white/10 backdrop-blur-md">
                <span className="text-[10px] font-black uppercase italic flex items-center gap-2"><MousePointer2 size={14}/> Drag dari Sidebar</span>
                <div className="w-[1px] h-4 bg-white/20"/>
                <span className="text-[10px] font-black uppercase italic flex items-center gap-2"><Link size={14}/> Tarik Garis Bebas</span>
                <div className="w-[1px] h-4 bg-white/20"/>
                <span className="text-[10px] font-black uppercase italic flex items-center gap-2"><Palette size={14}/> Klik Kanan Ganti Icon/Warna</span>
              </div>
            </Panel>

            {/* MENU KLIK KANAN */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-5 min-w-[240px] animate-in fade-in zoom-in duration-150">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Pilih Icon Dinamis</p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {iconList.map((item) => (
                    <button key={item.id} onClick={() => updateNode(menu.id, { data: { iconId: item.id } })} className="p-2.5 border rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all text-slate-600">
                      {item.icon}
                    </button>
                  ))}
                </div>
                
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Warna Tema</p>
                <div className="flex justify-between mb-5">
                  <button onClick={() => updateNode(menu.id, { style: { background: '#eff6ff', borderColor: '#2563eb' } })} className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-lg" />
                  <button onClick={() => updateNode(menu.id, { style: { background: '#fef2f2', borderColor: '#dc2626' } })} className="w-8 h-8 rounded-full bg-red-600 border-4 border-white shadow-lg" />
                  <button onClick={() => updateNode(menu.id, { style: { background: '#f0fdf4', borderColor: '#16a34a' } })} className="w-8 h-8 rounded-full bg-green-600 border-4 border-white shadow-lg" />
                  <button onClick={() => updateNode(menu.id, { style: { background: '#fffbeb', borderColor: '#d97706' } })} className="w-8 h-8 rounded-full bg-yellow-500 border-4 border-white shadow-lg" />
                </div>
                
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center justify-center gap-2 py-3 text-[11px] text-red-600 font-black uppercase bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                  <XCircle size={16}/> Hapus Node
                </button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
