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
  Eraser, Type, Info, Layers, Cable, Hash
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATA MAPPING LENGKAP UNTUK SEMUA POIN MATERI ---
const subMateriData: Record<string, { label: string, desc: string, icon: any }[]> = {
  // Kelompok 1: Perangkat Jaringan
  "Perangkat Jaringan": [
    { label: "Router", desc: "Menghubungkan dua atau lebih jaringan berbeda.", icon: <RouterIcon size={20}/> },
    { label: "Switch", desc: "Menghubungkan banyak perangkat dalam satu LAN.", icon: <Server size={20}/> },
    { label: "Access Point", desc: "Menyediakan koneksi nirkabel (Wi-Fi).", icon: <Wifi size={20}/> },
    { label: "NIC", desc: "Kartu jaringan fisik pada komputer.", icon: <Cpu size={20}/> }
  ],
  // Kelompok 2: Topologi Jaringan
  "Topologi Jaringan": [
    { label: "Bus", desc: "Satu kabel utama untuk semua perangkat.", icon: <Share2 size={20}/> },
    { label: "Star", desc: "Semua node terhubung ke pusat (Switch).", icon: <LayoutGrid size={20}/> },
    { label: "Mesh", desc: "Setiap node terhubung ke setiap node lain.", icon: <MeshIcon size={20}/> },
    { label: "Ring", desc: "Node terhubung membentuk lingkaran.", icon: <Share2 size={20}/> }
  ],
  // Kelompok 3: OSI Layer
  "Model OSI": [
    { label: "Physical Layer", desc: "Transmisi bit data melalui media fisik.", icon: <Layers size={20}/> },
    { label: "Data Link", desc: "Menyediakan link data yang andal (MAC).", icon: <Layers size={20}/> },
    { label: "Network Layer", desc: "Routing dan pengalamatan (IP).", icon: <Layers size={20}/> },
    { label: "Transport Layer", desc: "Pengiriman pesan end-to-end (TCP/UDP).", icon: <Layers size={20}/> }
  ],
  // Kelompok 4: Pengabelan
  "Media Transmisi": [
    { label: "Kabel UTP", desc: "Kabel tembaga pilin untuk LAN (RJ45).", icon: <Cable size={20}/> },
    { label: "Fiber Optic", desc: "Transmisi menggunakan pulsa cahaya.", icon: <Cable size={20}/> },
    { label: "Coaxial", desc: "Digunakan untuk antena dan TV kabel.", icon: <Cable size={20}/> }
  ],
  // Kelompok 5: IP Address
  "Pengalamatan IP": [
    { label: "IPv4", desc: "Alamat 32-bit (format 192.168.x.x).", icon: <Hash size={20}/> },
    { label: "IPv6", desc: "Alamat 128-bit untuk masa depan.", icon: <Hash size={20}/> },
    { label: "Subnetting", desc: "Membagi jaringan menjadi sub-jaringan.", icon: <LayoutGrid size={20}/> }
  ]
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    const newNode = {
      id: `node_${Date.now()}`, type: 'device', position,
      data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const handlePointClick = (pointName: string) => {
    setIsMapActive(true);
    const rootId = 'root-node';
    const childrenData = subMateriData[pointName] || [
      { label: pointName, desc: "Klik poin ini untuk melihat detail materi.", icon: <Info size={20}/> }
    ];

    const rootNode = {
      id: rootId, type: 'default', position: { x: 50, y: 200 },
      data: { label: <div className="p-4 bg-blue-700 text-white rounded-xl shadow-xl font-black italic uppercase text-xs">{pointName}</div> },
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const childNodes = childrenData.map((item, i) => ({
      id: `child-${i}`, type: 'default', position: { x: 450, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-100 rounded-xl shadow-lg w-[320px] text-left">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-bold">{item.icon}</div>
          <div>
            <h4 className="font-black text-[10px] text-slate-800 uppercase italic">{item.label}</h4>
            <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight">"{item.desc}"</p>
          </div>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    setNodes([rootNode, ...childNodes]);
    setEdges(childNodes.map(c => ({ id: `e-${rootId}-${c.id}`, source: rootId, target: c.id, animated: true, style: { stroke: '#2563eb', strokeWidth: 2 } })));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20 font-black">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm italic uppercase">MEJATIKA NETWORK v2</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>
          <button onClick={() => {
            const txt = prompt("Catatan:");
            if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:250,y:250}, data:{label:<div className="p-2 bg-yellow-100 border-2 border-yellow-400 text-[10px] font-bold">{txt}</div>}, style:{background:'transparent', border:'none'}}))
          }} className="p-2 bg-yellow-400 text-yellow-900 rounded-lg"><Type size={18} /></button>
          <button onClick={() => {setNodes([]); setEdges([]); setIsMapActive(false);}} className="p-2 bg-red-100 text-red-600 rounded-lg"><Eraser size={18} /></button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white/95 border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[350px] p-6 text-left">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-slate-900 text-lg font-black uppercase italic">{activeLesson.title}</h2>
                    <button onClick={() => setActiveLesson(null)}><X size={18}/></button>
                  </div>
                  <div className="space-y-3">
                    {activeLesson.points.map((p: string, i: number) => (
                      <button key={i} onClick={() => handlePointClick(p)} className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group">
                        <span className="w-6 h-6 rounded bg-white text-blue-600 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                        <p className="text-[11px] font-black uppercase">{p}</p>
                        <ChevronRight size={16} className="ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>
            )}
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all">
                   <X size={14}/> Kembali ke Praktikum
                </button>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
