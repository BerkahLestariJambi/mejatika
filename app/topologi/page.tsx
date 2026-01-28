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
  MarkerType,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import DeviceNode from '@/components/DeviceNode';
import { 
  ShieldCheck, XCircle, X, Eraser, Type, Camera, 
  Square, Circle, Rhombus, Tablet as Capsule, 
  Palette, MousePointer2, Link
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shapes'>('inventory');

  // --- LOGIKA DRAG & DROP SHAPES & DEVICES ---
  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    const shape = event.dataTransfer.getData('application/shape'); // Cek jika itu bentuk

    if (!reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };

    if (shape) {
      // Jika yang di-drop adalah bentuk peta konsep
      const borderRadius = shape === 'circle' ? '50%' : shape === 'capsule' ? '50px' : '12px';
      const rotate = shape === 'rhombus' ? 'rotate-45' : '';
      
      setNodes((nds) => nds.concat({
        id: `shape_${Date.now()}`,
        type: 'default',
        position,
        data: { label: (
          <div className={`${rotate} p-2 flex items-center justify-center text-center`}>
            <textarea 
              placeholder="Teks..." 
              className={`bg-transparent border-none text-[10px] font-black uppercase text-center focus:ring-0 resize-none ${shape === 'rhombus' ? '-rotate-45' : ''}`}
              rows={2}
            />
          </div>
        )},
        style: { 
          background: '#ffffff', border: '3px solid #1e40af', 
          width: 120, height: 120, borderRadius,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }
      }));
    } else {
      // Jika yang di-drop adalah perangkat inventory
      setNodes((nds) => nds.concat({
        id: `node_${Date.now()}`, type: 'device', position,
        data: { label: label || type.toUpperCase(), type, ip: '192.168.1.x' },
      }));
    }
  }, [setNodes]);

  // --- FUNGSI UBAH WARNA VIA KLIK KANAN ---
  const changeColor = (id: string, color: string, border: string) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, style: { ...node.style, background: color, borderColor: border } };
      }
      return node;
    }));
    setMenu(null);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-md z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm font-black uppercase italic text-blue-900">Mejatika Concept & Lab Pro</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {if(confirm("Hapus semua?")){setNodes([]); setEdges([]);}}} className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"><Eraser size={20}/></button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black shadow-xl uppercase italic hover:bg-blue-700 transition-all"><Camera size={18}/> CETAK PDF</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        {/* SIDEBAR DENGAN TAB GANDA */}
        <aside className="w-72 bg-white border-r flex flex-col z-30 shadow-xl">
          <div className="flex border-b">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-tighter ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
            <button onClick={() => setActiveTab('shapes')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-tighter ${activeTab === 'shapes' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Shapes</button>
          </div>

          <div className="p-4 overflow-y-auto flex-grow">
            {activeTab === 'inventory' ? (
              <Sidebar onSelectLesson={() => {}} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'square', icon: <Square />, label: 'Kotak' },
                  { id: 'circle', icon: <Circle />, label: 'Lingkaran' },
                  { id: 'rhombus', icon: <Rhombus />, label: 'Ketupat' },
                  { id: 'capsule', icon: <Capsule />, label: 'Kapsul' },
                ].map((s) => (
                  <div 
                    key={s.id} draggable
                    onDragStart={(e) => { e.dataTransfer.setData('application/shape', s.id); }}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-grab transition-all group"
                  >
                    <div className="text-slate-400 group-hover:text-blue-600 mb-2">{s.icon}</div>
                    <span className="text-[9px] font-black uppercase">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
        
        <div className="flex-grow relative bg-[#f1f5f9]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver}
            connectionMode={ConnectionMode.Loose}
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true, style:{strokeWidth:4, stroke:'#1e40af'}, markerEnd:{type:MarkerType.ArrowClosed, color:'#1e40af'}}, eds))}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY }); }}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />
            
            {/* PANEL INSTRUKSI */}
            <Panel position="bottom-center" className="bg-blue-900 text-white px-6 py-2 rounded-full shadow-2xl mb-4">
              <p className="text-[9px] font-black uppercase italic tracking-widest flex items-center gap-4">
                <span><MousePointer2 size={12} className="inline mr-1"/> Drag & Drop dari Sidebar</span>
                <span><Link size={12} className="inline mr-1"/> Tarik garis dari bulatan kecil</span>
                <span><Palette size={12} className="inline mr-1"/> Klik kanan node untuk warna</span>
              </p>
            </Panel>

            {/* CUSTOM CONTEXT MENU */}
            {menu && (
              <div style={{ top: menu.y, left: menu.x }} className="fixed z-[9999] bg-white border shadow-2xl rounded-2xl p-3 min-w-[200px]">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-2 px-2">Pilih Warna</p>
                <div className="flex gap-2 mb-3 px-2">
                  <button onClick={() => changeColor(menu.id, '#eff6ff', '#1e40af')} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow" />
                  <button onClick={() => changeColor(menu.id, '#fef2f2', '#b91c1c')} className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow" />
                  <button onClick={() => changeColor(menu.id, '#f0fdf4', '#15803d')} className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow" />
                  <button onClick={() => changeColor(menu.id, '#fffbeb', '#b45309')} className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow" />
                </div>
                <div className="h-[1px] bg-slate-100 my-2" />
                <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] text-red-600 font-black uppercase hover:bg-red-50 rounded-lg transition-all"><XCircle size={16}/> Hapus Item</button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
