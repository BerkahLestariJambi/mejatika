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
  Server, Globe, Eraser, Type, Camera, Info, 
  Wifi, Cable, Hash, Lock, Activity, Globe2
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE SEMUA MATERI (LENGKAP) ---
const materiLengkap: Record<string, any> = {
  "Definisi & Komponen Jaringan": {
    root: "Dasar Jaringan",
    branches: [
      { id: 'def1', label: "PENGERTIAN", desc: "Sistem koneksi antar komputer untuk berbagi data & resource." },
      { id: 'def2', label: "KOMPONEN UTAMA", desc: "Terdiri dari Hardware (Fisik), Software (OS), & Brainware (User)." }
    ]
  },
  "Instalasi & Konfigurasi Perangkat": {
    root: "Hardware & Setup",
    branches: [
      { id: 'h1', label: "NIC & KABEL", desc: "Pemasangan kartu jaringan dan pengabelan (UTP/Fiber)." },
      { id: 'h2', label: "ROUTING & SWITCHING", desc: "Konfigurasi rute data menggunakan Router dan Switch." },
      { id: 'h3', label: "IP ADDRESSING", desc: "Penyusunan alamat IP (Statik/DHCP) agar node bisa kenal." }
    ]
  },
  "Keamanan & Internet": {
    root: "Security & Web",
    branches: [
      { id: 's1', label: "FIREWALL", desc: "Penyaring traffic berbahaya yang masuk/keluar jaringan." },
      { id: 's2', label: "ENKRIPSI DATA", desc: "Mengamankan data dengan metode SSL/TLS atau VPN." },
      { id: 's3', label: "INTERNET GATEWAY", desc: "Pintu gerbang utama menuju jaringan global (Internet)." }
    ]
  }
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');

  // --- DRAG & DROP INVENTORY (MODE MANUAL) ---
  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    if (mode !== 'free') return;
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    setNodes((nds) => nds.concat({ id: `node_${Date.now()}`, type: 'device', position, data: { label: label || type.toUpperCase(), type, ip: '192.168.1.x' } }));
  }, [mode, setNodes]);

  // --- GENERATE TOPOLOGI BUS & MESH ---
  const generateTopology = (type: 'bus' | 'mesh') => {
    setIsMapActive(false);
    const newNodes = []; const newEdges = []; const count = 5;
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `t-${i}`, type: 'device',
        position: { x: type === 'bus' ? i * 220 + 50 : 400 + 200 * Math.cos(2*Math.PI*i/count), 
                    y: type === 'bus' ? 250 : 250 + 200 * Math.sin(2*Math.PI*i/count) },
        data: { label: `PC-${i+1}`, type: 'pc', ip: `192.168.1.${i+10}` }
      });
    }
    if (type === 'bus') {
      for (let i = 0; i < count-1; i++) newEdges.push({ id: `eb-${i}`, source: `t-${i}`, target: `t-${i+1}`, animated: true });
    } else {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) newEdges.push({ id: `em-${i}-${j}`, source: `t-${i}`, target: `t-${j}` });
      }
    }
    setNodes(newNodes); setEdges(newEdges); setMode(type);
  };

  // --- PETA KONSEP MATERI ---
  const handleMateriClick = (title: string) => {
    setIsMapActive(true); setMode('free');
    const data = materiLengkap[title] || materiLengkap["Definisi & Komponen Jaringan"];
    const rootId = 'root';
    const rootNode = {
      id: rootId, type: 'default', position: { x: 50, y: 250 },
      data: { label: <div className="p-4 bg-blue-900 text-white rounded-xl font-black italic border-2 border-blue-400 uppercase shadow-2xl">{data.root}</div> },
      style: { background: 'transparent', border: 'none', width: 220 }
    };
    const branchNodes = data.branches.map((item: any, i: number) => ({
      id: item.id, type: 'default', position: { x: 450, y: i * 150 },
      data: { label: (
        <div className="p-4 bg-white border-2 border-blue-100 rounded-xl shadow-lg w-[340px] text-left hover:border-blue-600 transition-all">
          <h4 className="font-black text-[11px] text-blue-800 uppercase italic flex items-center gap-2"><Info size={14}/> {item.label}</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-tight mt-1">"{item.desc}"</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));
    setNodes([rootNode, ...branchNodes]);
    setEdges(data.branches.map((item: any) => ({ id: `e-${item.id}`, source: rootId, target: item.id, animated: true, style: { stroke: '#2563eb', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' } })));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-md z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic tracking-tighter text-blue-900">MEJATIKA NETWORK V2</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
            <button onClick={() => {setMode('free'); setNodes([]); setEdges([]); setIsMapActive(false);}} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>Manual</button>
            <button onClick={() => generateTopology('bus')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>Bus</button>
            <button onClick={() => generateTopology('mesh')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}>Mesh</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const t = prompt("Isi Catatan:"); if(t) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:300,y:300}, data:{label:<div className="p-3 bg-yellow-300 border-l-4 border-yellow-600 font-black text-[10px] shadow-md uppercase">{t}</div>}, style:{background:'transparent', border:'none'}})) }} className="p-2.5 bg-yellow-400 rounded-xl text-yellow-900 shadow-md hover:scale-105 active:scale-95 transition-all"><Type size={20}/></button>
            <button onClick={() => {if(confirm("Hapus semua?")){setNodes([]); setEdges([]); setIsMapActive(false); setMode('free');}}} className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"><Eraser size={20}/></button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black shadow-xl uppercase italic tracking-widest hover:bg-blue-700 transition-all"><Camera size={18}/> CETAK LAPORAN</button>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar onSelectLesson={(lesson: any) => handleMateriClick(lesson.title)} />
        <div className="flex-grow relative bg-slate-50" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={40} size={1} color="#cbd5e1" />
            <Controls />
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-red-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl border-2 border-white/20"><X size={18}/> TUTUP PETA KONSEP</button>
              </Panel>
            )}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border-2 border-slate-100 shadow-2xl rounded-xl p-2 min-w-[170px]">
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] text-red-600 font-black uppercase hover:bg-red-50 rounded-lg transition-all"><XCircle size={16}/> Hapus Item</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
