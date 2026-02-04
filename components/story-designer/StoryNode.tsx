// src/components/story-designer/StoryNode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function StoryNode({ data, selected }: any) {
  // Efek berjalan: karakter akan bergeser sedikit ke kiri/kanan secara acak saat aktif
  const [walkPos, setWalkPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let interval: any;
    if (data.active) {
      // Setiap 3 detik, guru akan "berjalan" ke titik baru di sekitar posisinya
      interval = setInterval(() => {
        setWalkPos({
          x: (Math.random() - 0.5) * 100, // Geser horizontal -50px sampai 50px
          y: (Math.random() - 0.5) * 30,  // Geser vertikal sedikit agar natural
        });
      }, 3000);
    } else {
      setWalkPos({ x: 0, y: 0 });
    }
    return () => clearInterval(interval);
  }, [data.active]);

  return (
    <div className="relative flex flex-col items-center group">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className={`
        relative transition-all duration-[3000ms] ease-in-out
        ${data.active ? 'scale-150 z-50' : 'opacity-40 grayscale blur-[0.5px] scale-100'}
      `}
      style={{
        // Logika berpindah tempat (berjalan)
        transform: `translate(${walkPos.x}px, ${walkPos.y}px) ${data.active ? 'scale(1.5)' : 'scale(1)'}`
      }}>
        
        <div className={`relative ${data.active ? 'animate-walking' : ''}`}>
          {data.imageUrl ? (
            <img 
              src={data.imageUrl} 
              className="w-44 h-44 object-contain drop-shadow-2xl"
              alt={data.label}
            />
          ) : (
            <div className="w-40 h-40 bg-slate-200 rounded-full" />
          )}
        </div>
      </div>

      {/* Label Nama */}
      <div className={`mt-4 px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-full transition-opacity
        ${data.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {/* Animasi Goyang Saat Berjalan */}
      <style jsx>{`
        @keyframes walking {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg) translateY(-5px); }
        }
        .animate-walking {
          animation: walking 0.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
