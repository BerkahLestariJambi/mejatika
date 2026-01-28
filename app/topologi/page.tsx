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
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  ShieldCheck, XCircle, X, Cpu, Router as RouterIcon, 
  Server, Globe, Wifi, Eraser, Type, Camera, Info, 
  Layers, Cable, Hash, Activity, ChevronRight 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE MATERI STRUKTUR BERTINGKAT SESUAI PERMINTAAN ---
const materiLengkap: Record<string, any> = {
  "Definisi Jaringan": {
    root: "Konsep Jaringan",
    branches: [
      { id: 'def1', label: "1. DEFINISI", desc: "Sistem yang menghubungkan dua komputer atau lebih." },
      { id: 'def2', label: "2. KOMPONEN", desc: "Terdiri dari Hardware, Software, dan Protokol." }
    ]
  },
  "Perangkat Jaringan": {
    root: "Hardware Jaringan",
    branches: [
      { id: 'nic', label: "1. NIC (LAN CARD)", desc: "Slot fisik untuk menghubungkan kabel ke komputer." },
      { id: 'router', label: "2. ROUTER", desc: "Perangkat cerdas pengatur rute data antar jaringan." },
      { id: 'switch', label: "3. SWITCH", desc: "Pusat distribusi data dalam satu jaringan lokal." },
      { id: 'modem', label: "4. MODEM", desc: "Alat untuk akses internet melalui line telepon/fiber." }
    ]
  },
  "Topologi Jaringan": {
    root: "Topologi Fisik",
    branches: [
      { id: 'bus', label: "1. TOPOLOGI BUS", desc: "Node dihubungkan ke satu kabel panjang (bus)." },
      { id: 'star', label: "2. TOPOLOGI STAR", desc: "Bentuk bintang dengan switch sebagai pusatnya." },
      { id: 'mesh', label: "3. TOPOLOGI MESH", desc: "Hubungan point-to-point antar semua node." }
    ]
  },
  "Model OSI (7 Layer)": {
    root: "Arsitektur OSI",
    branches: [
      { id: 'l1', label: "1. PHYSICAL", desc: "Kabel, hub, dan transmisi bit listrik." },
      { id: 'l2', label: "2. DATA LINK", desc: "Pengaturan frame data dan MAC Address." },
      { id: 'l3', label: "3. NETWORK", desc: "Sistem pengalamatan IP dan fungsi Routing." }
    ]
  }
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- LOGIKA PETA KONSEP (Cabang Hardware, dll) ---
  const generateConceptMap = (materiKey: string) => {
    setIsMapActive(true);
    const data = materiLengkap[materiKey];
    if (!data) return;

    const rootId = 'root-node';
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 50, y: 250 },
      data: { label: (
        <div className="p-6 bg-blue-900 text-white rounded-3xl shadow-2xl border-4 border-blue-400">
          <h2 className="font-black text-sm uppercase italic tracking-widest">{data.root}</h2>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const branchNodes = data.branches.map((item: any, i: number) => ({
      id: item.id,
      type: 'default',
      position: { x: 450, y: i * 150 },
      data: { label: (
        <div className="p-4 bg-white border-2 border-blue-200 rounded-2xl shadow-xl w-[340px] text-left hover:border-blue-600 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={16}/></div>
             <h3 className="font-black text-blue-800 text-[12px] uppercase italic">{item.label}</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed ml-1">"{item.desc}"</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    const branchEdges = data.branches.map((item: any) => ({
      id: `e-${rootId}-${item.id}`,
      source: rootId,
      target: item.id,
      animated: true,
      style: { stroke: '#2563eb', strokeWidth: 4 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
    }));

    setNodes([rootNode, ...branchNodes]);
    setEdges(branchEdges);
  };

  // --- FUNGSI DRAG & DROP PERANGKAT ---
  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    setNodes((nds) => nds.concat({ 
      id: `node_${Date.now()}`, 
      type: 'device', 
      position, 
      data: { label: label || type.toUpperCase(), type, ip: '192.168.1.x' } 
    }));
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-[#f1f5f9] overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR DENGAN FITUR CETAK & CATATAN */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-md z-40">
        <div className="flex items-center gap-4">
          <div className="bg-blue-700 p-2.5 rounded-2xl text-white shadow-xl rotate-3"><ShieldCheck size={28} /></div>
          <h1 className="text-md font-black uppercase italic tracking-tighter text-blue-900">Mejatika Lab Jaringan v2</h1>
        </div>
        <div className="flex items-center gap-3 font-black uppercase italic">
          <button onClick={() => { 
            const txt = prompt("Tulis catatan:"); 
            if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:300,y:300}, data:{label:<div className="p-4 bg-yellow-200 border-l-8 border-yellow-500 text-[11px] font-black shadow-xl">{txt}</div>}, style:{background:'transparent', border:'none'}})) 
          }} className="p-2.5 bg-yellow-400 text-yellow-900 rounded-2xl hover:scale-110 transition-all"><Type size={20}/></button>
          
          <button onClick={() => { if(confirm("Bersihkan semua?")) { setNodes([]); setEdges([]); setIsMapActive(false); } }} className="p-2.5 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-all"><Eraser size={20}/></button>
          
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg text-xs tracking-widest"><Camera size={18}/> CETAK LAPORAN</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR MATERI & INVENTORY */}
        <Sidebar onSelectLesson={(lesson: any) => generateConceptMap(lesson.title)} />
        
        <div className="flex-grow relative bg-slate-50" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver} 
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:3}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={40} size={1} color="#cbd5e1" />
            <Controls />

            {/* PANEL TUTUP MATERI */}
            {isMapActive && (
              <Panel position="top-left" className="ml-6 mt-6">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-red-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-2xl hover:bg-red-700 transition-all border-2 border-white/30">
                  <X size={18}/> TUTUP PETA KONSEP
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU (KLIK KANAN HAPUS) - KUNCI MATI */}
            {menu && (
              <div 
                style={{ top: menu.y, left: menu.x }} 
                className="fixed z-[9999] bg-white border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl p-2 min-w-[180px] pointer-events-auto"
              >
                <button 
                  onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} 
                  className="w-full flex items-center gap-3 px-5 py-3 text-[11px] text-red-600 font-black uppercase hover:bg-red-50 rounded-xl transition-colors"
                >
                  <XCircle size={16}/> Hapus Perangkat
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
