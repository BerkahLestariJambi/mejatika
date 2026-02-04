// src/components/story-designer/BoardNode.tsx
'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function BoardNode({ data, selected }: any) {
  return (
    <div className={`
      relative transition-all duration-500
      ${data.active ? 'scale-110 z-40' : 'scale-100 opacity-80'}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* FRAME PAPAN TULIS */}
      <div className={`
        w-80 h-48 bg-[#1a3d2f] border-[12px] border-[#4a2e19] rounded-lg shadow-2xl
        flex flex-col p-4 overflow-hidden relative
        ${selected ? 'ring-4 ring-blue-400' : ''}
      `}>
        {/* TEKSTUR PAPAN TULIS (CHALK EFFECT) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-chalk.png')]" />
        
        {/* JUDUL MATERI (Hanya muncul jika diisi) */}
        <h4 className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em] mb-2 border-b border-white/10 pb-1">
          {data.label || 'Materi Papan Tulis'}
        </h4>

        {/* ISI TEKS PAPAN TULIS */}
        <div className="flex-grow flex items-center justify-center text-center">
          <p className="text-[#f1f5f9] font-['Chalkboard',_cursive] text-lg leading-tight drop-shadow-sm">
            {data.content || "Tulis materi di panel skenario..."}
          </p>
        </div>

        {/* KAPUR & PENGHAPUS (HIASAN) */}
        <div className="absolute bottom-2 right-4 flex gap-2">
          <div className="w-4 h-1 bg-white/80 rounded-full rotate-12" />
          <div className="w-6 h-2 bg-blue-200/50 rounded-sm" />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
