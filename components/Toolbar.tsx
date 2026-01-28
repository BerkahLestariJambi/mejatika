'use client';
import { Network, GitBranch } from 'lucide-react';

interface ToolbarProps {
  onSelectTopology: (topology: 'none' | 'bus' | 'mesh') => void;
  selectedTopology: 'none' | 'bus' | 'mesh';
  onAddDevice: (type: 'router' | 'switch' | 'pc') => void;
}

export default function Toolbar({ onSelectTopology, selectedTopology, onAddDevice }: ToolbarProps) {
  const buttonClass = (isActive: boolean) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-slate-700 hover:bg-slate-100'
    }`;

  const deviceButtonClass = "p-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors";

  return (
    <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
      <div className="flex gap-2">
        <button
          className={buttonClass(selectedTopology === 'none')}
          onClick={() => onSelectTopology('none')}
        >
          <span className="flex items-center gap-2"><GitBranch className="w-4 h-4" /> Freeform</span>
        </button>
        <button
          className={buttonClass(selectedTopology === 'bus')}
          onClick={() => onSelectTopology('bus')}
        >
          <span className="flex items-center gap-2"><Network className="w-4 h-4" /> Bus</span>
        </button>
        <button
          className={buttonClass(selectedTopology === 'mesh')}
          onClick={() => onSelectTopology('mesh')}
        >
          <span className="flex items-center gap-2"><Network className="w-4 h-4" /> Mesh</span>
        </button>
      </div>

      <div className="flex gap-2 border-l border-slate-200 pl-4 ml-4">
        <button className={deviceButtonClass} onClick={() => onAddDevice('router')}>
          <span className="flex items-center gap-2 text-slate-700">
            <Network className="w-4 h-4 text-blue-500" /> Router
          </span>
        </button>
        <button className={deviceButtonClass} onClick={() => onAddDevice('switch')}>
          <span className="flex items-center gap-2 text-slate-700">
            <Server className="w-4 h-4 text-green-500" /> Switch
          </span>
        </button>
        <button className={deviceButtonClass} onClick={() => onAddDevice('pc')}>
          <span className="flex items-center gap-2 text-slate-700">
            <Monitor className="w-4 h-4 text-slate-600" /> PC
          </span>
        </button>
      </div>
    </div>
  );
}
