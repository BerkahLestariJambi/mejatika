// src/components/story-designer/StoryNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, MessageSquare, MousePointer2, BookOpen, Star, Image as ImageIcon } from 'lucide-react';

const icons: any = {
  text: <Type size={32} />,
  bubble: <MessageSquare size={32} />,
  pointer: <MousePointer2 size={32} />,
  concept: <BookOpen size={32} />,
  important: <Star size={32} />,
  image: <ImageIcon size={32} />
};

export default function StoryNode({ data }: any) {
  const isImageNode = data.type === 'image';

  return (
    <div className={`
      relative p-4 rounded-2xl transition-all duration-1000 flex items-center justify-center
      ${data.active 
        ? 'scale-150 z-50 shadow-[0_20px_50px_rgba(249,115,22,0.3)] ring-4 ring-orange-500 bg-white' 
        : 'opacity-40 grayscale scale-100 bg-white/50 border border-slate-200'} 
    `}>
      
      {/* WAJIB: Handle React Flow (disembunyikan tapi harus ada) */}
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* Konten Utama */}
      <div className={`${data.active ? 'animate-pulse' : ''}`}>
        {isImageNode && data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt="Asset" 
            className="w-32 h-32 object-contain rounded-lg" 
          />
        ) : (
          <div className={`p-4 ${data.active ? 'text-orange-600' : 'text-slate-400'}`}>
            {icons[data.type] || icons.concept}
          </div>
        )}
      </div>

      {/* Label Keterangan (Opsional) */}
      {data.label && !isImageNode && (
        <p className="absolute -bottom-8 text-[10px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-tighter">
          {data.label}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
