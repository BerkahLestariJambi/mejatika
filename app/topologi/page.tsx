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

// Import komponen lokal
import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  LayoutGrid, 
  Share2, 
  Network as MeshIcon, 
  Trash2, 
  Camera, 
  ShieldCheck, 
  XCircle, 
  Edit3,
  BookOpen,
  X,
  ChevronRight,
  Cpu,
  Router as RouterIcon,
  Server,
  Globe,
  Wifi
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// Data Detail Hardware untuk Level 3
const hardwareDetails: Record<string, { icon: any, desc: string }> = {
  "NIC (LAN Card)": { icon: <Cpu size={40} />, desc: "Kartu jaringan yang memungkinkan komputer terhubung ke jaringan kabel." },
  "Router": { icon: <RouterIcon size={40} />, desc: "Perangkat cerdas yang menghubungkan dua jaringan atau lebih (LAN ke Internet)." },
  "Switch": { icon: <Server size={40} />, desc: "Penghubung perangkat dalam satu LAN yang bekerja secara efisien." },
  "Modem/ONU": { icon: <Globe size={40} />, desc: "Mengubah sinyal optik/analog menjadi sinyal digital internet." },
  "Access Point": { icon: <Wifi size={40} />, desc: "Memancarkan sinyal Wi-Fi agar perangkat bisa terhubung tanpa kabel." },
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  
  // State untuk Materi & Context Menu
  const [activeLesson, setActiveLesson] = useState<{
    title: string, 
    content: string, 
    points: string[],
    category?: string 
  } | null>(null);
  
  // State BARU untuk Level 3 (Detail Hardware)
  const [selectedHardware, setSelectedHardware] = useState<string | null>(null);
  
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge'; label: string } | null>(null);

  // --- LOGIKA KLIK KANAN (FITUR ASLI) ---
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setMenu({ 
        id: node.id, 
        x: event.clientX, 
        y: event.clientY, 
        type: 'node', 
        label: node.data.label 
      });
    },
    [setMenu]
  );

  const deleteElement = () => {
    if (!menu) return;
    setNodes((nds) => nds.filter((n) => n.id !== menu.id));
    setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    setMenu(null);
  };

  const renameElement = () => {
    const newName = prompt("Ganti nama perangkat:", menu?.label);
    if (newName && menu) {
      setNodes((nds) => nds.map((n) => n.id === menu.id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
    setMenu(null);
  };

  // --- LOGIKA DRAG & DROP & CONNECT (FITUR ASLI) ---
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = { 
        x: event.clientX - rect.left - 50, 
        y: event.clientY - rect.top - 50 
      };
      
      const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
      
      const newNode = {
        id: newId,
        type: 'device',
        position,
        data: { 
          label: label || type.toUpperCase(), 
          type, 
          ip: `192.168.1.${nodes.length + 10}` 
        },
      };

      setNodes((nds) => nds.concat(newNode));

      if (mode === 'bus' && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
      } else if (mode === 'mesh') {
        const meshEdges = nodes.map((node) => ({ id: `e-${newId}-${node.id}`, source: newId, target: node.id }));
        setEdges((eds) => eds.concat(meshEdges as any));
      }
    },
    [nodes, mode, setNodes, setEdges]
  );

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      
      {/* 1. NAVBAR (FITUR ASLI) */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">MEJATIKA NETWORK v2</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Lab Informatika SMK - Bab 4</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => {setMode('free'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><LayoutGrid size={14} className="inline mr-2"/>Manual</button>
          <button onClick={() => {setMode('bus'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Share2 size={14} className="inline mr-2"/>Bus</button>
          <button onClick={() => {setMode('mesh'); setNodes([]); setEdges([]);}} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><MeshIcon size={14} className="inline mr-2"/>Mesh</button>
        </div>
        
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-black rounded-lg transition-all shadow-md">
          <Camera size={14} /> Cetak Lab
        </button>
      </nav>

      <div className="flex flex-grow overflow-hidden relative">
        
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => {
            setActiveLesson(lesson);
            setSelectedHardware(null); // Reset detail hardware jika ganti materi
        }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls className="print:hidden" />

            {/* 4. MODAL MATERI (DIUBAH UNTUK NAVIGASI 3 LEVEL) */}
            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 pointer-events-none">
                <div className="flex items-start gap-4 pointer-events-auto">
                    
                    {/* LEVEL 2: DAFTAR POIN (HARDWARE, MEDIA, DLL) */}
                    <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-10 duration-500">
                      <div className="relative h-20 bg-slate-900 flex items-center px-6">
                        <div className="z-10 text-left">
                          <span className="bg-blue-600 text-[9px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest">
                            {activeLesson.category || 'Materi Bab 4'}
                          </span>
                          <h2 className="text-white text-lg font-black leading-tight uppercase italic">{activeLesson.title}</h2>
                        </div>
                        <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white transition-colors"><X size={16} /></button>
                      </div>

                      <div className="p-6 space-y-4 text-left">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{activeLesson.content}"</p>
                        </div>

                        <div className="space-y-2">
                          {activeLesson.points.map((p, i) => {
                            const isHardware = p.toLowerCase().includes('hardware');
                            return (
                              <button 
                                key={i} 
                                onClick={() => isHardware && setSelectedHardware("NIC (LAN Card)")}
                                className={`w-full flex gap-3 items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm transition-all duration-300 group
                                ${isHardware ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer' : 'opacity-80'}`}
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {i + 1}
                                </div>
                                <p className="text-[11px] font-bold text-slate-600 leading-tight tracking-wide text-left">{p}</p>
                                {isHardware && <ChevronRight size={14} className="ml-auto text-blue-400 animate-pulse" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 3: MODAL LIST HARDWARE & GAMBAR (MUNCUL SETELAH KLIK NO 1) */}
                    {selectedHardware && (
                      <div className="bg-white border-2 border-blue-600 shadow-2xl rounded-3xl w-[350px] overflow-hidden animate-in zoom-in-95 slide-in-from-left-5 duration-500 text-left flex flex-col h-fit">
                        <div className="p-6 bg-slate-900 flex justify-between items-center">
                          <h3 className="text-white font-black uppercase italic tracking-tighter flex items-center gap-2">
                            <Cpu size={18} className="text-blue-500" /> Eksplorasi Hardware
                          </h3>
                          <button onClick={() => setSelectedHardware(null)} className="text-white/50 hover:text-white"><X size={16}/></button>
                        </div>
                        
                        <div className="p-4 space-y-3 bg-slate-50 max-h-[500px] overflow-y-auto">
                          {Object.entries(hardwareDetails).map(([name, data], idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group hover:border-blue-400 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  {data.icon}
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-800 uppercase italic text-sm leading-none">{name}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Network Component</p>
                                </div>
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{data.desc}"
                              </p>
                              <button className="w-full py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-blue-600 transition-colors">
                                Gunakan di Lab
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </Panel>
            )}

            {/* 5. CONTEXT MENU (FITUR ASLI) */}
            {menu && (
              <div
                style={{ top: menu.y, left: menu.x }}
                className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[170px] overflow-hidden"
              >
                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Opsi Perangkat</div>
                <button onClick={renameElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 font-bold transition-colors">
                  <Edit3 size={14} /> Ganti Nama
                </button>
                <button onClick={deleteElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors">
                  <XCircle size={14} /> Hapus
                </button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() {
  return (
    <ReactFlowProvider>
      <NetworkLabContent />
    </ReactFlowProvider>
  );
}
