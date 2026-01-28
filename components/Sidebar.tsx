'use client';
import { Router, Server, Monitor } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const devices = [
    { type: 'router', label: 'Core Router', icon: <Router className="text-blue-500" /> },
    { type: 'switch', label: 'L2 Switch', icon: <Server className="text-green-500" /> },
    { type: 'pc', label: 'Workstation', icon: <Monitor className="text-slate-500" /> },
  ];

  return (
    <aside className="w-64 border-r bg-white p-4 shadow-inner">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Inventory</h2>
      <div className="space-y-3">
        {devices.map((dev) => (
          <div
            key={dev.type}
            draggable
            onDragStart={(e) => onDragStart(e, dev.type)}
            className="flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {dev.icon}
            <span className="text-sm font-medium text-slate-700">{dev.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
