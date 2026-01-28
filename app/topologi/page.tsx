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
  Eraser, Type, Info, Layers, Cable, Hash, Camera, Activity
} from 'lucide-react';

const nodeTypes = { device: DeviceNode };

// --- DATABASE SUB-MATERI SUPER DETAIL ---
// Setiap poin materi di sini akan menjadi isi peta konsep saat diklik
const subMateriData: Record<string, { label: string, desc: string, icon: any }[]> = {
  // --- KELOMPOK HARDWARE ---
  "NIC (LAN Card)": [
    { label: "Physical Layer", desc: "Beroperasi pada Layer 1 & 2 OSI.", icon: <Layers size={18}/> },
    { label: "MAC Address", desc: "Identitas unik perangkat dari pabrik.", icon: <Hash size={18}/> },
    { label: "Port RJ45", desc: "Tempat mencolokkan kabel UTP.", icon: <Cable size={18}/> }
  ],
  "Router": [
    { label: "Inter-Network", desc: "Menghubungkan network yang berbeda subnet.", icon: <RouterIcon size={18}/> },
    { label: "IP Routing", desc: "Menentukan jalur terbaik untuk paket data.", icon: <Activity size={18}/> },
    { label: "DHCP Server", desc: "Memberikan IP otomatis ke client.", icon: <Hash size={18}/> }
  ],
  "Switch": [
    { label: "Filtering", desc: "Mengirim data hanya ke port tujuan (MAC).", icon: <Server size={18}/> },
    { label: "VLAN", desc: "Segmentasi jaringan secara virtual.", icon: <LayoutGrid size={18}/> },
    { label: "Full Duplex", desc: "Bisa kirim dan terima data bersamaan.", icon: <Activity size={18}/> }
  ],
  "Modem": [
    { label: "Modulasi", desc: "Mengubah sinyal digital ke analog (ISP).", icon: <Globe size={18}/> },
    { label: "Pintu Internet", desc: "Gerbang utama menuju jaringan publik.", icon: <Globe size={18}/> }
  ],

  // --- KELOMPOK TOPOLOGI ---
  "Topologi Bus": [
    { label: "Backbone", desc: "Satu kabel utama sebagai jalur transmisi.", icon: <Share2 size={18}/> },
    { label: "Terminator", desc: "Penyerap sinyal di ujung kabel.", icon: <XCircle size={18}/> }
  ],
  "Topologi Star": [
    { label: "Sentralisasi", desc: "Semua node terhubung ke Switch pusat.", icon: <LayoutGrid size={18}/> },
    { label: "Fault Tolerance", desc: "Satu kabel putus, yang lain tetap aman.", icon: <ShieldCheck size={18}/> }
  ],
  "Topologi Mesh": [
    { label: "Redundansi", desc: "Banyak jalur cadangan antar perangkat.", icon: <MeshIcon size={18}/> },
    { label: "Dedicated Link", desc: "Kapasitas bandwidth lebih terjamin.", icon: <Activity size={18}/> }
  ],

  // --- KELOMPOK OSI LAYER ---
  "Physical Layer": [
    { label: "Media Transmisi", desc: "Bentuk fisik seperti kabel dan radio.", icon: <Cable size={18}/> },
    { label: "Bitstream", desc: "Data diubah menjadi sinyal listrik/cahaya.", icon: <Activity size={18}/> }
  ],
  "Network Layer": [
    { label: "Logical Address", desc: "Penanganan IP Address (IPv4/IPv6).", icon: <Hash size={18}/> },
    { label: "Packet Forwarding", desc: "Meneruskan paket antar router.", icon: <RouterIcon size={18}/> }
  ],

  // --- MEDIA TRANSMISI ---
  "Kabel UTP": [
    { label: "Standard RJ45", desc: "Konektor standar jaringan LAN.", icon: <Cable size={18}/> },
    { label: "Twisted Pair", desc: "Kabel berpilin untuk kurangi gangguan.", icon: <Info size={18}/> }
  ],
  "Fiber Optic": [
    { label: "Pulsa Cahaya", desc: "Transmisi data lewat serat kaca.", icon: <Activity size={18}/> },
    { label: "Long Distance", desc: "Sangat minim loss untuk jarak jauh.", icon: <Globe size={18}/> }
  ],

  // --- PENGALAMATAN ---
  "IPv4": [
    { label: "32-bit", desc: "Terbagi menjadi 4 oktet desimal.", icon: <Hash size={18}/> },
    { label: "Classful", desc: "Pembagian Kelas A, B, C, D, dan E.", icon: <Layers size={18}/> }
  ],
  "Subnetting": [
    { label: "Efisiensi", desc: "Menghemat penggunaan alamat IP.", icon: <LayoutGrid size={18}/> },
    { label: "Broadcast Domain", desc: "Memperkecil ruang lingkup broadcast.", icon: <Activity size={18}/> }
  ]
};

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mode, setMode] = useState<'free' | 'bus' | 'mesh'>('free');
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);

  // --- KLIK KANAN (CONTEXT MENU) ---
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    setMenu({ id: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  // --- DRAG & DROP INVENTORY ---
  const onDragOver = useCallback((e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    if (!type || !reactFlowWrapper.current) return;
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - 50, y: event.clientY - rect.top - 50 };
    setNodes((nds) => nds.concat({ 
      id: `node_${Date.now()}`, 
      type: 'device', 
      position, 
      data: { label: label || type.toUpperCase(), type, ip: `192.168.1.${nodes.length + 10}` } 
    }));
  }, [nodes, setNodes]);

  // --- PETA KONSEP DETAIL ---
  const handleSubMateriClick = (pointName: string) => {
    setIsMapActive(true);
    const childrenData = subMateriData[pointName] || [
      { label: "Informasi", desc: `Detail lengkap mengenai ${pointName}.`, icon: <Info size={18}/> }
    ];

    const rootNode = {
      id: 'root', type: 'default', position: { x: 50, y: 200 },
      data: { label: <div className="p-4 bg-blue-700 text-white rounded-xl shadow-xl font-black uppercase text-xs italic tracking-widest border-2 border-white/20">{pointName}</div> },
      style: { background: 'transparent', border: 'none', width: 220 }
    };

    const childNodes = childrenData.map((item, i) => ({
      id: `child-${i}`, type: 'default', position: { x: 450, y: i * 115 },
      data: { label: (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-100 rounded-2xl shadow-lg w-[320px] text-left hover:border-blue-500 transition-all duration-300">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">{item.icon}</div>
          <div>
            <h4 className="font-black text-[11px] uppercase italic text-slate-800">{item.label}</h4>
            <p className="text-[10px] text-slate-500 font-bold italic leading-tight mt-1">"{item.desc}"</p>
          </div>
        </div>
      )},
      style: { background: 'transparent', border: 'none' }
    }));

    setNodes([rootNode, ...childNodes]);
    setEdges(childNodes.map(c => ({ 
      id: `e-${c.id}`, 
      source: 'root', 
      target: c.id, 
      animated: true, 
      style: { stroke: '#2563eb', strokeWidth: 3 } 
    })));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden" onClick={onPaneClick}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b bg-white px-8 py-3 shadow-sm z-20">
        <div className="flex items-center gap-3 font-black italic">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <h1 className="text-sm uppercase tracking-tighter">MEJATIKA NETWORK v2</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 font-bold">
            <button onClick={() => setMode('free')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'free' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Manual</button>
            <button onClick={() => setMode('bus')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'bus' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Bus</button>
            <button onClick={() => setMode('mesh')} className={`px-4 py-2 text-xs rounded-lg ${mode === 'mesh' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Mesh</button>
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={() => { 
              const txt = prompt("Catatan:"); 
              if(txt) setNodes(n => n.concat({id:`n-${Date.now()}`, type:'default', position:{x:250,y:250}, data:{label:<div className="p-3 bg-yellow-100 border-2 border-yellow-400 text-[10px] font-bold shadow-md">{txt}</div>}, style:{background:'transparent', border:'none'}})) 
            }} className="p-2 bg-yellow-400 text-yellow-900 rounded-xl shadow-sm hover:scale-105 transition-all"><Type size={18}/></button>
            <button onClick={() => {if(confirm("Hapus kanvas?")){setNodes([]); setEdges([]); setIsMapActive(false);}}} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><Eraser size={18}/></button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-slate-800 text-white rounded-xl hover:bg-black transition-all shadow-md"><Camera size={16}/> CETAK HASIL</button>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow relative overflow-hidden">
        <Sidebar activeMode={mode} onSelectLesson={(lesson: any) => { setActiveLesson(lesson); setIsMapActive(false); }} />
        <div className="flex-grow relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow 
            nodes={nodes} edges={edges} 
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
            onDrop={onDrop} onDragOver={onDragOver} 
            onConnect={(p) => setEdges((eds) => addEdge({...p, animated:true}, eds))}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes} fitView
          >
            <Background gap={30} size={1} color="#cbd5e1" />
            <Controls />
            
            {activeLesson && !isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4 z-50 text-left">
                <div className="bg-white/95 border-t-4 border-t-blue-600 shadow-2xl rounded-2xl w-[350px] p-6">
                  <div className="flex justify-between items-start mb-5 font-black uppercase italic tracking-tighter">
                    <h2 className="text-slate-900 text-lg">{activeLesson.title}</h2>
                    <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                  </div>
                  <div className="space-y-3 font-black uppercase">
                    {activeLesson.points.map((p: string, i: number) => (
                      <button key={i} onClick={() => handleSubMateriClick(p)} className="w-full flex gap-3 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all group">
                        <span className="w-6 h-6 rounded bg-white text-blue-600 flex items-center justify-center text-[10px]">{i+1}</span>
                        <p className="text-[11px]">{p}</p><ChevronRight size={16} className="ml-auto opacity-40 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {isMapActive && (
              <Panel position="top-left" className="ml-4 mt-4">
                <button onClick={() => {setIsMapActive(false); setNodes([]); setEdges([]);}} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all border-2 border-white/20">
                  <X size={16}/> RESET & KEMBALI
                </button>
              </Panel>
            )}

            {/* CONTEXT MENU FIX */}
            {menu && (
              <div 
                style={{ top: menu.y, left: menu.x }} 
                className="fixed z-[999] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 min-w-[160px] pointer-events-auto"
              >
                <button 
                  onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} 
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XCircle size={14}/> Hapus Item
                </button>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function NetworkLabEditor() { return <ReactFlowProvider><NetworkLabContent /></ReactFlowProvider>; }
