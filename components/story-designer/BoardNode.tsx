// src/components/story-designer/BoardNode.tsx
'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typewriter } from 'react-simple-typewriter';

export default function BoardNode({ data, selected }: any) {
  return (
    <div className={`
      relative transition-all duration-500
      ${data.active ? 'scale-110 z-40' : 'scale-100 opacity-80'}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* FRAME PAPAN TULIS CINEMATIC */}
      <div className={`
        w-[450px] h-[280px] bg-[#1a3d2f] border-[15px] border-[#4a2e19] rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]
        flex flex-col p-8 overflow-hidden relative border-double
        ${selected ? 'ring-4 ring-blue-400' : ''}
      `}>
        {/* TEKSTUR PAPAN TULIS */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-chalk.png')]" />
        
        {/* HEADER PAPAN */}
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2 z-10">
          <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
            {data.label || 'Materi Pelajaran'}
          </h4>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-900/40" />
            <div className="w-2 h-2 rounded-full bg-yellow-900/40" />
          </div>
        </div>

        {/* AREA PENULISAN (DENGAN EFEK TYPEWRITER) */}
        <div className="flex-grow flex items-start justify-start text-left z-10">
          <div className="text-[#f8fafc] font-['Chalkboard',_cursive] text-2xl leading-relaxed drop-shadow-md w-full">
            {data.active ? (
              <Typewriter
                words={[data.content || "Mulai menulis materi..."]}
                loop={1}
                cursor
                cursorStyle='|'
                typeSpeed={50}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            ) : (
              <span className="opacity-50">{data.content || "Papan Tulis Ready"}</span>
            )}
          </div>
        </div>

        {/* HIASAN KAPUR DI BAWAH PAPAN */}
        <div className="absolute bottom-3 right-6 flex items-end gap-3 z-10">
          <div className="w-8 h-2 bg-white/90 rounded-sm shadow-sm rotate-[-5deg]" /> {/* Kapur Putih */}
          <div className="w-6 h-2 bg-blue-200/80 rounded-sm shadow-sm rotate-[12deg]" /> {/* Kapur Biru */}
          <div className="w-10 h-4 bg-slate-800 rounded-md border border-slate-700 shadow-inner flex items-center justify-center">
             <div className="w-full h-1 bg-slate-600 rounded-full mx-1" />
          </div> {/* Penghapus */}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      
      {/* STYLE UNTUK FONT TULISAN TANGAN */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Short+Stack&display=swap');
        .font-chalk {
          font-family: 'Short Stack', cursive;
        }
      `}</style>
    </div>
  );
}
