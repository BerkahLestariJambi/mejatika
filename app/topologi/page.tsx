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
  LayoutGrid, Share2, Network as MeshIcon, Camera, 
  ShieldCheck, XCircle, Edit3, X, ChevronRight,
  Cpu, Router as RouterIcon, Server, Globe, Wifi,
  Eraser, Type, Info, HardDrive, radio
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE MATERI LENGKAP UNTUK PETA KONSEP ---
const materiData: Record<string, { desc: string; icon: React.ReactNode }> = {
  // Perangkat (Hardware)
  "Hardware Jaringan": { desc: "Komponen fisik yang membangun infrastruktur jaringan.", icon: <Cpu size={20}/> },
  "NIC (LAN Card)": { desc: "Antarmuka fisik agar komputer bisa masuk ke jaringan.", icon: <Cpu size={20}/> },
  "Router": { desc: "Otak jaringan yang menghubungkan segmen/IP berbeda.", icon: <RouterIcon size={20}/> },
  "Switch": { desc: "Penghubung cerdas antar PC dalam satu area (LAN).", icon: <Server size={20}/> },
  "Modem": { desc: "Penerjemah sinyal ISP menjadi data internet (Digital).", icon: <Globe size={20}/> },
  "Access Point": { desc: "Pemancar sinyal WiFi agar koneksi bisa nirkabel.", icon: <Wifi size={20}/> },
  
  // Topologi
  "Topologi Bus": { desc: "Struktur hemat kabel dengan satu jalur utama tunggal.", icon: <Share2 size={20}/> },
  "Topologi Star": { desc: "Semua data melewati switch pusat, paling umum digunakan.", icon: <LayoutGrid size={20}/> },
  "Topologi Mesh": { desc: "Koneksi Point-to-Point antar semua perangkat (Redundan).", icon: <MeshIcon size={20}/> },
  "Topologi Ring": { desc: "Data mengalir dalam satu arah lingkaran tertutup.", icon: <Share2 size={20}/> },
  
  // Konsep/Lainnya
  "IP Address": { desc: "Sistem pengalamatan unik untuk identitas perangkat.", icon: <Info size={20}/> },
  "Subnetting": { desc: "Teknik membagi jaringan besar menjadi beberapa sub-jaringan.", icon: <LayoutGrid size={20}/> },
  "Gateway": { desc: "Pintu keluar masuk data dari LAN menuju Internet.", icon: <Globe size={20}/> },
  "Kabel UTP": { desc: "Media transmisi menggunakan tembaga (RJ45).", icon: <Share2 size={20}/> },
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- 1. FITUR TULIS DI KANVAS (STICKY NOTE) ---
  const addStickyNote = () => {
    const text = prompt("Tulis catatan praktikum Anda:");
    if (!text) return;
    const id = `note_${Math.random().toString(36).substr(2, 9)}`;
    setNodes((nds) => nds.concat({
      id,
      type: 'default',
      position: { x: 350, y: 150 },
      data: { label: (
        <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow-md text-left min-w-[140px]">
          <div className="flex items-center gap-1 mb-1 border-b border-yellow-200 pb-1">
             <Type size={10} className="text-yellow-700"/>
             <span className="text-[8px] font-black text-yellow-800 uppercase tracking-tighter">Catatan Siswa</span>
          </div>
          <p className="text-[11px] font-bold text-slate-700 leading-tight">{text}</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));
  };

  // --- 2. LOGIKA PETA KONSEP OTOMATIS (SEMUA MATERI) ---
  const generateConceptMap = (mainTitle: string, pointList: string[]) => {
    setIsMapActive(true);
    const rootId = `root-${Math.random()}`;
    
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 100, y: 200 },
      data: { label: (
        <div className="p-5 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-white text-left animate-in zoom-in-50">
          <h3 className="font-black italic uppercase text-base leading-none tracking-tight">{mainTitle}</h3>
          <p className="text-[10px] mt-1 opacity-80 uppercase font-bold tracking-widest">Peta Konsep</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 240 }
    };

    const childNodes = pointList.map((point, i) => {
      const detail = materiData[point] || { desc: "Penjelasan materi inti kurikulum informatika.", icon: <Info size={20}/> };
      return {
        id: `child-${i}-${rootId}`,
        type: 'default',
        position: { x: 480, y: i * 115 },
        data: { label: (
          <div className="flex items-center gap-4 p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-xl w-[320px] text-left hover:border-blue-500 hover:shadow-blue-100 transition-all">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shadow-inner">{detail.icon}</div>
            <div>
              <h4 className="font-black text-[11px] text-slate-800 uppercase italic leading-none">{point}</h4>
              <p className="text-[9px] text-slate-500 font-bold mt-1.5 leading-tight italic">"{detail.desc}"</p>
            </div>
          </div>
        )},
        style: { background: 'transparent', border: 'none' }
      };
    });

    const childEdges = childNodes.map((child) => ({
      id: `e-${rootId}-${child.id}`,
      source: rootId,
      target: child.id,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
    }));

    setNodes((nds) => [...nds, rootNode, ...childNodes]);
    setEdges((eds) => [...eds, ...childEdges]);
  };

  // --- 3. LOGIKA DASAR (DRAG, DROP, SIMULASI) ---
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = { id: newId, type: 'device', position, data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` }};

    setNodes((nds) => {
      const newNodes = nds.concat(newNode);
      if (mode === 'bus' && nds.length > 0) {
        const lastNode = nds[nds.length - 1];
        setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
      } else if (mode === 'mesh' && nds.length > 0) {
        const meshEdges = nds.map((node) => ({ id: `e-${newId}-${node.id}`, source: newId, target: node.id, animated: true }));
        setEdges((eds) => eds.concat(meshEdges as any));
      }
      return newNodes;
    });
  }, [nodes, mode, setNodes, setEdges]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* NAVBAR UTAMA */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="text-left">
            <h1 className="text-sm font-black text-slate-800 uppercase italic leading-none">MEJATIKA NETWORK v2</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Virtual SMK Lab</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          <div className="flex gap-2">
            <button onClick={addStickyNote} className="p-2.5 bg-yellow-400 text-yellow-900 rounded-xl shadow-sm hover:scale-110 transition-all" title="Catatan Kanvas"><Type size={20} /></button>
            <button onClick={() => {if(confirm("Hapus semua di kanvas?")){setNodes([]); setEdges([]); setIsMapActive(false);}}} className="p-2.5 bg-red-100 text-red-600 rounded-xl shadow-sm hover:bg-red-200 transition-all" title="Clear Canvas"><Eraser size={20} /></button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-slate-800 text-white rounded-xl hover:bg-black transition-all"><Camera size={16} /> CETAK</button>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onConnect={onConnect} onDrop={onDrop} 
            onDragOver={(e) => e.preventDefault()}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, label: n.data.label }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={35} size={1} color="#cbd5e1" />
            <Controls />

            {/* PANEL MATERI - LIST POIN */}
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                         <h2 className="text-slate-900 text-lg font-black uppercase italic leading-tight">{activeLesson.title}</h2>
                         <p className="text-[9px] text-blue-600 font-bold uppercase mt-1">Klik poin materi untuk Peta Konsep</p>
                      </div>
                      <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="space-y-3">
                      {activeLesson.points.map((p: string, i: number) => (
                        <button key={i} onClick={() => generateConceptMap(p, activeLesson.points)}
                          className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group shadow-sm">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black bg-white text-blue-600 group-hover:bg-blue-700 group-hover:text-white transition-all">{i+1}</span>
                          <p className="text-[12px] font-black uppercase tracking-tight">{p}</p>
                          <ChevronRight size={18} className="ml-auto opacity-50 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* TOMBOL KEMBALI */}
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-2xl flex items-center gap-2 hover:bg-blue-600 transition-all border-2 border-white/20">
                   <X size={16}/> RESET PETA KONSEP & LIHAT LIST
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-2xl py-2 min-w-[170px] overflow-hidden">
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold"><XCircle size={16}/> Hapus</button>
                <button onClick={() => { 
                    const name = prompt("Ganti nama perangkat/catatan:", menu.label);
                    if(name) setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, label:name}} : n));
                    setMenu(null);
                }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-bold"><Edit3 size={16}/> Ganti Nama</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() {
  return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>;
}
