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
  Eraser, Type, Info
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATA MAPPING: INI KUNCI AGAR ISI PETA KONSEP BEDA-BEDA ---
const subMateriData: Record<string, { label: string, desc: string, icon: any }[]> = {
  "Hardware Jaringan": [
    { label: "NIC (LAN Card)", desc: "Antarmuka fisik pada komputer.", icon: <Cpu size={20}/> },
    { label: "Router", desc: "Penghubung antar jaringan berbeda.", icon: <RouterIcon size={20}/> },
    { label: "Switch", desc: "Pembagi data di jaringan lokal (LAN).", icon: <Server size={20}/> },
    { label: "Access Point", desc: "Pemancar sinyal nirkabel (Wi-Fi).", icon: <Wifi size={20}/> }
  ],
  "Topologi Jaringan": [
    { label: "Topologi Bus", desc: "Menggunakan satu kabel backbone utama.", icon: <Share2 size={20}/> },
    { label: "Topologi Star", desc: "Terpusat pada satu hub atau switch.", icon: <LayoutGrid size={20}/> },
    { label: "Topologi Mesh", desc: "Setiap node terhubung satu sama lain.", icon: <MeshIcon size={20}/> }
  ],
  "Alamat IP (IP Address)": [
    { label: "IPv4", desc: "Alamat 32-bit yang paling umum digunakan.", icon: <Info size={20}/> },
    { label: "Subnet Mask", desc: "Penentu porsi network dan host.", icon: <LayoutGrid size={20}/> },
    { label: "Gateway", desc: "Pintu keluar menuju jaringan internet.", icon: <Globe size={20}/> }
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

  // --- 1. DRAG & DROP INVENTORY (TETAP ADA & AMAN) ---
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
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      id: newId, type: 'device', position,
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

  // --- 2. LOGIKA PETA KONSEP SUB-MATERI (DINAMIS) ---
  const handlePointClick = (pointName: string) => {
    setIsMapActive(true);
    const rootId = 'root-node';
    
    // Ambil data cabang berdasarkan apa yang diklik
    const childrenData = subMateriData[pointName] || [
      { label: pointName, desc: "Materi pembelajaran lanjutan.", icon: <Info size={20}/> }
    ];

    const rootNode = {
      id: rootId, type: 'default', position: { x: 50, y: 250 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-xl shadow-xl font-black italic uppercase text-xs">
          {pointName}
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 200 }
    };

    const childNodes = childrenData.map((item, i) => ({
      id: `child-${i}`, type: 'default', position: { x: 400, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-50 rounded-xl shadow-lg w-[300px] text-left">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{item.icon}</div>
          <div>
            <h4 className="font-black text-[10px] text-slate-800 uppercase italic">{item.label}</h4>
            <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight italic">"{item.desc}"</p>
          </div>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    const childEdges = childNodes.map((child) => ({
      id: `e-${rootId}-${child.id}`, source: rootId, target: child.id,
      animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 },
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
          <button onClick={() => {
            const txt = prompt("Catatan:");
            if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:200,y:200}, data:{label:<div className="p-2 bg-yellow-100 border-2 border-yellow-400 text-[10px] font-bold">{txt}</div>}, style:{background:'transparent', border:'none'}}))
          }} className="p-2 bg-yellow-400 text-yellow-900 rounded-lg"><Type size={18} /></button>
          <button onClick={() => {setNodes([]); setEdges([]); setIsMapActive(false);}} className="p-2 bg-red-100 text-red-600 rounded-lg"><Eraser size={18} /></button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true}, eds))} 
            onDrop={onDrop} onDragOver={onDragOver}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[350px] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-slate-900 text-lg font-black uppercase italic">{activeLesson.title}</h2>
                    <button onClick={() => setActiveLesson(null)}><X size={18}/></button>
                  </div>
                  <div className="space-y-3">
                    {activeLesson.points.map((p: string, i: number) => (
                      <button key={i} onClick={() => handlePointClick(p)}
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
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all">
                   <X size={14}/> Kembali ke Praktikum
                </button>
              </Panel>
            )}

            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl p-2">
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full text-xs text-red-600 font-bold px-4 py-2 hover:bg-red-50 rounded-lg flex items-center gap-2"><XCircle size={14}/> Hapus</button>
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
