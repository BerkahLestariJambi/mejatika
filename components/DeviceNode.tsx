'use client';
import { Handle, Position } from '@xyflow/react';
import { Router, Server, Monitor } from 'lucide-react';

const icons = {
  router: <Router className="w-6 h-6 text-blue-500" />,
  switch: <Server className="w-6 h-6 text-green-500" />,
  pc: <Monitor className="w-6 h-6 text-slate-600" />,
};

export default function DeviceNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-slate-200 min-w-[100px]">
      <div className="flex flex-col items-center">
        <div className="p-2 bg-slate-50 rounded-full mb-1">
          {icons[data.type as keyof typeof icons] || <Monitor />}
        </div>
        <div className="text-xs font-bold">{data.label}</div>
        <div className="text-[10px] text-slate-400">{data.ip}</div>
      </div>

      {/* Titik koneksi kabel */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400" />
    </div>
  );
}
