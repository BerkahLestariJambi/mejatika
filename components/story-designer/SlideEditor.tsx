import React from 'react';
import { Trash2, Type, AlignLeft, Target } from 'lucide-react';

export default function SlideEditor({ slides, updateSlide, removeSlide, nodes }: any) {
  return (
    <div className="space-y-4">
      {slides.map((slide: any, index: number) => (
        <div key={slide.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-center mb-3">
            <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md">
              SLIDE #{index + 1}
            </span>
            <button 
              onClick={() => removeSlide(slide.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-1">
              <Type size={14} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-xs font-bold outline-none placeholder:text-slate-300"
                placeholder="Judul Slide..."
                value={slide.title}
                onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
              />
            </div>

            <div className="flex items-start gap-2">
              <AlignLeft size={14} className="text-slate-400 mt-1" />
              <textarea
                className="w-full bg-transparent text-[11px] outline-none h-16 resize-none placeholder:text-slate-300"
                placeholder="Tulis penjelasan materi di sini..."
                value={slide.desc}
                onChange={(e) => updateSlide(slide.id, { desc: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
              <Target size={14} className="text-orange-500" />
              <select
                className="bg-transparent w-full text-[10px] font-bold outline-none appearance-none cursor-pointer"
                value={slide.targetId}
                onChange={(e) => updateSlide(slide.id, { targetId: e.target.value })}
              >
                <option value="">Pilih Aset Fokus...</option>
                {nodes.map((n: any) => (
                  <option key={n.id} value={n.id}>{n.data.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
