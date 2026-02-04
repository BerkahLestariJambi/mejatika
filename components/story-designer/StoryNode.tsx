// src/components/story-designer/StoryNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, MessageSquare, MousePointer2, BookOpen, Star } from 'lucide-react';

const icons: any = {
  text: <Type size={32} />,
  bubble: <MessageSquare size={32} />,
  pointer: <MousePointer2 size={32} />,
  concept: <BookOpen size={32} />,
  important: <Star size={32} />,
};

export default function StoryNode({ data }: any) {
  return (
    <div className={`group relative p-5 rounded-3xl transition-all duration-700 flex flex-col items-center
      ${data.active 
        ? 'bg-orange-50 ring-[6px] ring-orange-500 scale-125 shadow-[0_0_40px_rgba(249,115,22,0.4)]' 
        : 'bg-white border-2 border-slate-100 shadow-md hover:border-orange-200'}`}>
      
      {/* Label Aksi saat Aktif */}
      {data.active && (
        <div className="absolute -top-10 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
          FOCUSING...
        </div>
      )}

      {/* Icon Utama */}
      <div className={`transition-colors duration-500 ${data.active ? 'text-orange-600' : 'text-slate-400'}`}>
        {icons[data.type] || icons.concept}
      </div>

      {/* Nama Aset */}
      <p className="mt-2 text-[10px] font-black uppercase tracking-tighter text-slate-700">
        {data.label}
      </p>

      {/* Titik Koneksi (Handle) disembunyikan kecuali diperlukan */}
      <Handle type="target" position={Position.Top} className="opacity-0 group-hover:opacity-100 !bg-orange-400" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover:opacity-100 !bg-orange-400" />
    </div>
  );
}
