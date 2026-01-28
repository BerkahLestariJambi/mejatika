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
  Cpu, Router as RouterIcon, Server, Globe, Wifi
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

const hardwarePoints = [
  { id: 'h1', label: 'NIC (LAN Card)', desc: 'Menghubungkan komputer ke kabel jaringan.', icon: <Cpu size={24}/> },
  { id: 'h2', label: 'Router', desc: 'Penghubung antar jaringan (Gateway).', icon: <RouterIcon size={24}/> },
  { id: 'h3', label: 'Switch', desc: 'Distribusi data dalam jaringan LAN.', icon: <Server size={24}/> },
  { id: 'h4', label: 'Modem/ONU', desc: 'Penerjemah sinyal internet luar.', icon: <Globe size={24}/> },
  { id: 'h5', label: 'Access Point', desc: 'Pemancar sinyal Wi-Fi nirkabel.', icon: <Wifi size={24}/> },
];

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- 1. LOGIKA KLIK KANAN ---
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ id: node.id, x: event.clientX, y: event.clientY, type: 'node', label: node.data.label });
  }, [setMenu]);

  const deleteElement = () => {
    setNodes((nds) => nds.filter((n) => n.id !== menu.id));
    setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    setMenu(null);
  };

  const renameElement = () => {
    const newName = prompt("Ganti nama perangkat:", menu?.label);
    if (newName) setNodes((nds) => nds.map((n) => n.id === menu.id ? { ...n, data: { ...n.data, label: newName } } : n));
    setMenu(null);
  };

  // --- 2. LOGIKA DRAG & DROP + BUS & MESH MODE ---
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    
    const newNode = { 
        id: newId, 
        type: 'device', 
        position, 
        data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` }
    };

    setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        
        // LOGIKA BUS MODE (Menghubungkan ke node terakhir)
        if (mode === 'bus' && nds.length > 0) {
            const lastNode = nds[nds.length - 1];
            setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
        } 
        // LOGIKA MESH MODE (Menghubungkan ke SEMUA node yang ada)
        else if (mode === 'mesh' && nds.length > 0) {
            const meshEdges = nds.map((node) => ({ id: `e-${newId}-${node.id}`, source: newId, target: node.id, animated: true }));
            setEdges((eds) => eds.concat(meshEdges as any));
        }
        
        return newNodes;
    });
  }, [nodes, mode, setNodes, setEdges]);

  // --- 3. LOGIKA PETA KONSEP (MIND MAP) ---
  const generateConceptMap = () => {
    setIsMapActive(true);
    const rootId = 'root-hardware';
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 150, y: 200 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-white text-left">
          <h3 className="font-black italic uppercase text-sm leading-none">HARDWARE JARINGAN</h3>
          <p className="text-[9px] mt-1 opacity-80 uppercase font-bold">Mind Map Mode</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 200 }
    };

    const childNodes = hardwarePoints.map((p, i) => ({
      id: p.id,
      type: 'default',
      position: { x: 450, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 rounded-xl shadow-lg w-[260px] text-left">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{p.icon}</div>
          <div>
            <h4 className="font-black text-[10px] text-slate-800 uppercase italic leading-none">{p.label}</h4>
            <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight italic">"{p.desc}"</p>
          </div>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    const childEdges = hardwarePoints.map((p) => ({
      id: `e-${rootId}-${p.id}`,
      source: rootId,
      target: p.id,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    setNodes((nds) => [...nds, rootNode, ...childNodes]);
    setEdges((eds) => [...eds, ...childEdges]);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="text-left">
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none italic">MEJATIKA NETWORK v2</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">SMK Lab Simulation</span>
          </div>
        </div>
        
        {/* MODE SELECTOR (BUS & MESH) */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => {setMode('free');}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><LayoutGrid size={14} className="inline mr-2"/>Manual</button>
          <button onClick={() => {setMode('bus');}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Share2 size={14} className="inline mr-2"/>Bus</button>
          <button onClick={() => {setMode('mesh');}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><MeshIcon size={14} className="inline mr-2"/>Mesh</button>
        </div>
        
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg"><Camera size={14} /> Cetak Lab</button>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onConnect={onConnect} onDrop={onDrop} 
            onDragOver={(e) => e.preventDefault()}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* PANEL MATERI (Akan sembunyi jika Peta Konsep muncul) */}
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-10 duration-500 text-left">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-slate-900 text-lg font-black uppercase italic leading-tight">{activeLesson.title}</h2>
                      <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
                    </div>
                    <div className="space-y-3">
                      {activeLesson.points.map((p: string, i: number) => {
                        const isHardware = p.toLowerCase().includes('hardware');
                        return (
                          <button key={i} onClick={() => isHardware && generateConceptMap()}
                            className={`w-full flex gap-3 items-center p-4 rounded-xl border transition-all text-left ${isHardware ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isHardware ? 'bg-white text-blue-600' : 'bg-slate-200'}`}>{i+1}</span>
                            <p className="text-[11px] font-black uppercase tracking-tight">{p}</p>
                            {isHardware && <ChevronRight size={16} className="ml-auto animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* TOMBOL KEMBALI DARI PETA KONSEP */}
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2">
                   <X size={14}/> Reset Peta Konsep & Lihat Poin
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[170px] overflow-hidden">
                <button onClick={renameElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 font-bold transition-colors"><Edit3 size={14}/> Ganti Nama</button>
                <button onClick={deleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"><XCircle size={14}/> Hapus</button>
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
