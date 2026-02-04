// src/components/story-designer/AssetPanel.tsx
import React, { useRef } from 'react';
import { Plus, Trash2, Layout, Type, MousePointer2, BookOpen, Star, Play, Image as ImageIcon, Users } from 'lucide-react';

export default function AssetPanel({ slides, setSlides, nodes, onStart, onAddImageNode }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Karakter Langsung (Otomatis Jadi Kartun)
  const characterPresets = [
    { name: 'Pak Guru', url: 'https://illustrations.popsy.co/amber/teacher.svg' },
    { name: 'Bu Guru', url: 'https://illustrations.popsy.co/amber/woman-teaching.svg' },
    { name: 'Siswa Kelompok', url: 'https://illustrations.popsy.co/amber/student-with-laptop.svg' }
  ];

  const addSlide = () => {
    setSlides([...slides, { id: `s_${Date.now()}`, title: "Scene Baru", desc: "", targetId: "" }]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Parameter ketiga 'true' menandakan ini adalah mode kartun (tanpa frame)
        onAddImageNode(reader.result as string, file.name.split('.')[0]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-2xl z-[50]">
      <div className="p-6 bg-slate-900 text-white font-black italic">
        <h2 className="text-xl flex items-center gap-2 text-orange-500"><Layout /> ANIMATOR</h2>
        <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest text-orange-200">Mejatika Story Engine</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* 1. KARTUN PRESET (PAK GURU, BU GURU, SISWA) */}
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

        {/* 2. UPLOAD CUSTOM */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3">2. Upload Aset Sendiri</h3>
          <div 
            className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="text-blue-500 mb-2" size={24}/>
            <span className="text-[9px] font-black text-blue-600 uppercase">Impor Gambar/Kartun</span>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </section>

        {/* 3. ALUR FILM (SLIDE) */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase">3. Skenario Film</h3>
          {slides.map((s: any, i: number) => (
            <div key={s.id} className="p-4 bg-white rounded-3xl border-2 border-slate-100 space-y-2 relative shadow-sm hover:border-orange-200 transition-all">
              <span className="absolute -left-2 -top-2 w-6 h-6 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg">#{i+1}</span>
              <input 
                placeholder="Judul Scene..."
                className="w-full bg-transparent font-black text-xs outline-none text-slate-800"
                value={s.title} 
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, title: e.target.value} : sl))}
              />
              <textarea 
                placeholder="Tulis naskah bicara di sini..."
                className="w-full bg-slate-50 p-2 rounded-xl text-[10px] outline-none h-20 resize-none border border-transparent focus:border-orange-200"
                value={s.desc}
                onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, desc: e.target.value} : sl))}
              />
              <div className="flex items-center gap-2">
                <select 
                  className="flex-grow text-[9px] p-2 rounded-xl bg-slate-100 border-none font-bold outline-none"
                  value={s.targetId}
                  onChange={(e) => setSlides(slides.map((sl: any) => sl.id === s.id ? {...sl, targetId: e.target.value} : sl))}
                >
                  <option value="">Siapa yang bicara?</option>
                  {nodes.map((n: any) => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                </select>
                <button onClick={() => setSlides(slides.filter((sl: any) => sl.id !== s.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button onClick={addSlide} className="w-full py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-all">
            + TAMBAH SCENE BARU
          </button>
        </section>
      </div>

      <div className="p-4 border-t bg-white">
        <button onClick={() => onStart(0)} disabled={slides.length === 0}
          className="w-full py-4 bg-orange-600 text-white rounded-[24px] font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-700 shadow-[0_10px_20px_rgba(234,88,12,0.3)] transition-all active:scale-95">
          <Play size={18} fill="currentColor"/> PUTAR FILM ANIMASI
        </button>
      </div>
    </div>
  );
}
