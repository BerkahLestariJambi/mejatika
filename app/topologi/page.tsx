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
  Eraser, StickyNote, Type
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- 1. FITUR CATATAN / TULIS DI KANVAS ---
  const addStickyNote = () => {
    const text = prompt("Tulis catatan Anda:");
    if (!text) return;
    const id = `note_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      id,
      type: 'default',
      position: { x: 400, y: 100 },
      data: { label: (
        <div className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded shadow-md text-left">
          <div className="flex items-center gap-2 mb-1 border-b border-yellow-200 pb-1">
            <StickyNote size={12} className="text-yellow-600"/>
            <span className="text-[9px] font-bold text-yellow-700 uppercase">Memo Canvas</span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-tight">{text}</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 180 }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // --- 2. FITUR CLEAR CANVAS ---
  const clearCanvas = () => {
    if (confirm("Hapus seluruh perangkat dan catatan di kanvas?")) {
      setNodes([]);
      setEdges([]);
      setIsMapActive(false);
    }
  };

  // --- 3. LOGIKA KLIK KANAN ---
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ id: node.id, x: event.clientX, y: event.clientY, type: 'node', label: node.data.label });
  }, [setMenu]);

  const deleteElement = () => {
    setNodes((nds) => nds.filter((n) => n.id !== menu.id));
    setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
    setMenu(null);
  };

  // --- 4. DRAG & DROP + OTOMATISASI TOPOLOGI ---
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

  // --- 5. LOGIKA GENERATE PETA KONSEP DINAMIS UNTUK SEMUA MATERI ---
  const generateMap = (title: string, points: string[]) => {
    setIsMapActive(true);
    const rootId = `root-${Math.random()}`;
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 100, y: 200 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-white text-left animate-in zoom-in-50">
          <h3 className="font-black italic uppercase text-sm leading-none">{title}</h3>
          <p className="text-[9px] mt-1 opacity-80 uppercase font-bold tracking-tighter">Struktur Peta Konsep</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const childNodes = points.map((p, i) => ({
      id: `child-${i}-${rootId}`,
      type: 'default',
      position: { x: 450, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-100 rounded-xl shadow-lg w-[280px] text-left hover:border-blue-500 transition-all">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-black text-xs">{i + 1}</div>
          <p className="text-[10px] text-slate-700 font-bold leading-tight uppercase tracking-tight">{p}</p>
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
            <h1 className="text-sm font-black text-slate-800 uppercase leading-none italic">SANPIO NETWORK LAB</h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Informatika Fase E</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs font-bold rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <div className="flex gap-2">
            <button onClick={addStickyNote} className="p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg shadow-sm transition-all" title="Tulis Catatan">
              <Type size={18} />
            </button>
            <button onClick={clearCanvas} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg shadow-sm transition-all" title="Hapus Kanvas">
              <Eraser size={18} />
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-black"><Camera size={14} /> Cetak</button>
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
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {/* PANEL MATERI OTOMATIS */}
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-10 duration-500 text-left">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">{activeLesson.category}</span>
                        <h2 className="text-slate-900 text-lg font-black uppercase italic leading-tight mt-1">{activeLesson.title}</h2>
                      </div>
                      <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
                    </div>
                    
                    <button 
                      onClick={() => generateMap(activeLesson.title, activeLesson.points)}
                      className="w-full mb-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={14}/> Generate Peta Konsep
                    </button>

                    <div className="space-y-2 border-t pt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Poin Pembahasan:</p>
                      {activeLesson.points.map((p: string, i: number) => (
                        <div key={i} className="flex gap-3 items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="w-5 h-5 rounded bg-white border flex items-center justify-center text-[9px] font-black text-blue-600">{i+1}</span>
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight leading-tight">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* PANEL RESET PETA KONSEP */}
            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2 animate-bounce-in">
                   <X size={14}/> Tutup Peta Konsep
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl py-1.5 min-w-[170px] overflow-hidden">
                <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Opsi Kanvas</div>
                <button onClick={() => {
                  const newName = prompt("Ganti nama:", menu.label);
                  if (newName) setNodes((nds) => nds.map((n) => n.id === menu.id ? { ...n, data: { ...n.data, label: newName } } : n));
                  setMenu(null);
                }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 font-bold transition-colors"><Edit3 size={14}/> Ganti Nama</button>
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
