'use client';
import { Router, Server, Monitor, HardDrive, Share2, Radio, Hash } from 'lucide-react';

interface SidebarProps {
  activeMode: 'free' | 'bus' | 'mesh';
}

export default function Sidebar({ activeMode }: SidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Data komponen untuk setiap mode
  const components = {
    free: [
      { id: 'router', label: 'Router', icon: <Router size={20} />, color: 'text-blue-500' },
      { id: 'switch', label: 'Switch', icon: <Server size={20} />, color: 'text-green-500' },
      { id: 'pc', label: 'PC', icon: <Monitor size={20} />, color: 'text-slate-500' },
    ],
    bus: [
      { id: 'bus-node', label: 'Bus Station', icon: <Hash size={20} />, color: 'text-orange-500' },
      { id: 'pc', label: 'Terminal PC', icon: <Monitor size={20} />, color: 'text-slate-500' },
      { id: 'terminator', label: 'Terminator', icon: <Radio size={20} />, color: 'text-red-500' },
    ],
    mesh: [
      { id: 'mesh-node', label: 'Mesh Router', icon: <Share2 size={20} />, color: 'text-purple-500' },
      { id: 'server', label: 'Mesh Server', icon: <HardDrive size={20} />, color: 'text-blue-500' },
      { id: 'pc', label: 'PC Node', icon: <Monitor size={20} />, color: 'text-slate-500' },
    ]
  };

  const currentItems = components[activeMode];

  return (
    <aside className="w-72 border-r bg-white p-5 shadow-sm h-full">
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Inventory: {activeMode.toUpperCase()}
        </h2>
      </div>
      
      <div className="space-y-3">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onDragStart={(e) => onDragStart(e, item.id)}
            draggable
            className="flex cursor-grab items-center gap-3 rounded-xl border border-slate-100 p-4 bg-white hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing group"
          >
            <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition-colors ${item.color}`}>
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed text-center italic">
          Drag komponen ke canvas untuk memulai simulasi {activeMode}
        </p>
      </div>
    </aside>
  );
}
