'use client';
import { 
  Router, 
  Server, 
  Monitor, 
  HardDrive, 
  Share2, 
  Radio, 
  Hash, 
  Cpu, 
  Cable, 
  ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  activeMode: 'free' | 'bus' | 'mesh';
}

export default function Sidebar({ activeMode }: SidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Data komponen yang disesuaikan dengan kebutuhan teknis tiap topologi
  const components = {
    free: [
      { id: 'router', label: 'Core Router', desc: 'Gateway utama jaringan', icon: <Router size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 'switch', label: 'L2 Switch', desc: 'Penghubung antar perangkat', icon: <Server size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { id: 'pc', label: 'Workstation', desc: 'End-user computer', icon: <Monitor size={20} />, color: 'text-slate-500', bg: 'bg-slate-50' },
      { id: 'firewall', label: 'Firewall', desc: 'Keamanan jaringan', icon: <ShieldCheck size={20} />, color: 'text-red-500', bg: 'bg-red-50' },
    ],
    bus: [
      { id: 'bus-backbone', label: 'Backbone Node', desc: 'Jalur utama transmisi data', icon: <Cable size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
      { id: 'pc', label: 'Tap PC', icon: <Monitor size={20} />, desc: 'Perangkat yang terhubung ke bus', color: 'text-slate-500', bg: 'bg-slate-50' },
      { id: 'terminator', label: 'Terminator', desc: 'Penyerap sinyal di ujung kabel', icon: <Radio size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
      { id: 'repeater', label: 'Repeater', desc: 'Penguat sinyal bus', icon: <Hash size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    ],
    mesh: [
      { id: 'mesh-node', label: 'Full-Mesh Router', desc: 'Router dengan banyak interface', icon: <Share2 size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
      { id: 'server', label: 'Central Storage', desc: 'Server pusat data mesh', icon: <HardDrive size={20} />, color: 'text-cyan-500', bg: 'bg-cyan-50' },
      { id: 'pc', label: 'Mesh Client', desc: 'Node client dalam mesh', icon: <Monitor size={20} />, color: 'text-slate-500', bg: 'bg-slate-50' },
      { id: 'gateway', label: 'Mesh Gateway', desc: 'Pintu keluar ke internet', icon: <Cpu size={20} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ]
  };

  const currentItems = components[activeMode];

  return (
    <aside className="w-80 border-r bg-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Header Sidebar */}
      <div className="p-6 border-b bg-slate-50/50">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          Inventory Mode
        </h2>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          {activeMode === 'free' ? 'Standard Lab' : `Topology ${activeMode.toUpperCase()}`}
        </h3>
      </div>
      
      {/* List Item */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onDragStart={(e) => onDragStart(e, item.id, item.label)}
            draggable
            className="group flex cursor-grab items-start gap-4 rounded-2xl border border-slate-100 p-4 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:cursor-grabbing active:scale-95"
          >
            <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
              {item.icon}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Hint */}
      <div className="p-6 bg-slate-50 border-t">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic text-center">
            &ldquo;Tarik komponen ke area canvas untuk mulai merancang {activeMode} network.&rdquo;
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
