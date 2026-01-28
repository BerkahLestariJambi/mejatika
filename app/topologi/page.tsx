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

// Data untuk Peta Konsep Hardware
const hardwarePoints = [
  { id: 'h1', label: 'NIC (LAN Card)', desc: 'Menghubungkan komputer ke kabel jaringan.', icon: <Cpu size={24}/>, color: '#3b82f6' },
  { id: 'h2', label: 'Router', desc: 'Penghubung antar jaringan (Gateway).', icon: <RouterIcon size={24}/>, color: '#a855f7' },
  { id: 'h3', label: 'Switch', desc: 'Distribusi data dalam jaringan LAN.', icon: <Server size={24}/>, color: '#10b981' },
  { id: 'h4', label: 'Modem/ONU', desc: 'Penerjemah sinyal internet luar.', icon: <Globe size={24}/>, color: '#f59e0b' },
  { id: 'h5', label: 'Access Point', desc: 'Pemancar sinyal Wi-Fi nirkabel.', icon: <Wifi size={24}/>, color: '#f43f5e' },
];

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);

  // FUNGSI UTAMA: Generate Peta Konsep ke Kanvas
  const generateConceptMap = () => {
    const rootId = 'root-hardware';
    const rootNode = {
      id: rootId,
      type: 'default',
      position: { x: 250, y: 150 },
      data: { label: (
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-white">
          <h3 className="font-black italic uppercase text-sm leading-none">HARDWARE JARINGAN</h3>
          <p className="text-[9px] mt-1 opacity-80 uppercase tracking-widest font-bold">Peta Konsep Bab 4</p>
        </div>
      )},
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const childNodes = hardwarePoints.map((p, i) => ({
      id: p.id,
      type: 'default',
      position: { x: 550, y: i * 110 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 rounded-xl shadow-lg group hover:border-blue-500 transition-all w-[240px] text-left">
          <div className="p-2 rounded-lg bg-slate-100 text-blue-600">{p.icon}</div>
          <div>
            <h4 className="font-black text-[10px] text-slate-800 uppercase italic leading-none">{p.label}</h4>
            <p className="text-[9px] text-slate-500 font-bold mt-1 leading-tight">"{p.desc}"</p>
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

    setNodes([rootNode, ...childNodes]);
    setEdges(childEdges);
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={() => setMenu(null)}>
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div className="text-left"><h1 className="text-sm font-black text-slate-800 uppercase leading-none">MEJATIKA CONCEPT MAP</h1></div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => {setMode('free'); setNodes([]); setEdges([]);}} className="px-4 py-2 text-xs font-bold rounded-lg bg-white shadow text-blue-600">Reset Lab</button>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setNodes([]); setEdges([]); }} />
        
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />

            {activeLesson && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white/95 backdrop-blur-xl border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[380px] overflow-hidden animate-in slide-in-from-left-10 duration-500">
                  <div className="p-6 text-left">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-slate-900 text-lg font-black uppercase italic leading-tight">{activeLesson.title}</h2>
                        <button onClick={() => setActiveLesson(null)}><X size={18}/></button>
                    </div>
                    
                    <div className="space-y-3">
                      {activeLesson.points.map((p: string, i: number) => {
                        const isHardware = p.toLowerCase().includes('hardware');
                        return (
                          <button 
                            key={i} 
                            onClick={() => isHardware && generateConceptMap()}
                            className={`w-full flex gap-3 items-center p-4 rounded-xl border transition-all text-left
                            ${isHardware ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                          >
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isHardware ? 'bg-white text-blue-600' : 'bg-slate-200'}`}>{i+1}</span>
                            <p className="text-[11px] font-black uppercase tracking-tight">{p}</p>
                            {isHardware && <ChevronRight size={16} className="ml-auto animate-bounce-x" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Panel>
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
