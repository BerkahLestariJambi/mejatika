// src/components/story-designer/StoryNode.tsx
import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function StoryNode({ data }: any) {
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  // Efek Animasi Mulut: Jika node 'active' (sedang bicara), ganti status mulut secara cepat
  useEffect(() => {
    let interval: any;
    if (data.active) {
      interval = setInterval(() => {
        setIsMouthOpen(prev => !prev);
      }, 150); // Kecepatan buka tutup mulut
    } else {
      setIsMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [data.active]);

  return (
    <div className="relative flex flex-col items-center">
      {/* FRAME KARAKTER */}
      <div className={`relative transition-all duration-500 ${data.active ? 'scale-125' : 'opacity-50 grayscale'}`}>
        
        {/* GAMBAR TUBUH/BASE */}
        <img 
          src={data.imageUrl} 
          className="w-40 h-40 object-contain transition-transform"
          style={{ transform: isMouthOpen && data.active ? 'scaleY(1.02)' : 'scaleY(1)' }}
        />

        {/* OVERLAY MULUT (Hanya muncul saat active) */}
        {data.active && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Logika visual: Lingkaran kecil sebagai mulut yang buka tutup */}
            <div 
              className={`bg-black rounded-full transition-all duration-100 ${
                isMouthOpen ? 'w-4 h-3 mt-8' : 'w-4 h-0.5 mt-8'
              }`} 
              style={{ opacity: 0.8 }}
            />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
