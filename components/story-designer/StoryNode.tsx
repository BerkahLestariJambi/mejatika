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

  return (
    <div className={`group relative p-5 rounded-3xl transition-all duration-700 flex flex-col items-center justify-center
      ${data.active 
        ? 'bg-orange-50 ring-[6px] ring-orange-500 scale-125 shadow-[0_0_40px_rgba(249,115,22,0.4)]' 
        : 'bg-white border-2 border-slate-100 shadow-md hover:border-orange-200'}`}
      style={{ width: isImageNode ? (data.width || 120) : 'auto', height: isImageNode ? (data.height || 120) : 'auto' }} // Atur ukuran untuk gambar
    >
      
      {/* Label Aksi saat Aktif */}
      {data.active && (
        <div className="absolute -top-10 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
          FOCUSING...
        </div>
      )}

      {/* Konten Utama: Gambar atau Icon */}
      {isImageNode && data.imageUrl ? (
        // Tampilkan gambar jika ini adalah node gambar dan ada URL
        <img 
          src={data.imageUrl} 
          alt={data.label} 
          className="max-w-full max-h-full object-contain rounded-md" 
          style={{ width: '100%', height: '100%' }} // Agar gambar mengisi area node
        />
      ) : (
        // Tampilkan ikon jika bukan node gambar atau tidak ada URL gambar
        <div className={`transition-colors duration-500 ${data.active ? 'text-orange-600' : 'text-slate-400'}`}>
          {icons[data.type] || icons.concept}
        </div>
      )}

      {/* Nama Aset */}
      {!isImageNode && ( // Label hanya untuk non-gambar
        <p className="mt-2 text-[10px] font-black uppercase tracking-tighter text-slate-700">
          {data.label}
        </p>
      )}

      {/* Handle (Titik Koneksi) disembunyikan kecuali diperlukan */}
      <Handle type="target" position={Position.Top} className="opacity-0 group-hover:opacity-100 !bg-orange-400" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover:opacity-100 !bg-orange-400" />
    </div>
  );
}
