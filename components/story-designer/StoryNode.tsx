// src/components/story-designer/StoryNode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function StoryNode({ data, selected }: any) {
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (data.active) {
      setIsWalking(true);
    } else {
      setIsWalking(false);
    }
  }, [data.active]);

  return (
    <div className="relative flex flex-col items-center group">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className={`
        relative transition-all duration-[1000ms] ease-in-out
        ${data.active 
          ? 'scale-125 z-50 -translate-x-[250px]' // Geser ke kiri saat aktif
          : 'opacity-40 grayscale scale-100'}
      `}>
        <div className={isWalking ? 'animate-bounce-subtle' : ''}>
          <img 
            src={data.imageUrl} 
            className="w-52 h-52 object-contain drop-shadow-2xl"
            alt={data.label}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
