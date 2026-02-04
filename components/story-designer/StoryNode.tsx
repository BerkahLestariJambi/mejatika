// src/components/story-designer/StoryNode.tsx
'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Handle, Position } from '@xyflow/react';

const StoryNode = forwardRef(({ data, selected }: any, ref) => {
  const [mouthScale, setMouthScale] = useState({ w: 4, h: 1 });
  const [isTalking, setIsTalking] = useState(false);

  // Expose fungsi bicara ke parent (Player/Page)
  useImperativeHandle(ref, () => ({
    speak(duration: number) {
      setIsTalking(true);
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          // Simulasi fonem: mulut berubah bentuk secara acak tapi cepat
          const shapes = [
            { w: 5, h: 4 }, // fonem A/O
            { w: 3, h: 2 }, // fonem I/E
            { w: 4, h: 5 }, // fonem U
            { w: 4, h: 1 }  // fonem M/P/B (tutup)
          ];
          const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          setMouthScale(randomShape);
          requestAnimationFrame(() => setTimeout(animate, 80)); // Kecepatan fonem
        } else {
          setIsTalking(false);
          setMouthScale({ w: 4, h: 1 });
        }
      };
      animate();
    }
  }));

  return (
    <div className="relative flex flex-col items-center group">
      <div className={`relative transition-all duration-700 ${data.active ? 'scale-150 z-50' : 'opacity-40 grayscale'}`}>
        <img src={data.imageUrl} className="w-44 h-44 object-contain" />
        
        {/* MULUT REALISTIS DENGAN PHONEME SHAPES */}
        {data.active && (
          <div 
            className="absolute bg-[#2d1b0d] rounded-full transition-all duration-75 ease-in-out border-t border-black/20"
            style={{ 
              opacity: 0.9,
              left: `${data.mouthX || 50}%`,
              top: `${data.mouthY || 62}%`,
              width: `${mouthScale.w * 3}px`,
              height: `${mouthScale.h * 3}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Detail bibir dalam */}
            <div className="w-full h-[1px] bg-red-400/20 mt-1 mx-auto rounded-full" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

export default StoryNode;
