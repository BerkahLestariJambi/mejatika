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
    <div className="relative flex flex-col items-center">
      {/* --- SPEECH BUBBLE (Efek Berbicara) --- */}
      {data.active && (
        <div className="absolute -top-20 z-[60] animate-bounce-subtle">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-2xl shadow-2xl relative border border-white/20 whitespace-nowrap">
            <span className="flex gap-1 items-center">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
              BERBICARA...
            </span>
            {/* Ekor Balon */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/20" />
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className={`
        relative p-4 rounded-3xl transition-all duration-1000 flex items-center justify-center
        ${data.active 
          ? 'scale-150 z-50 shadow-[0_30px_60px_rgba(249,115,22,0.4)] ring-4 ring-orange-500 bg-white animate-talk' 
          : 'opacity-40 grayscale scale-100 bg-white/50 border border-slate-200'} 
      `}>
        <Handle type="target" position={Position.Top} className="opacity-0" />

        <div className="relative overflow-hidden rounded-xl">
          {isImageNode && data.imageUrl ? (
            <img 
              src={data.imageUrl} 
              alt="Asset" 
              className="w-32 h-32 object-cover" 
            />
          ) : (
            <div className={`p-4 ${data.active ? 'text-orange-600' : 'text-slate-400'}`}>
              {icons[data.type] || icons.concept}
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>

      {/* --- LABEL --- */}
      {data.label && (
        <p className={`mt-6 text-[10px] font-black transition-all duration-500 tracking-widest uppercase
          ${data.active ? 'opacity-100 text-orange-600 translate-y-2' : 'opacity-40 text-slate-500'}`}>
          {data.label}
        </p>
      )}
    </div>
  );
}
