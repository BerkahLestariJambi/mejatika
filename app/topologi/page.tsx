'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  Connection,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  LayoutGrid, Share2, Network as MeshIcon, 
  ShieldCheck, XCircle, X, ChevronRight,
  Cpu, Router as RouterIcon, Server, Globe, Wifi,
  Eraser, Type, Info, Layers, Cable, Hash, Camera
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE SUB-MATERI LENGKAP ---
const subMateriData: Record<string, { label: string, desc: string, icon: any }[]> = {
  "Perangkat Jaringan": [
    { label: "Router", desc: "Menghubungkan jaringan yang berbeda subnet.", icon: <RouterIcon size={20}/> },
    { label: "Switch", desc: "Menghubungkan banyak node dalam satu LAN.", icon: <Server size={20}/> },
    { label: "Access Point", desc: "Menyediakan koneksi nirkabel (Wi-Fi).", icon: <Wifi size={20}/> },
    { label: "NIC", desc: "Kartu antarmuka fisik untuk koneksi kabel.", icon: <Cpu size={20}/> }
  ],
  "Topologi Jaringan": [
    { label: "Topologi Bus", desc: "Satu kabel pusat sebagai jalur data utama.", icon: <Share2 size={20}/> },
    { label: "Topologi Star", desc: "Terpusat pada satu Switch atau Hub.", icon: <LayoutGrid size={20}/> },
    { label: "Topologi Mesh", desc: "Setiap perangkat terhubung satu sama lain.", icon: <MeshIcon size={20}/> }
  ],
  "Model OSI (7 Layer)": [
    { label: "Physical Layer", desc: "Transmisi bit melalui kabel/fisik.", icon: <Layers size={20}/> },
    { label: "Network Layer", desc: "Pengalamatan IP dan Routing.", icon: <Layers size={20}/> },
    { label: "Application Layer", desc: "Antarmuka user dengan layanan jaringan.", icon: <Layers size={20}/> }
  ],
  "Media Transmisi": [
    { label: "Kabel UTP", desc: "Kabel tembaga standar untuk LAN.", icon: <Cable size={20}/> },
    { label: "Fiber Optic", desc: "Kabel cahaya untuk kecepatan sangat tinggi.", icon: <Cable size={20}/> }
  ],
  "Pengalamatan IP": [
    { label: "IPv4", desc: "Alamat 32-bit (format desimal).", icon: <Hash size={20}/> },
    { label: "Subnetting", desc: "Membagi jaringan menjadi bagian kecil.", icon: <LayoutGrid size={20}/> }
  ]
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- KLIK KANAN HANDLER (FIXED) ---
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      // Pastikan koordinat diambil dengan benar
      setMenu({
        id: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  // --- DRAG & DROP FUNGSI ---
  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'device', position, data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` } }));
  }, [nodes, setNodes]);

  // --- PETA KONSEP FUNGSI ---
  const handleSubMateriClick = (pointName: string) => {
    setIsMapActive(true);
    const childrenData = subMateriData[pointName] || [{ label: pointName, desc: "Detail materi kurikulum.", icon: <Info size={20}/> }];
    const rootNode = {
      id: 'root', type: 'default', position: { x: 50, y: 200 },
      data: { label: <div className="p-4 bg-blue-700 text-white rounded-xl shadow-xl font-black uppercase text-xs italic">{pointName}</div> },
      style: { background: 'transparent', border: 'none', width: 220 }
    };
    const childNodes = childrenData.map((item, i) => ({
      id: `child-${i}`, type: 'default', position: { x: 450, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-100 rounded-xl shadow-lg w-[320px] text-left">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{item.icon}</div>
          <div><h4 className="font-black text-[10px] uppercase italic">{item.label}</h4><p className="text-[9px] text-slate-500 font-bold italic leading-tight">"{item.desc}"</p></div>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));
    setNodes([rootNode, ...childNodes]);
    setEdges(childNodes.map(c => ({ id: `e-${c.id}`, source: 'root', target: c.id, animated: true, style: { stroke: '#2563eb', strokeWidth: 3 } })));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={onPaneClick}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3 font-black italic">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm uppercase tracking-tighter">MEJATIKA NETWORK v2</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 font-bold">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={() => { const txt = prompt("Catatan:"); if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:200,y:200}, data:{label:<div className="p-2 bg-yellow-100 border-2 border-yellow-400 text-[10px] font-bold">{txt}</div>}, style:{background:'transparent', border:'none'}})) }} className="p-2 bg-yellow-400 text-yellow-900 rounded-xl shadow-sm hover:scale-105 transition-all"><Type size={18}/></button>
            <button onClick={() => {if(confirm("Hapus kanvas?")){setNodes([]); setEdges([]); setIsMapActive(false);}}} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><Eraser size={18}/></button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-slate-800 text-white rounded-xl hover:bg-black transition-all shadow-md"><Camera size={16}/> CETAK HASIL</button>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onDrop={onDrop} 
            onDragOver={onDragOver} 
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true}, eds))}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes} 
            fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />
            
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[350px] p-6">
                  <div className="flex justify-between items-start mb-5 font-black uppercase italic tracking-tighter">
                    <h2 className="text-slate-900 text-lg">{activeLesson.title}</h2>
                    <button onClick={() => setActiveLesson(null)} className="text-slate-400"><X size={20}/></button>
                  </div>
                  <div className="space-y-3 font-black uppercase">
                    {activeLesson.points.map((p: string, i: number) => (
                      <button key={i} onClick={() => handleSubMateriClick(p)} className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group">
                        <span className="w-6 h-6 rounded bg-white text-blue-600 flex items-center justify-center text-[10px]">{i+1}</span>
                        <p className="text-[11px]">{p}</p><ChevronRight size={16} className="ml-auto opacity-40 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all border-2 border-white/20">
                  <X size={16}/> RESET & KEMBALI
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU (FIXED POSITION) */}
            {menu && (
              <div 
                style={{ top: menu.y, left: menu.x }} 
                className="fixed z-[999] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 min-w-[150px] pointer-events-auto"
              >
                <button 
                  onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} 
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XCircle size={14}/> Hapus Perangkat
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
