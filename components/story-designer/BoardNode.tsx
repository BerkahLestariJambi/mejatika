// src/components/story-designer/BoardNode.tsx
'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typewriter } from 'react-simple-typewriter';

export default function BoardNode({ data, selected }: any) {
  return (
    <div className={`transition-all duration-700 ${data.active ? 'scale-110 z-40' : 'opacity-50'}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="w-[550px] h-[320px] bg-[#1a3d2f] border-[12px] border-[#4a2e19] rounded-xl shadow-2xl p-8 flex flex-col">
        <div className="border-b border-white/20 pb-2 mb-4">
          <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Slide Materi</span>
        </div>
        
        <div className="flex-grow text-[#f1f5f9] font-serif text-3xl leading-relaxed">
          {data.active ? (
            <Typewriter words={[data.content || ""]} loop={1} typeSpeed={40} cursor />
          ) : (
            <span className="opacity-30">{data.content}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
