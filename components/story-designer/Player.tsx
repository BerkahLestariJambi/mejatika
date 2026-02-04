// src/components/story-designer/Player.tsx
export default function Player({ activeSlide, onNext, onBack, onExit }: any) {
  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Area Atas (Kosong agar Flow terlihat) */}
      <div className="flex-grow" />

      {/* PANEL PUTIH BAWAH (SLIDE STYLE) */}
      <div className="h-40 bg-white/95 backdrop-blur-md border-t-4 border-orange-500 p-8 flex items-center justify-between pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        
        <div className="flex-grow max-w-4xl">
          <h3 className="text-orange-600 font-black text-sm uppercase tracking-tighter mb-1">
            {activeSlide.title || "Penjelasan"}
          </h3>
          <p className="text-slate-800 text-xl font-medium leading-tight">
            {activeSlide.desc}
          </p>
        </div>

        {/* KONTROL SLIDE */}
        <div className="flex gap-4 ml-8">
          <button onClick={onBack} className="p-4 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
            ⬅️
          </button>
          <button onClick={onNext} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
            NEXT SLIDE
          </button>
          <button onClick={onExit} className="p-4 text-slate-400 hover:text-red-500 transition-all">
            ✖
          </button>
        </div>
      </div>
    </div>
  );
}
