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
  Layers, Cable, Hash, Activity 
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE MATERI STRUKTUR BERTINGKAT (LENGKAP) ---
const materiLengkap: Record<string, any> = {
  "Definisi Jaringan": {
    root: "Konsep Jaringan",
    branches: [
      { id: 'def1', label: "1. DEFINISI", desc: "Kumpulan komputer yang saling terhubung untuk berbagi data." },
      { id: 'def2', label: "2. MANFAAT", desc: "Berbagi sumber daya (printer, file) dan komunikasi cepat." }
    ]
  },
  "Perangkat Jaringan": {
    root: "Hardware Jaringan",
    branches: [
      { id: 'nic', label: "1. NIC (LAN CARD)", desc: "Antarmuka fisik antara komputer dan kabel jaringan." },
      { id: 'router', label: "2. ROUTER", desc: "Menghubungkan jaringan yang berbeda subnet/ID." },
      { id: 'switch', label: "3. SWITCH", desc: "Menghubungkan banyak perangkat dalam satu LAN lokal." },
      { id: 'modem', label: "4. MODEM", desc: "Mengubah sinyal analog ke digital dari penyedia layanan." }
    ]
  },
  "Topologi Jaringan": {
    root: "Topologi Fisik",
    branches: [
      { id: 'bus', label: "1. TOPOLOGI BUS", desc: "Menggunakan satu kabel pusat (backbone) tunggal." },
      { id: 'star', label: "2. TOPOLOGI STAR", desc: "Setiap node terhubung ke pusat (Switch/Hub)." },
      { id: 'mesh', label: "3. TOPOLOGI MESH", desc: "Setiap node terhubung langsung ke semua node lainnya." }
    ]
  },
  "Model OSI (7 Layer)": {
    root: "7 Layer OSI",
    branches: [
      { id: 'l1', label: "1. PHYSICAL", desc: "Transmisi bit melalui media fisik (kabel/gelombang)." },
      { id: 'l2', label: "2. DATA LINK", desc: "Pengalamatan fisik (MAC Address) dan deteksi error." },
      { id: 'l3', label: "3. NETWORK", desc: "Penentuan jalur (routing) dan pengalamatan logis (IP)." }
    ]
  }
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- FUNGSI GENERATE PETA KONSEP OTOMATIS ---
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
        <div className="p-5 bg-blue-800 text-white rounded-2xl shadow-2xl border-4 border-blue-400">
          <h2 className="font-black text-sm uppercase italic tracking-widest">{data.root}</h2>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const branchNodes = data.branches.map((item: any, i: number) => ({
      id: item.id,
      type: 'default',
      position: { x: 450, y: i * 140 },
      data: { label: (
        <div className="p-4 bg-white border-2 border-blue-200 rounded-xl shadow-lg w-[320px] text-left hover:border-blue-500 transition-all">
          <h3 className="font-black text-blue-700 text-[11px] mb-1 italic">{item.label}</h3>
          <p className="text-[10px] text-slate-500 font-bold leading-tight">"{item.desc}"</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    const branchEdges = data.branches.map((item: any) => ({
      id: `e-${rootId}-${item.id}`,
      source: rootId,
      target: item.id,
      animated: true,
      style: { stroke: '#1e40af', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1e40af' }
    }));

    setNodes([rootNode, ...branchNodes]);
    setEdges(branchEdges);
  };

  // --- FUNGSI DRAG & DROP ---
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
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-30">
        <div className="flex items-center gap-3 font-black italic">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm uppercase tracking-tighter text-blue-900">MEJATIKA NETWORK v2</h1>
        </div>
        <div className="flex gap-2">
          {/* STICKY NOTE */}
          <button onClick={() => { 
            const txt = prompt("Isi Catatan:"); 
            if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:250,y:250}, data:{label:<div className="p-3 bg-yellow-100 border-2 border-yellow-400 text-[10px] font-bold shadow-md">{txt}</div>}, style:{background:'transparent', border:'none'}})) 
          }} className="p-2 bg-yellow-400 text-yellow-900 rounded-xl hover:scale-110 transition-all shadow-sm"><Type size={18}/></button>
          
          {/* RESET / ERASER */}
          <button onClick={() => { if(confirm("Hapus semua di kanvas?")) { setNodes([]); setEdges([]); setIsMapActive(false); } }} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"><Eraser size={18}/></button>
          
          {/* CETAK HASIL */}
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-slate-800 text-white rounded-xl hover:bg-black shadow-md transition-all active:scale-95"><Camera size={16}/> CETAK HASIL</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar onSelectLesson={(lesson: any) => generateConceptMap(lesson.title)} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver} 
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* RESET MAP BUTTON */}
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all border-2 border-white/20">
                  <X size={16}/> TUTUP MATERI
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU (KLIK KANAN HAPUS) */}
            {menu && (
              <div 
                style={{ top: menu.y, left: menu.x }} 
                className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 min-w-[150px] pointer-events-auto"
              >
                <button 
                  onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} 
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg"
                >
                  <XCircle size={14}/> Hapus Item
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
