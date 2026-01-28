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
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import '@xyflow/react/dist/style.css';

// Komponen Internal
import DeviceNode from '@/components/DeviceNode';
import Sidebar from '@/components/Sidebar';
import { Network, Trash2, Zap, Share2 } from 'lucide-react';

const nodeTypes = {
  device: DeviceNode,
};

function NetworkEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [topologyMode, setTopologyMode] = useState<'free' | 'bus' | 'mesh'>('free');

  // 1. Logika Koneksi Manual
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // 2. Logika Drag & Drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowWrapper.current) return;

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 50,
        y: event.clientY - rect.top - 50,
      };

      const newId = uuidv4();
      const newNode: Node = {
        id: newId,
        type: 'device',
        position,
        data: { 
          label: `${type.toUpperCase()} ${nodes.length + 1}`, 
          type: type, 
          ip: `192.168.1.${nodes.length + 10}` 
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // 3. Logika Auto-Topology
      if (topologyMode === 'mesh') {
        const meshEdges = nodes.map((node) => ({
          id: `e-${newId}-${node.id}`,
          source: newId,
          target: node.id,
          animated: true,
        }));
        setEdges((eds) => eds.concat(meshEdges));
      } else if (topologyMode === 'bus' && nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        setEdges((eds) => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, animated: true }, eds));
      }
    },
    [nodes, topologyMode, setNodes, setEdges]
  );

  return (
    <main className="flex h-screen w-full flex-col bg-slate-50">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Network size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">NetLab Editor</h1>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
          <button 
            onClick={() => setTopologyMode('free')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${topologyMode === 'free' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Zap size={16} /> Freeform
          </button>
          <button 
            onClick={() => { setTopologyMode('bus'); setNodes([]); setEdges([]); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${topologyMode === 'bus' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Share2 size={16} /> Bus Mode
          </button>
          <button 
            onClick={() => { setTopologyMode('mesh'); setNodes([]); setEdges([]); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${topologyMode === 'mesh' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Network size={16} /> Mesh Mode
          </button>
        </div>

        <button 
          onClick={() => {setNodes([]); setEdges([]);}}
          className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} /> Clear Lab
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        
        <div className="relative flex-grow h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background gap={20} color="#e2e8f0" />
            <Controls />
            <Panel position="top-right" className="rounded-lg border bg-white/80 p-3 shadow-md backdrop-blur-md">
              <p className="text-xs font-semibold text-slate-500 uppercase italic">
                Active Mode: {topologyMode}
              </p>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <NetworkEditor />
    </ReactFlowProvider>
  );
}
