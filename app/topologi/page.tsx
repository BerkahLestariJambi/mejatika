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
  ShieldCheck, XCircle, X, PlusCircle, 
  Eraser, Type, Camera, Share2, 
  MousePointer2, ArrowUpRight
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [mode, setMode] = useState<'manual' | 'bus' | 'mesh'>('manual');

  // --- FUNGSI TAMBAH NODE KONSEP CUSTOM ---
  const addCustomNode = () => {
    const id = `concept_${Date.now()}`;
    const newNode = {
      id,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { 
        label: (
          <div className="group relative">
            <textarea 
              placeholder="Ketik materi di sini..."
              className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold uppercase italic resize-none"
              rows={2}
            />
          </div>
        ) 
      },
      style: { 
        background: '#ffffff', 
        border: '3px solid #1e40af', 
        borderRadius: '12px',
        padding: '10px',
        width: 200,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // --- DRAG & DROP PERANGKAT (TETAP AKTIF) ---
  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');

    if (!type || !reactFlowWrapper.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left - 50,
      y: event.clientY - rect.top - 50,
    };

    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`,
      type: 'device',
      position,
      data: { label: label || type.toUpperCase(), type, ip: '192.168.1.x' },
    }));
  }, [setNodes]);

  // --- GENERATE TOPOLOGI OTOMATIS (BUS & MESH) ---
  const generateTopology = (type: 'bus' | 'mesh') => {
    const newNodes = []; const newEdges = []; const count = 5;
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: `t-${i}`, type: 'device',
        position: { x: type === 'bus' ? i * 220 + 50 : 400 + 180 * Math.cos(2*Math.PI*i/count), 
                    y: type === 'bus' ? 250 : 250 + 180 * Math.sin(2*Math.PI*i/count) },
        data: { label: `Node-${i+1}`, type: 'pc' }
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

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      {/* TOOLBAR ATAS */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-800 p-2 rounded-xl text-white shadow-xl rotate-2"><ShieldCheck size={24} /></div>
          <div>
            <h1 className="text-sm font-black uppercase italic leading-none text-blue-900">Mejatika Concept Builder</h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Toolbox Peta Konsep v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* TOMBOL TOOLBOX KHUSUS KONSEP */}
          <button 
            onClick={addCustomNode}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg transition-all active:scale-95"
          >
            <PlusCircle size={16}/> Tambah Kotak Konsep
          </button>

          <div className="h-8 w-[2px] bg-slate-200 mx-2" />

          {/* MODE TOPOLOGI */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border">
            <button onClick={() => generateTopology('bus')} className="px-3 py-2 text-[9px] font-black uppercase rounded-lg hover:bg-white transition-all text-slate-600">Topologi Bus</button>
            <button onClick={() => generateTopology('mesh')} className="px-3 py-2 text-[9px] font-black uppercase rounded-lg hover:bg-white transition-all text-slate-600">Topologi Mesh</button>
          </div>

          <button onClick={() => {if(confirm("Reset Kanvas?")){setNodes([]); setEdges([]);}}} className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"><Eraser size={20}/></button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black shadow-xl uppercase italic tracking-widest hover:bg-blue-600 transition-all"><Camera size={18}/> CETAK HASIL</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar onSelectLesson={() => {}} /> {/* Sidebar hanya untuk inventory perangkat */}
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:3, stroke:'#1e40af'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#1e40af'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={40} size={1} color="#cbd5e1" />
            <Controls />

            <Panel position="bottom-center" className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border shadow-2xl mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase italic flex items-center gap-4">
                <span className="flex items-center gap-1"><MousePointer2 size={12}/> Drag perangkat dari samping</span>
                <span className="flex items-center gap-1"><ArrowUpRight size={12}/> Tarik garis antar lingkaran node</span>
                <span className="flex items-center gap-1 text-blue-600"><PlusCircle size={12}/> Klik 'Tambah Kotak Konsep' di atas</span>
              </p>
            </Panel>

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
