// src/components/story-designer/AssetPanel.tsx
import React, { useRef } from 'react'; // Import useRef
import { Plus, Trash2, Layout, Type, MousePointer2, BookOpen, Star, Play, Image as ImageIcon } from 'lucide-react';

export default function AssetPanel({ slides, setSlides, nodes, onStart, onAddImageNode }: any) { // Tambahkan onAddImageNode
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file
  
  const addSlide = () => {
    setSlides([...slides, { id: `s_${Date.now()}`, title: "Slide Baru", desc: "", targetId: "" }]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Panggil fungsi onAddImageNode dari parent (page.tsx)
        onAddImageNode(reader.result as string, file.name.split('.')[0]); 
      };
      reader.readAsDataURL(file);
    }
    // Reset input file agar bisa upload gambar yang sama lagi jika diperlukan
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-2xl z-[50]">
      <div className="p-6 bg-slate-900 text-white font-black italic">
        <h2 className="text-xl flex items-center gap-2 text-orange-500"><Layout /> DESIGNER</h2>
        <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest">Story & Lesson Builder</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* ASSET LIBRARY */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3">1. Library Aset</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'text', icon: <Type size={20}/> },
              { type: 'pointer', icon: <MousePointer2 size={20}/> },
              { type: 'concept', icon: <BookOpen size={20}/> },
              { type: 'important', icon: <Star size={20}/> }
            ].map(item => (
              <div key={item.type} draggable onDragStart={(e) => e.dataTransfer.setData('assetType', item.type)}
                className="p-3 border rounded-xl flex flex-col items-center bg-white cursor-grab hover:bg-orange-50 transition-colors">
                <div className="text-slate-600">{item.icon}</div>
                <span className="text-[9px] font-bold uppercase mt-1">{item.type}</span>
              </div>
            ))}
             {/* Tombol Upload Gambar */}
            <div 
              className="p-3 border rounded-xl flex flex-col items-center bg-white cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => fileInputRef.current?.click()} // Klik input file tersembunyi
            >
              <div className="text-blue-600"><ImageIcon size={20}/></div>
              <span className="text-[9px] font-bold uppercase mt-1">GAMBAR</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>
        </section>

        {/* SLIDE MANAGER */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase">2. Alur Penjelasan</h3>
          {slides.map((s: any, i: number) => (
            <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative shadow-sm">
              <span className="absolute -left-2 top-4 w-6 h-6 bg-slate-900 text-white text-[10px] rounded-full flex items-center justify-center font-bold">#{i+1}</span>
              <input 
                className="w-full bg-transparent font-black text-xs outline-none text-slate-800"
                value={s.title} 
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, title: e.target.value} : sl))}
              />
              <textarea 
                placeholder="Penjelasan..."
                className="w-full bg-transparent text-[10px] outline-none h-16 resize-none"
                value={s.desc}
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, desc: e.target.value} : sl))}
              />
              <select 
                className="w-full text-[9px] p-2 rounded-lg bg-white border outline-none"
                value={s.targetId}
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, targetId: e.target.value} : sl))}
              >
                <option value="">Fokus ke Aset...</option>
                {nodes.map((n: any) => <option key={n.id} value={n.id}>{n.data.label}</option>)}
              </select>
              <button onClick={() => setSlides(slides.filter((sl: any) => sl.id !== s.id))} className="text-red-400 hover:text-red-600 pt-2"><Trash2 size={14}/></button>
            </div>
          ))}
          <button onClick={addSlide} className="w-full py-3 border-2 border-dashed rounded-xl text-[10px] font-black text-slate-400 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2">
            <Plus size={16}/> TAMBAH MATERI
          </button>
        </section>
      </div>

      <div className="p-4 border-t bg-slate-50">
        <button onClick={() => onStart(0)} disabled={slides.length === 0}
          className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50 shadow-lg">
          <Play size={16} fill="currentColor"/> MULAI PRESENTASI
        </button>
      </div>
    </div>
  );
}
