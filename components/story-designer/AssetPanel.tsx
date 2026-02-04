// src/components/story-designer/AssetPanel.tsx
import React, { useRef } from 'react';
import { 
  Plus, Trash2, Layout, Play, Image as ImageIcon, 
  Users, Map as MapIcon, Sparkles 
} from 'lucide-react';

export default function AssetPanel({ slides, setSlides, nodes, onStart, onAddImageNode }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Preset Karakter Menggunakan DiceBear (Avatar Kartun yang Stabil)
  const characterPresets = [
    { 
      name: 'Pak Guru', 
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&eyebrows=defaultNatural&mouth=smile&baseColor=f5c1a1' 
    },
    { 
      name: 'Bu Guru', 
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&clothingColor=f59e0b&mouth=smile&baseColor=f5c1a1' 
    },
    { 
      name: 'Siswa Kelompok', 
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger&clothingColor=3b82f6&baseColor=f5c1a1' 
    }
  ];

  // 2. Preset Background Scene (Unsplash)
  const backgroundPresets = [
    { 
      id: 'classroom', 
      name: 'Ruang Kelas', 
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 'park', 
      name: 'Taman Sekolah', 
      url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 'lab', 
      name: 'Laboratorium', 
      url: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=800&auto=format&fit=crop' 
    }
  ];

  const addSlide = () => {
    setSlides([...slides, { id: `s_${Date.now()}`, title: "Scene Baru", desc: "", targetId: "" }]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImageNode(reader.result as string, file.name.split('.')[0]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const changeBackground = (url: string) => {
    if ((window as any).setBackground) {
      (window as any).setBackground(url);
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-2xl z-[50]">
      <div className="p-6 bg-slate-900 text-white font-black italic">
        <h2 className="text-xl flex items-center gap-2 text-orange-500">
          <Sparkles className="animate-pulse" /> ANIMATOR
        </h2>
        <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest text-orange-200">Mejatika Story Engine</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* 1. KARAKTER FILM */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            <Users size={12}/> 1. Karakter Film
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {characterPresets.map((char) => (
              <button
                key={char.name}
                onClick={() => onAddImageNode(char.url, char.name)}
                className="flex items-center gap-3 p-2 border border-slate-100 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all text-left group bg-white shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                   <img src={char.url} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={char.name} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase">{char.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. LATAR BELAKANG */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            <MapIcon size={12}/> 2. Latar Belakang
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {backgroundPresets.map((bg) => (
              <button
                key={bg.id}
                onClick={() => changeBackground(bg.url)}
                className="flex items-center gap-3 p-2 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group bg-white shadow-sm"
              >
                <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                  <img src={bg.url} className="w-full h-full object-cover" alt={bg.name} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 uppercase">{bg.name}</span>
              </button>
            ))}
            <button 
              onClick={() => changeBackground('')}
              className="text-[8px] font-bold text-slate-400 hover:text-red-500 py-1 uppercase text-center w-full"
            >
              Hapus Latar
            </button>
          </div>
        </section>

        {/* 3. SKENARIO SCENE */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Skenario Film</h3>
          {slides.map((s: any, i: number) => (
            <div key={s.id} className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 space-y-2 relative shadow-inner">
              <span className="absolute -left-2 -top-2 w-6 h-6 bg-orange-600 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg">#{i+1}</span>
              <input 
                placeholder="Judul..."
                className="w-full bg-transparent font-black text-xs outline-none text-slate-800"
                value={s.title} 
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, title: e.target.value} : sl))}
              />
              <textarea 
                placeholder="Dialog karakter..."
                className="w-full bg-white p-3 rounded-2xl text-[10px] outline-none h-20 resize-none border border-slate-100"
                value={s.desc}
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, desc: e.target.value} : sl))}
              />
              <div className="flex items-center gap-2">
                <select 
                  className="flex-grow text-[9px] p-2 rounded-xl bg-white border border-slate-100 font-bold outline-none"
                  value={s.targetId}
                  onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, targetId: e.target.value} : sl))}
                >
                  <option value="">Siapa Bicara?</option>
                  {nodes.map((n: any) => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                </select>
                <button onClick={() => setSlides(slides.filter((sl: any) => sl.id !== s.id))} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button onClick={addSlide} className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-all">
            + TAMBAH SCENE BARU
          </button>
        </section>
      </div>

      <div className="p-4 border-t bg-white">
        <button onClick={() => onStart(0)} disabled={slides.length === 0}
          className="w-full py-5 bg-orange-600 text-white rounded-[24px] font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all active:scale-95">
          <Play size={18} fill="currentColor"/> PUTAR FILM ANIMASI
        </button>
      </div>
    </div>
  );
}
