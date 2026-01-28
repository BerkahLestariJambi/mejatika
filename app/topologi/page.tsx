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

// Database penjelasan untuk poin-poin spesifik (opsional, jika tidak ada akan pakai teks otomatis)
const deskripsiMateri: Record<string, string> = {
  "Hardware Jaringan": "Komponen fisik pendukung jaringan.",
  "NIC (LAN Card)": "Kartu untuk menghubungkan kabel LAN.",
  "Router": "Penghubung antar jaringan/subnet berbeda.",
  "Switch": "Pusat pembagi data dalam satu LAN.",
  "Modem": "Penerjemah sinyal ISP ke digital.",
  "Topologi Bus": "Jaringan dengan satu jalur kabel utama.",
  "Topologi Star": "Jaringan terpusat pada satu Switch/Hub.",
  "IP Address": "Alamat identitas perangkat di jaringan.",
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- 1. FITUR DRAG & DROP (KEMBALI NORMAL) ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    
    if (!type || !reactFlowWrapper.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left - 50,
      y: event.clientY - rect.top - 50,
    };

    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      id: newId,
      type: 'device',
      position,
      data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` }
    };

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

  // --- 2. FITUR TULIS DI KANVAS ---
  const addStickyNote = () => {
    const text = prompt("Tulis catatan:");
    if (!text) return;
    setNodes((nds) => nds.concat({
      id: `note_${Date.now()}`,
      type: 'default',
      position: { x: 250, y: 150 },
      data: { label: <div className="p-2 bg-yellow-100 border-2 border-yellow-400 font-bold text-[11px]">{text}</div> },
      style: { background: 'transparent', border: 'none' }
    }));
  };

  // --- 3. PETA KONSEP DINAMIS (ISI BERBEDA TIAP KLIK) ---
  const handleConceptClick = (pointName: string) => {
    setIsMapActive(true);
    const rootId = 'root-node';
    
    // Ambil poin-poin materi dari activeLesson yang sedang dibuka
    const pointsToDisplay = activeLesson?.points || [pointName];

    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 100, y: 250 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-xl shadow-xl border-2 border-white font-black italic uppercase text-xs">
          {pointName}
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 200 }
    };

    const childNodes = pointsToDisplay.map((p: string, i: number) => ({
      id: `child-${i}`,
      type: 'default',
      position: { x: 450, y: i * 110 },
      data: { label: (
        <div className="flex flex-col p-3 bg-white border-2 border-blue-100 rounded-xl shadow-md w-[280px] text-left">
          <h4 className="font-black text-[10px] text-slate-800 uppercase italic">{p}</h4>
          <p className="text-[9px] text-slate-500 font-bold mt-1 italic">
            "{deskripsiMateri[p] || `Materi utama tentang ${p}`}"
          </p>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    const childEdges = childNodes.map((child) => ({
      id: `e-${rootId}-${child.id}`,
      source: rootId,
      target: child.id,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    setNodes([rootNode, ...childNodes]);
    setEdges(childEdges);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black text-slate-800 uppercase italic">MEJATIKA NETWORK</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>
          <button onClick={addStickyNote} className="p-2 bg-yellow-400 text-yellow-900 rounded-lg"><Type size={18} /></button>
          <button onClick={() => {setNodes([]); setEdges([]); setIsMapActive(false);}} className="p-2 bg-red-100 text-red-600 rounded-lg"><Eraser size={18} /></button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR DENGAN FUNGSI DRAG */}
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onConnect={(params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds))} 
            onDrop={onDrop} 
            onDragOver={onDragOver}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* PANEL MATERI - KLIK UNTUK PETA KONSEP */}
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[350px] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-slate-900 text-lg font-black uppercase italic">{activeLesson.title}</h2>
                    <button onClick={() => setActiveLesson(null)}><X size={18}/></button>
                  </div>
                  <div className="space-y-3">
                    {activeLesson.points.map((p: string, i: number) => (
                      <button key={i} onClick={() => handleConceptClick(p)}
                        className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group shadow-sm">
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
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                   <X size={14}/> Tutup Peta Konsep
                </button>
              </Panel>
            )}

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 min-w-[150px]">
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-bold"><XCircle size={14}/> Hapus</button>
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
