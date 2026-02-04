// src/components/story-designer/AssetPanel.tsx
import React, { useRef } from 'react';
import { 
  Plus, Trash2, Layout, Play, Image as ImageIcon, 
  Users, Map as MapIcon, Sparkles 
} from 'lucide-react';

export default function AssetPanel({ slides, setSlides, nodes, onStart, onAddImageNode }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Preset Karakter (Otomatis Kartun & Lip-sync ready)
  const characterPresets = [
    { name: 'Pak Guru', url: 'https://illustrations.popsy.co/amber/teacher.svg' },
    { name: 'Bu Guru', url: 'https://illustrations.popsy.co/amber/woman-teaching.svg' },
    { name: 'Siswa Kelompok', url: 'https://illustrations.popsy.co/amber/student-with-laptop.svg' }
  ];

  // 2. Preset Background Scene
  const backgroundPresets = [
    { id: 'classroom', name: 'Ruang Kelas', url: 'https://img.freepik.com/free-vector/empty-classroom-interior-with-chalkboard_1308-65378.jpg' },
    { id: 'park', name: 'Taman Sekolah', url: 'https://img.freepik.com/free-vector/nature-scene-with-park-landscape-background_1308-68345.jpg' },
    { id: 'lab', name: 'Laboratorium', url: 'https://img.freepik.com/free-vector/science-lab-interior-with-furniture-equipment_1308-54316.jpg' }
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
    // Fungsi ini memanggil state setBgImage yang ada di page.tsx via window object
    if ((window as any).setBackground) {
      (window as any).setBackground(url);
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-2xl z-[50]">
      {/* HEADER */}
      <div className="p-6 bg-slate-900 text-white font-black italic">
        <h2 className="text-xl flex items-center gap-2 text-orange-500">
          <Sparkles className="animate-pulse" /> ANIMATOR
        </h2>
        <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest text-orange-200">
          Mejatika Cinematic Engine
        </p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* 1. KARAKTER PRESET */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
            <Users size={12}/> 1. Karakter Film
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {characterPresets.map((char) => (
              <button
                key={char.name}
                onClick={() => onAddImageNode(char.url, char.name)}
                className="flex items-center gap-3 p-2 border border-slate-100 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all text-left group"
              >
                <img src={char.url} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">{char.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. BACKGROUND SCENE */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
            <MapIcon size={12}/> 2. Latar Belakang
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {backgroundPresets.map((bg) => (
              <button
                key={bg.id}
                onClick={() => changeBackground(bg.url)}
                className="flex items-center gap-3 p-2 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
              >
                <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={bg.url} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 uppercase">{bg.name}</span>
              </button>
            ))}
            <button 
              onClick={() => changeBackground('')}
              className="text-[8px] font-bold text-slate-400 hover:text-red-500 text-center py-1 uppercase tracking-tighter"
            >
              Hapus Background (Polos)
            </button>
          </div>
        </section>

        {/* 3. UPLOAD CUSTOM */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 italic">3. Impor Aset Luar</h3>
          <div 
            className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" size={20}/>
            <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-600 uppercase">Upload Gambar Kartun</span>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </section>

        {/* 4. ALUR FILM (SLIDE) */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase">4. Skenario & Dialog</h3>
          {slides.map((s: any, i: number) => (
            <div key={s.id} className="p-4 bg-white rounded-[24px] border-2 border-slate-100 space-y-2 relative shadow-sm hover:border-orange-200 transition-all">
              <span className="absolute -left-2 -top-2 w-6 h-6 bg-slate-900 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg">
                {i+1}
              </span>
              <input 
                placeholder="Judul Scene..."
                className="w-full bg-transparent font-black text-xs outline-none text-slate-800"
                value={s.title} 
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, title: e.target.value} : sl))}
              />
              <textarea 
                placeholder="Tulis apa yang akan diucapkan karakter..."
                className="w-full bg-slate-50 p-3 rounded-2xl text-[10px] outline-none h-24 resize-none border border-transparent focus:border-orange-100 leading-relaxed"
                value={s.desc}
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, desc: e.target.value} : sl))}
              />
              <div className="flex items-center gap-2">
                <select 
                  className="flex-grow text-[9px] p-2 rounded-xl bg-slate-100 border-none font-bold outline-none cursor-pointer"
                  value={s.targetId}
                  onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, targetId: e.target.value} : sl))}
                >
                  <option value="">Pilih Aktor...</option>
                  {nodes.map((n: any) => (
                    <option key={n.id} value={n.id}>{n.data.label || 'Karakter'}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setSlides(slides.filter((sl: any) => sl.id !== s.id))} 
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={addSlide} 
            className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95"
          >
            + TAMBAH SCENE BARU
          </button>
        </section>
      </div>

      {/* FOOTER ACTION */}
      <div className="p-4 border-t bg-slate-50">
        <button 
          onClick={() => onStart(0)} 
          disabled={slides.length === 0}
          className="w-full py-5 bg-orange-600 text-white rounded-[28px] font-black text-xs flex items-center justify-center gap-3 hover:bg-orange-700 shadow-[0_12px_24px_rgba(234,88,12,0.3)] transition-all active:translate-y-1"
        >
          <Play size={20} fill="currentColor"/> PUTAR FILM ANIMASI
        </button>
      </div>
    </div>
  );
}
