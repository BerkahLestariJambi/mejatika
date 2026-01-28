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
  Eraser, Type, Info
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE MATERI LENGKAP (Agar isi peta konsep berbeda-beda) ---
const materiData: Record<string, { desc: string; icon: React.ReactNode }> = {
  "Hardware Jaringan": { desc: "Perangkat fisik pendukung koneksi.", icon: <Cpu size={20}/> },
  "NIC (LAN Card)": { desc: "Kartu antarmuka jaringan pada PC.", icon: <Cpu size={20}/> },
  "Router": { desc: "Menghubungkan jaringan yang berbeda subnet.", icon: <RouterIcon size={20}/> },
  "Switch": { desc: "Manajemen traffic data di dalam LAN.", icon: <Server size={20}/> },
  "Modem": { desc: "Modulasi sinyal digital ke analog/internet.", icon: <Globe size={20}/> },
  "Topologi Bus": { desc: "Menggunakan kabel tunggal pusat (backbone).", icon: <Share2 size={20}/> },
  "Topologi Star": { desc: "Semua node terhubung ke switch pusat.", icon: <LayoutGrid size={20}/> },
  "IP Address": { desc: "Alamat identitas perangkat di jaringan.", icon: <Info size={20}/> },
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- 1. FITUR TULIS DI KANVAS ---
  const addStickyNote = () => {
    const text = prompt("Tulis catatan praktikum:");
    if (!text) return;
    const id = `note_${Math.random().toString(36).substr(2, 9)}`;
    setNodes((nds) => nds.concat({
      id,
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: (
        <div className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded shadow-md text-left min-w-[140px]">
          <p className="text-[11px] font-bold text-slate-700">{text}</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));
  };

  // --- 2. LOGIKA PETA KONSEP (DENGAN ISI BERBEDA) ---
  const generateConceptMap = (mainTitle: string, pointList: string[]) => {
    setIsMapActive(true);
    const rootId = `root-${Math.random()}`;
    
    // Node Pusat
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 100, y: 200 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-white text-left animate-in zoom-in-50">
          <h3 className="font-black italic uppercase text-sm leading-none">{mainTitle}</h3>
          <p className="text-[9px] mt-1 opacity-80 uppercase font-bold tracking-tighter">Konsep Utama</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    // Node Cabang (Isi menyesuaikan materiData)
    const childNodes = pointList.map((point, i) => {
      const detail = materiData[point] || { desc: "Materi pembelajaran inti.", icon: <Info size={20}/> };
      return {
        id: `child-${i}-${rootId}`,
        type: 'default',
        position: { x: 450, y: i * 110 },
        data: { label: (
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-50 rounded-xl shadow-lg w-[300px] text-left hover:border-blue-500 transition-all">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-black italic">{detail.icon}</div>
            <div>
              <h4 className="font-black text-[10px] text-slate-800 uppercase italic leading-none">{point}</h4>
              <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight italic">"{detail.desc}"</p>
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
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    setNodes((nds) => [...nds, rootNode, ...childNodes]);
    setEdges((eds) => [...eds, ...childEdges]);
  };

  // --- 3. FITUR DASAR (DRAG, DROP, KLIK KANAN) ---
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
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="text-left">
            <h1 className="text-sm font-black text-slate-800 uppercase italic">MEJATIKA NETWORK LAB</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>
          <div className="flex gap-2">
            <button onClick={addStickyNote} className="p-2 bg-yellow-400 text-yellow-900 rounded-lg shadow-sm" title="Catatan"><Type size={18} /></button>
            <button onClick={() => {setNodes([]); setEdges([]); setIsMapActive(false);}} className="p-2 bg-red-100 text-red-600 rounded-lg shadow-sm" title="Hapus Kanvas"><Eraser size={18} /></button>
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
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, label: n.data.label }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-slate-900 text-lg font-black uppercase italic leading-tight">{activeLesson.title}</h2>
                      <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
                    </div>
                    <div className="space-y-3">
                      {activeLesson.points.map((p: string, i: number) => (
                        <button key={i} onClick={() => generateConceptMap(p, activeLesson.points)}
                          className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group shadow-sm">
                          <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black bg-white text-blue-600 group-hover:bg-blue-700 transition-colors">{i+1}</span>
                          <p className="text-[11px] font-black uppercase tracking-tight">{p}</p>
                          <ChevronRight size={16} className="ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl flex items-center gap-2">
                   <X size={14}/> Reset Peta Konsep
                </button>
              </Panel>
            )}

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[150px]">
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"><XCircle size={14}/> Hapus</button>
                <button onClick={() => { 
                    const name = prompt("Ganti nama:", menu.label);
                    if(name) setNodes(nds => nds.map(n => n.id === menu.id ? {...n, data:{...n.data, label:name}} : n));
                    setMenu(null);
                }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 font-bold"><Edit3 size={14}/> Ganti Nama</button>
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
