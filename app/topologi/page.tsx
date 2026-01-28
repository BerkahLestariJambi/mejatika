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
  Monitor, Network, Share2, PlusSquare
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
  const [activeView, setActiveView] = useState<'simulasi' | 'bus' | 'mesh'>('simulasi');

  // --- LOGIKA GENERATE TOPOLOGI OTOMATIS ---
  const handleViewChange = (view: 'simulasi' | 'bus' | 'mesh') => {
    setActiveView(view);
    setNodes([]); // Hapus semua konten lama
    setEdges([]);

    if (view === 'simulasi') return; // Biarkan kosong untuk rakit manual

    const newNodes = []; const newEdges = []; const count = 5;
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `node-${view}-${i}-${timestamp}`,
        type: 'device',
        position: { 
          x: view === 'bus' ? i * 220 + 100 : 400 + 200 * Math.cos(2*Math.PI*i/count), 
          y: view === 'bus' ? 300 : 300 + 200 * Math.sin(2*Math.PI*i/count) 
        },
        data: { label: `${view.toUpperCase()}-${i+1}`, type: 'pc', ip: `192.168.1.${i+10}` }
      });
    }

    if (view === 'bus') {
      for (let i = 0; i < count-1; i++) {
        newEdges.push({ id: `e-${i}-${timestamp}`, source: newNodes[i].id, target: newNodes[i+1].id, animated: true });
      }
    } else if (view === 'mesh') {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          newEdges.push({ id: `e-${i}-${j}-${timestamp}`, source: newNodes[i].id, target: newNodes[j].id });
        }
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
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
        data: { iconId: 'globe', label: <textarea placeholder="Tulis..." className="bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none w-full" rows={2}/> },
        style: { background: '#ffffff', border: '3px solid #2563eb', width: 120, height: 120, borderRadius: shape === 'circle' ? '50%' : '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
      }));
    } else if (deviceType) {
      setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'device', position, data: { label: deviceType.toUpperCase(), type: deviceType, ip: '192.168.1.x' } }));
    }
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR UTAMA */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic text-blue-900 tracking-tighter">Mejatika Lab Jaringan V2</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-xl hover:bg-blue-700 transition-all"><Camera size={18}/> CETAK LAPORAN</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 bg-white border-r flex flex-col z-30 shadow-2xl">
          <div className="flex bg-slate-100 p-2 gap-1 border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'shapes' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-5 overflow-y-auto flex-grow">
            {activeTab === 'inventory' ? (
              <div className="grid grid-cols-2 gap-3">
                {['router', 'switch', 'pc', 'smartphone'].map((dev) => (
                  <div key={dev} draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', dev)} className="flex flex-col items-center p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all group">
                    <div className="bg-slate-50 p-4 rounded-xl mb-2 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-sm border border-slate-100">
                      {dev === 'router' ? <Router size={24}/> : dev === 'switch' ? <Cpu size={24}/> : dev === 'pc' ? <Monitor size={24}/> : <Wifi size={24}/>}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500">{dev}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[{ id: 'square', icon: <Square/>, label: 'Kotak Konsep' }, { id: 'circle', icon: <Circle/>, label: 'Lingkaran Pusat' }].map((s) => (
                  <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/shape', s.id)} className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all">
                    <div className="text-slate-400 group-hover:text-blue-600">{s.icon}</div>
                    <span className="text-[10px] font-black uppercase text-slate-700">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* KANVAS AREA */}
        <div className="flex-grow relative flex flex-col bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          {/* TOPOLOGY NAVBAR (Hanya muncul saat klik Inventory) */}
          {activeTab === 'inventory' && (
            <div className="bg-white border-b px-6 py-2 flex items-center gap-2 z-40 shadow-sm animate-in slide-in-from-top duration-300">
              <button 
                onClick={() => handleViewChange('simulasi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'simulasi' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <PlusSquare size={14}/> Area Simulasi
              </button>
              <button 
                onClick={() => handleViewChange('bus')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'bus' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Network size={14}/> Tab Bus
              </button>
              <button 
                onClick={() => handleViewChange('mesh')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'mesh' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Share2 size={14}/> Tab Mesh
              </button>
            </div>
          )}

          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onDrop={onDrop} onDragOver={onDragOver} connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:4, stroke:'#2563eb'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#2563eb'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)} nodeTypes={nodeTypes} fitView
          >
            <Background gap={25} size={1} color="#e2e8f0" />
            <Controls />
            
            {/* INSTRUCTION PANEL */}
            <Panel position="bottom-center" className="mb-4">
              <div className="bg-blue-900/90 text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-4 backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase italic">Mode: {activeView.toUpperCase()}</span>
                <div className="w-[1px] h-3 bg-white/20"/>
                <span className="text-[9px] font-black uppercase italic">Klik Kanan Node untuk Opsi</span>
              </div>
            </Panel>

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-4 min-w-[200px]">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-3 tracking-widest">Kustomisasi</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {iconList.map((item) => (
                    <button key={item.id} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, iconId:item.id}} : n)) || setMenu(null)} className="p-2 border rounded-lg hover:bg-blue-50 text-slate-600">{item.icon}</button>
                  ))}
                </div>
                <div className="flex gap-2 mb-4">
                  {['#2563eb', '#dc2626', '#16a34a', '#d97706'].map(c => (
                    <button key={c} onClick={() => setNodes(nds => nds.map(n => n.id === menu.id ? {...n, style:{...n.style, background:c+'10', borderColor:c}} : n)) || setMenu(null)} className="w-7 h-7 rounded-full shadow border-2 border-white" style={{background:c}} />
                  ))}
                </div>
                <button onClick={() => setNodes(nds => nds.filter(n => n.id !== menu.id)) || setMenu(null)} className="w-full py-2 text-[10px] text-red-600 font-black uppercase bg-red-50 rounded-lg flex items-center justify-center gap-2"><Eraser size={14}/> Hapus</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
