// src/components/story-designer/StoryNode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function StoryNode({ data }: any) {
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  // Efek Animasi Mulut: Sinkron dengan status 'active' dari Player
  useEffect(() => {
    let interval: any;
    if (data.active) {
      // Kecepatan buka tutup mulut (150ms) untuk simulasi bicara
      interval = setInterval(() => {
        setIsMouthOpen(prev => !prev);
      }, 150);
    } else {
      setIsMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [data.active]);

  return (
    <div className="relative flex flex-col items-center group">
      {/* WAJIB: Handle React Flow (Disembunyikan) */}
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* FRAME KARAKTER KARTUN */}
      <div className={`
        relative transition-all duration-700 ease-in-out
        ${data.active 
          ? 'scale-150 z-50 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]' 
          : 'opacity-40 grayscale blur-[0.5px] scale-100'}
      `}>
        
        {/* GAMBAR TUBUH KARTUN */}
        <div className={`relative ${data.active ? 'animate-bounce-subtle' : ''}`}>
          {data.imageUrl ? (
            <img 
              src={data.imageUrl} 
              alt={data.label}
              className="w-44 h-44 object-contain"
              // Efek badan sedikit memanjang saat bicara (squash and stretch)
              style={{ 
                transform: isMouthOpen && data.active ? 'scaleY(1.03)' : 'scaleY(1)' 
              }}
            />
          ) : (
            <div className="w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-400">NO IMAGE</span>
            </div>
          )}

          {/* OVERLAY MULUT ANIMASI (Hanya muncul saat bicara) */}
          {data.active && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Posisi mulut disesuaikan secara umum (mt-10), 
                  bisa diatur manual per karakter jika perlu */}
              <div 
                className={`
                  bg-[#331a00] rounded-full transition-all duration-100 ease-in-out shadow-inner
                  ${isMouthOpen ? 'w-5 h-4 mt-12' : 'w-4 h-1 mt-12'}
                `} 
                style={{ opacity: 0.9 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* LABEL NAMA (Hanya muncul saat hover di mode editor) */}
      <div className={`
        mt-4 px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-full tracking-widest
        transition-opacity duration-300 pointer-events-none
        ${data.active ? 'opacity-100 shadow-lg' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {data.label || 'Karakter'}
      </div>

      {/* WAJIB: Handle React Flow (Disembunyikan) */}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {/* STYLE KHUSUS ANIMASI BADAN */}
      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
