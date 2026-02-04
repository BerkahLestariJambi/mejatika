// src/components/story-designer/StoryNode.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

type MouthState = 'closed' | 'half' | 'open';

export default function StoryNode({ data, selected }: any) {
  const [mouthState, setMouthState] = useState<MouthState>('closed');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Efek Animasi Mulut: Sinkron dengan status 'active' dari Player
  useEffect(() => {
    if (data.active) {
      intervalRef.current = setInterval(() => {
        setMouthState(prev =>
          prev === 'closed' ? 'half' : prev === 'half' ? 'open' : 'closed'
        );
      }, 180);
    } else {
      setMouthState('closed');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data.active]);

  // Fungsi untuk mengatur fokus lokasi mulut secara dinamis
  const handleSetMouthFocus = (e: React.MouseEvent) => {
    if (data.active) return; // Nonaktifkan saat sedang presentasi
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (data.onUpdateMouth) data.onUpdateMouth(x, y);
  };

  return (
    <div className="relative flex flex-col items-center group">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* FRAME KARAKTER */}
      <div
        onClick={handleSetMouthFocus}
        className={`relative transition-all duration-700 ease-in-out cursor-crosshair
          ${data.active ? 'scale-150 z-50 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]' : 'opacity-40 grayscale blur-[0.5px] scale-100'}
          ${selected && !data.active ? 'ring-2 ring-orange-500 ring-offset-4 rounded-xl bg-orange-50/50' : ''}
        `}
      >
        <div className={`relative ${data.active ? 'animate-bounce-subtle' : ''}`}>
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.label}
              className="w-44 h-44 object-contain pointer-events-none select-none"
            />
          ) : (
            <div className="w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-400">NO IMAGE</span>
            </div>
          )}

          {/* MULUT DINAMIS */}
          {data.active && (
            <div
              className={`absolute bg-[#331a00] rounded-full transition-all duration-100 ease-in-out shadow-inner pointer-events-none`}
              style={{
                opacity: 0.9,
                left: `${data.mouthX || 50}%`,
                top: `${data.mouthY || 62}%`,
                transform: 'translate(-50%, -50%)',
                width: mouthState === 'open' ? '22px' : mouthState === 'half' ? '18px' : '14px',
                height: mouthState === 'open' ? '14px' : mouthState === 'half' ? '8px' : '4px',
              }}
            />
          )}

          {/* INDIKATOR TARGET */}
          {selected && !data.active && (
            <div
              className="absolute w-4 h-4 border-2 border-orange-500 rounded-full flex items-center justify-center animate-ping"
              style={{
                left: `${data.mouthX || 50}%`,
                top: `${data.mouthY || 62}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* LABEL */}
      <div
        className={`mt-4 px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-full tracking-widest
          transition-opacity duration-300 pointer-events-none flex flex-col items-center gap-1
          ${data.active || selected ? 'opacity-100 shadow-lg' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        <span>{data.label || 'Karakter'}</span>
        {selected && !data.active && (
          <span className="text-[6px] text-orange-400 lowercase italic">
            Klik pada gambar untuk geser posisi mulut
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
