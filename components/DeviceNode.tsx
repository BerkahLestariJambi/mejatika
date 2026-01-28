'use client';
import { Handle, Position } from '@xyflow/react';
import { 
  Router, 
  Server, 
  Monitor, 
  HardDrive, 
  Share2, 
  Radio, 
  Hash, 
  Cable, 
  ShieldCheck,
  Cpu,
  AlertCircle
} from 'lucide-react';

// Pemetaan Ikon lengkap sesuai ID di Sidebar
const icons: Record<string, React.ReactNode> = {
  // Common
  router: <Router className="w-6 h-6 text-blue-500" />,
  switch: <Server className="w-6 h-6 text-emerald-500" />,
  pc: <Monitor className="w-6 h-6 text-slate-600" />,
  firewall: <ShieldCheck className="w-6 h-6 text-red-500" />,
  
  // Bus Topology
  'bus-backbone': <Cable className="w-6 h-6 text-orange-500" />,
  terminator: <Radio className="w-6 h-6 text-red-600" />,
  repeater: <Hash className="w-6 h-6 text-blue-500" />,
  
  // Mesh Topology
  'mesh-node': <Share2 className="w-6 h-6 text-purple-500" />,
  server: <HardDrive className="w-6 h-6 text-cyan-500" />,
  gateway: <Cpu className="w-6 h-6 text-indigo-500" />,
};

export default function DeviceNode({ data }: any) {
  // Cek apakah ada IP conflict (opsional, untuk fitur validasi)
  const isConflict = data.hasConflict;

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl bg-white border-2 transition-all min-w-[120px] ${
      isConflict ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 hover:border-blue-400'
    }`}>
      
      <div className="flex flex-col items-center italic">
        {/* Ikon Container */}
        <div className={`p-2 rounded-full mb-2 ${isConflict ? 'bg-red-200' : 'bg-slate-50'}`}>
          {icons[data.type] || <Monitor className="w-6 h-6 text-slate-400" />}
        </div>

        {/* Info Label */}
        <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
          {data.label}
        </div>

        {/* Status / IP */}
        <div className={`text-[9px] font-mono mt-1 ${isConflict ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
          {isConflict ? (
            <span className="flex items-center gap-1 uppercase italic">
              <AlertCircle size={10} /> IP Conflict
            </span>
          ) : (
            data.ip || 'No IP'
          )}
        </div>
      </div>

      {/* Titik koneksi (Handles) - Kita tambah di 4 sisi agar kabel tidak semrawut */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-400 border-white border-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400 border-white border-2" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-blue-400 border-white border-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-400 border-white border-2" />
    </div>
  );
}
