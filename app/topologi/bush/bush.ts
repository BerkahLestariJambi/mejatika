'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  Handle,
  Position,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ShieldCheck, Monitor, Network, Router, Server, Wifi, 
  Zap, Flame, Radio, Info, Users, ChevronLeft, ChevronRight,
  Trash2, Link2Off, Spline, Play, Square, Activity
} from 'lucide-react';

// --- IMPORT LOGIKA ---
import { generateBush } from './bush/bush'; 
import { generateMesh } from './mesh/mesh';
import { generateStar } from './star/star';
import { generateRing } from './ring/ring';
import { generateHybrid } from './hybrid/hybrid';

const iconLib: any = {
  pc: <Monitor size={42} />,
  router: <Router size={42} />, 
  switch: <Network size={42} />, 
  wifi: <Wifi size={42} />, 
  server: <Server size={42} />, 
  hub: <Zap size={42} />,
  firewall: <Flame size={42} />,
  ap: <Radio size={42} />,
  kabel: <Spline size={42} /> 
};

// --- CUSTOM NODE COMPONENT ---
const UniversalNode = ({ id, data }: any) => {
  const isDown = data.status === 'down';
  const iconColor = isDown 
    ? 'text-red-500 opacity-50' 
    : data.isLive 
      ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' 
      : 'text-slate-700 hover:text-blue-400';

  if (data.type === 'junction') {
    return (
      <div className="flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${data.isLive ? 'bg-blue-500 animate-ping' : 'bg-slate-800'}`} />
        <Handle type="source" position={Position.Left} id="l" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} id="r" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Top} id="t" style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} id="b" style={{ background: '#555' }} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center group transition-transform hover:scale-110">
      <Handle type="source" position={Position.Top} id="t" style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
      <Handle type="source" position={Position.Left} id="l" style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
      <Handle type="source" position={Position.Right} id="r" style={{ background: '#3b82f6', width: '8px', height: '8px' }} />
      
      <div className={`${iconColor} transition-all duration-300 ${data.isLive && !isDown ? 'animate-bounce' : ''}`}>
        {iconLib[data.shapeType] || <Monitor size={42}/>}
      </div>

      <input 
        defaultValue={data.label} 
        onChange={(e) => data.onChange(id, e.target.value)}
        className={`bg-transparent border-none text-[10px] font-bold uppercase text-center focus:ring-0 w-24 mt-1 p-0 cursor-text ${isDown ? 'text-red-400' : 'text-slate-600'}`}
      />

      {isDown && (
        <div className="absolute top-0 right-4 bg-red-600 text-white rounded-full p-1 shadow-md">
          <Link2Off size={10}/>
        </div>
      )}
    </div>
  );
};

const nodeTypes = { universal: UniversalNode };

function NetworkLabContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number; type: 'node' | 'edge' } | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [topologyType, setTopologyType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulasi'>('inventory');
  const [isLive, setIsLive] = useState(false);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
  }, [setNodes]);

  const toggleSimulation = () => {
    const nextState = !isLive;
    setIsLive(nextState);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isLive: nextState } })));
    setEdges((eds) => eds.map((e) => ({ 
      ...e, 
      animated: nextState && e.data?.status !== 'broken',
      style: { ...e.style, stroke: nextState && e.data?.status !== 'broken' ? '#3b82f6' : (e.data?.status === 'broken' ? '#ef4444' : '#1e293b') }
    })));
  };

  const handleGenerateTopology = (type: string) => {
    setNodes([]);
    setEdges([]);
    setTopologyType(type);
    setIsLive(false);

    let result: { nodes: any[], edges: any[] } = { nodes: [], edges: [] };
    const CX = 600;
    const CY = 400;

    try {
      switch (type) {
        case 'bus':
          // Fallback Logic jika generateBush gagal atau tidak me-render
          const busNodes: any[] = [];
          const busEdges: any[] = [];
          const nodeCount = 5;
          
          // Jalur Backbone (Junctions)
          for (let i = 0; i < nodeCount; i++) {
            const jId = `j-${i}`;
            busNodes.push({
              id: jId,
              type: 'universal',
              position: { x: 200 + (i * 200), y: 300 },
              data: { type: 'junction', isLive: false }
            });

            // Node PC yang terhubung ke junction
            const pcId = `pc-${i}`;
            busNodes.push({
              id: pcId,
              type: 'universal',
              position: { x: 200 + (i * 200), y: i % 2 === 0 ? 150 : 450 },
              data: { shapeType: 'pc', label: `PC-${i + 1}`, onChange: updateNodeData, isLive: false }
            });

            // Hubungkan PC ke Backbone
            busEdges.push({ 
                id: `e-pc-${i}`, source: jId, target: pcId, 
                style: { stroke: '#1e293b', strokeWidth: 3 } 
            });

            // Hubungkan antar segmen backbone
            if (i > 0) {
              busEdges.push({ 
                  id: `e-b-${i}`, source: `j-${i-1}`, target: jId, 
                  style: { stroke: '#1e293b', strokeWidth: 5 } 
              });
            }
          }
          result = { nodes: busNodes, edges: busEdges };
          break;
        case 'mesh':
          result = generateMesh(updateNodeData);
          break;
        case 'star':
          result = generateStar(updateNodeData, CX, CY);
          break;
        case 'ring':
          result = generateRing(updateNodeData, CX, CY);
          break;
        case 'hybrid':
          result = generateHybrid(updateNodeData);
          break;
      }
    } catch (error) {
      console.error("Gagal generate topologi:", error);
    }

    if (result && result.nodes.length > 0) {
      setNodes(result.nodes);
      setEdges(result.edges);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <aside className="w-72 bg-white border-r flex flex-col z-[100] shadow-xl">
        <div className="p-6 bg-slate-900 text-white font-black italic flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={28}/>
          <div className="text-sm tracking-tighter uppercase leading-none">Mejatika Lab<br/><span className="text-[10px] text-slate-400 not-italic">Visual Topology</span></div>
        </div>

        <div className="flex bg-slate-100 text-[10px] font-black border-b uppercase">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('simulasi')} className={`flex-1 py-4 transition-all ${activeTab === 'simulasi' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Simulasi</button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(iconLib).filter(k => k !== 'kabel').map(key => (
                <div key={key} draggable onDragStart={(e) => e.dataTransfer.setData('application/value', key)} className="p-4 border-2 border-slate-50 rounded-2xl flex flex-col items-center bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md cursor-grab active:scale-95 transition-all group">
                  <div className="text-slate-600 group-hover:text-blue-500 transition-colors">{iconLib[key]}</div>
                  <span className="text-[9px] font-bold mt-2 uppercase text-slate-400 group-hover:text-slate-600">{key}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={toggleSimulation} className={`w-full py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-3 transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                {isLive ? <><Square size={16}/> STOP SIMULASI</> : <><Play size={16}/> START SIMULASI</>}
              </button>
              <div className={`p-4 rounded-xl border-2 text-center transition-colors ${isLive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isLive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                  {isLive ? "Traffic Data Aktif" : "Network Standby"}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">SANPIO AI LAB © 2026</div>
      </aside>

      <main className="flex-grow relative" ref={reactFlowWrapper} onClick={() => setMenu(null)}>
        <div className="absolute top-4 left-4 z-[50] flex flex-wrap gap-2">
          {['Bus', 'Ring', 'Star', 'Mesh', 'Hybrid'].map((label) => (
            <button key={label} onClick={() => handleGenerateTopology(label.toLowerCase())} className="px-5 py-2.5 bg-white shadow-lg rounded-full text-[10px] font-black border border-slate-100 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter">
              {label}
            </button>
          ))}
          <button onClick={() => {setNodes([]); setEdges([]); setTopologyType(null)}} className="px-5 py-2.5 bg-slate-900 text-white shadow-lg rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors">Clear</button>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onDrop={(e) => {
            const type = e.dataTransfer.getData('application/value');
            if (!type || !reactFlowWrapper.current) return;
            const rect = reactFlowWrapper.current.getBoundingClientRect();
            setNodes((nds) => nds.concat({ id: `n-${Date.now()}`, type: 'universal', position: { x: e.clientX - rect.left - 30, y: e.clientY - rect.top - 30 }, data: { shapeType: type, label: type.toUpperCase(), onChange: updateNodeData, isLive } }));
          }}
          onDragOver={(e) => e.preventDefault()}
          nodeTypes={nodeTypes}
          onConnect={(p) => setEdges(eds => addEdge({...p, style:{strokeWidth:3, stroke: isLive ? '#3b82f6' : '#1e293b'}, animated: isLive}, eds))}
          onNodeContextMenu={(e, n) => { e.preventDefault(); setMenu({ id: n.id, x: e.clientX, y: e.clientY, type: 'node' }); }}
          onEdgeContextMenu={(e, ed) => { e.preventDefault(); setMenu({ id: ed.id, x: e.clientX, y: e.clientY, type: 'edge' }); }}
          connectionMode={ConnectionMode.Loose} fitView
        >
          <Background color="#e2e8f0" gap={30} variant={"dots" as any} /><Controls />
        </ReactFlow>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 p-4 rounded-full border border-slate-200 shadow-xl z-40 backdrop-blur-md">
           <div className="flex items-center gap-3 text-slate-800 font-bold text-[10px] uppercase px-4">
             <Users size={14} className="text-blue-600" /><span>Kelompok: Farel, Andri, Eklan, Boven</span>
           </div>
        </div>

        {/* --- CONTEXT MENU --- */}
        {menu && (
          <div style={{ top: menu.y, left: menu.x }} className="fixed z-[1000] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-52 animate-in zoom-in-95">
              <div className="text-[9px] font-black text-slate-400 mb-2 uppercase border-b pb-2 tracking-widest text-center">Settings</div>
              {menu.type === 'node' ? (
                <div className="space-y-1">
                  <button onClick={() => { updateNodeData(menu.id, { status: 'down' }); setMenu(null); }} className="w-full py-2 hover:bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg uppercase transition-colors">Matikan Node</button>
                  <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== menu.id)); setMenu(null); }} className="w-full py-2 hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Trash2 size={12}/> Hapus</button>
                </div>
              ) : (
                <div className="space-y-1">
                 <button onClick={() => { setEdges(eds => eds.map(e => e.id === menu.id ? {...e, data: {status: 'broken'}, animated: false, style: {stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '5,5'}} : e)); setMenu(null); }} className="w-full py-2 hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Link2Off size={12}/> Putus Kabel</button>
                 <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== menu.id)); setMenu(null); }} className="w-full py-2 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg uppercase flex items-center justify-center gap-2"><Trash2 size={12}/> Hapus Jalur</button>
                </div>
              )}
          </div>
        )}

        {/* --- REPORT PANEL --- */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">Reports</span>
          </button>
          <div className="w-[340px] bg-white h-full p-8 shadow-2xl overflow-y-auto">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800"><Info className="text-blue-600"/> Analisis Sistem</h2>
            <div className="space-y-4 text-[10px] font-bold text-slate-600 uppercase">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">Topology: <span className="text-blue-600">{topologyType || 'Custom'}</span></div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">Nodes Count: <span>{nodes.length} Devices</span></div>
               
               <div className="mt-8 border-t pt-4">
                  <h4 className="text-blue-600 mb-3 tracking-widest flex items-center gap-2"><Activity size={12}/> Teori Jaringan:</h4>
                  <div className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-blue-100 pl-4 normal-case font-medium">
                    {topologyType === 'ring' && "Data mengalir secara estafet dari satu node ke node berikutnya."}
                    {topologyType === 'star' && "Semua perangkat terhubung ke switch pusat."}
                    {topologyType === 'hybrid' && "Gabungan Star + Bus."}
                    {topologyType === 'bus' && "Menggunakan satu kabel utama (backbone). Sangat hemat kabel namun rawan mati total jika backbone putus."}
                    {topologyType === 'mesh' && "Setiap node saling terhubung secara penuh."}
                    {!topologyType && "Silakan pilih template di atas."}
                  </div>
               </div>

               {/* --- DEFINISI TAMBAHAN --- */}
               <div className="mt-6 pt-4 border-t border-dashed">
                  <h4 className="text-slate-900 mb-3 tracking-widest">Definisi Detail:</h4>
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl normal-case font-normal text-[10.5px] leading-relaxed shadow-inner">
                    {topologyType === 'bus' ? (
                      <p>Topologi Bus adalah arsitektur di mana semua simpul terhubung ke media transmisi tunggal yang memiliki dua titik akhir. Setiap paket data dikirim ke seluruh media dan diterima oleh simpul tujuan melalui identifikasi alamat.</p>
                    ) : topologyType === 'star' ? (
                      <p>Topologi Bintang memusatkan kendali pada node sentral (Hub/Switch). Semua lalu lintas data melewati pusat sebelum diteruskan ke tujuan, memudahkan manajemen dan isolasi kerusakan.</p>
                    ) : topologyType === 'ring' ? (
                      <p>Topologi Cincin menghubungkan komputer pada jalur lingkaran tertutup. Sinyal bergerak searah melalui setiap node yang bertindak sebagai repeater untuk memperkuat sinyal.</p>
                    ) : (
                      <p>Pilih topologi untuk melihat definisi teknis mendalam mengenai struktur dan mekanisme transmisi datanya.</p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
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
