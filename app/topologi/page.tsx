'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DeviceNode from '@/components/DeviceNode';

// Daftarkan komponen kustom kita
const nodeTypes = {
  device: DeviceNode,
};

const initialNodes = [
  {
    id: 'router-1',
    type: 'device',
    data: { label: 'Core Router', type: 'router', ip: '192.168.1.1' },
    position: { x: 250, y: 0 },
  },
  {
    id: 'switch-1',
    type: 'device',
    data: { label: 'Main Switch', type: 'switch', ip: 'L2 Managed' },
    position: { x: 250, y: 150 },
  },
  {
    id: 'pc-1',
    type: 'device',
    data: { label: 'Workstation 01', type: 'pc', ip: '192.168.1.10' },
    position: { x: 100, y: 300 },
  },
  {
    id: 'pc-2',
    type: 'device',
    data: { label: 'Workstation 02', type: 'pc', ip: '192.168.1.11' },
    position: { x: 400, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'router-1', target: 'switch-1', animated: true },
  { id: 'e2-3', source: 'switch-1', target: 'pc-1' },
  { id: 'e2-4', source: 'switch-1', target: 'pc-2' },
];

export default function NetworkLab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <main className="flex flex-col h-screen w-full bg-slate-50">
      {/* Header Sederhana */}
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="font-bold text-xl text-slate-800">Lab Simulator Jaringan</h1>
        <div className="text-sm text-slate-500">Status: <span className="text-green-500 font-medium">Online</span></div>
      </div>

      {/* Area Canvas */}
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={25} size={1} color="#e2e8f0" />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
