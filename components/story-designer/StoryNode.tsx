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
  // Tambahkan ikon default untuk gambar jika diperlukan
  image: <ImageIcon size={32} /> // Ikon placeholder jika gambar belum diupload/error
};

export default function StoryNode({ data }: any) {
  const isImageNode = data.type === 'image';

// Modifikasi bagian return di StoryNode.tsx
return (
  <div className={`
    relative p-4 rounded-2xl transition-all duration-1000
    ${data.active 
      ? 'scale-125 shadow-2xl ring-4 ring-orange-500 bg-white animate-bounce-slow' 
      : 'opacity-40 grayscale scale-100'} 
  `}>
    {/* Konten Gambar/Ikon */}
    {isImageNode ? (
       <img src={data.imageUrl} className="w-32 h-32 object-contain" />
    ) : (
       <div className="p-4">{icons[data.type]}</div>
    )}
  </div>
);
