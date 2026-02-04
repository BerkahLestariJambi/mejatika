// src/components/story-designer/AssetPanel.tsx
import React, { useRef } from 'react';
import { 
  Plus, Trash2, Layout, Play, Image as ImageIcon, 
  Users, Map as MapIcon, Sparkles, Monitor
} from 'lucide-react';

export default function AssetPanel({ 
  slides, 
  setSlides, 
  nodes, 
  onStart, 
  onAddImageNode, 
  onAddBoard // Pastikan props ini diterima dari page.tsx
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Preset Karakter
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
      name: 'Siswa', 
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger&clothingColor=3b82f6&baseColor=f5c1a1' 
    }
  ];

  // 2. Preset Background
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
    <div className="w-85 h-full bg-white border-r flex flex-col shadow-2xl z-[50]">
      <div className="p-6 bg-slate-900 text-white font-black italic">
        <h2 className="text-xl flex items-center gap-2 text-orange-500">
          <Sparkles className="animate-pulse" size={20} /> SANPIO ENGINE
        </h2>
        <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest text-orange-200 text-right">v2.0 Cinematic</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/30">
        
        {/* 1. OBJEK & KARAKTER */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            <Layout size={12}/> 1. Tambah Objek
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {/* Tombol Khusus Papan Tulis */}
            <button
              onClick={onAddBoard}
              className="flex items-center gap-3 p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 group border-b-4 border-emerald-900"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <Monitor size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-wider">Papan Tulis</p>
                <p className="text-[8px] opacity-70">Media Tulis Kapur</p>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {characterPresets.map((char) => (
                <button
                  key={char.name}
                  onClick={() => onAddImageNode(char.url, char.name)}
                  className="flex flex-col items-center gap-2 p-3 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-xl hover:border-orange-300 transition-all bg-white group"
                >
                  <img src={char.url} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" alt={char.name} />
                  <span className="text-[9px] font-black text-slate-600 uppercase">{char.name}</span>
                </button>
              ))}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-100 transition-all"
              >
                <ImageIcon size={20} className="text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase text-center">Upload Foto</span>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. LATAR BELAKANG */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            <MapIcon size={12}/> 2. Latar Belakang
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {backgroundPresets.map((bg) => (
              <button
                key={bg.id}
                onClick={() => changeBackground(bg.url)}
                className="flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all relative group"
              >
                <img src={bg.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={bg.name} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[7px] text-white font-bold">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 3. SKENARIO SCENE */}
        <section className="space-y-3 pb-20">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Skenario Animasi</h3>
          {slides.map((s: any, i: number) => (
            <div key={s.id} className="p-4 bg-white rounded-[24px] border border-slate-200 space-y-3 relative shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] rounded-full font-black italic">SCENE #{i+1}</span>
                <button onClick={() => setSlides(slides.filter((sl: any) => sl.id !== s.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>

              <input 
                placeholder="Judul Adegan..."
                className="w-full bg-slate-50 p-2 rounded-xl font-black text-[10px] outline-none text-slate-800 border border-slate-100 focus:border-orange-300"
                value={s.title} 
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, title: e.target.value} : sl))}
              />

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 ml-2 uppercase">Narasi / Teks Papan</label>
                <textarea 
                  placeholder="Ketik teks materi atau dialog..."
                  className="w-full bg-slate-50 p-3 rounded-2xl text-[10px] outline-none h-24 resize-none border border-slate-100 focus:border-orange-300 font-medium leading-relaxed"
                  value={s.desc}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, desc: newText} : sl));
                    
                    // UPDATE OTOMATIS: Jika targetnya adalah Papan Tulis, update konten papan tulisnya
                    const targetNode = nodes.find((n: any) => n.id === s.targetId);
                    if (targetNode?.type === 'boardNode') {
                      targetNode.data.content = newText;
                    }
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 ml-2 uppercase">Fokus Kamera Ke:</label>
                <select 
                  className="w-full text-[10px] p-3 rounded-xl bg-slate-900 text-white font-bold outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                  value={s.targetId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, targetId: selectedId} : sl));
                    
                    // Trigger update konten jika yang dipilih adalah papan
                    const targetNode = nodes.find((n: any) => n.id === selectedId);
                    if (targetNode?.type === 'boardNode') {
                      targetNode.data.content = s.desc;
                    }
                  }}
                >
                  <option value="">Pilih Aktor / Papan</option>
                  {nodes.map((n: any) => (
                    <option key={n.id} value={n.id}>
                      {n.type === 'boardNode' ? '📋 ' : '👤 '} {n.data.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          
          <button onClick={addSlide} className="group w-full py-6 border-2 border-dashed border-slate-300 rounded-[30px] flex flex-col items-center gap-2 hover:border-orange-500 hover:bg-orange-50/30 transition-all">
            <div className="p-2 bg-white rounded-full shadow-md group-hover:scale-110 transition-transform">
              <Plus className="text-orange-600" size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Tambah Adegan Film</span>
          </button>
        </section>
      </div>

      <div className="p-5 border-t bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => onStart(0)} 
          disabled={slides.length === 0}
          className="w-full py-5 bg-orange-600 text-white rounded-[26px] font-black text-xs flex items-center justify-center gap-3 hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <Play size={20} fill="currentColor"/> MULAI PRESENTASI ANIMASI
        </button>
      </div>
    </div>
  );
}
