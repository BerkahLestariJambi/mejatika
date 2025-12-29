"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Quote, MessageCircle, Facebook } from "lucide-react"
import Link from "next/link"

export default function NewsDetailPage({ article, onBack }: { article: any, onBack: () => void }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!article) return <div className="p-10 text-center font-bold">Memuat warta...</div>;

  return (
    <article className="mt-6 flex flex-col items-center animate-in fade-in duration-700 overflow-x-hidden">
      
      {/* GULUNGAN ATAS */}
      <div className="w-full max-w-4xl relative z-30 px-4">
        <div className="w-full h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-between px-6 lg:px-12 relative overflow-hidden border-b-4 border-amber-700/30">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
          <span className="text-[10px] lg:text-[12px] font-black text-white uppercase tracking-[0.3em] z-10">MEJATIKA</span>
          <span className="text-[10px] lg:text-[12px] font-black text-amber-900/60 uppercase tracking-[0.3em] z-10 italic">Warta Digital</span>
        </div>
      </div>

      {/* BODY KERTAS - Perbaikan Lebar Kontainer */}
      <div className="w-[95%] max-w-[850px] bg-[#fffdfa] shadow-2xl px-6 md:px-16 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20 overflow-hidden">
        
        <header className="space-y-4 text-center mb-10">
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase tracking-widest font-black text-[9px] px-4 py-1.5 mx-auto">
            {article?.category?.name || "BERITA"}
          </Badge>

          <h1 className="text-2xl lg:text-4xl font-black uppercase leading-tight tracking-tight text-zinc-900 italic break-words">
            {article?.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest pt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
            <span className="flex items-center gap-1.5 text-zinc-900 bg-amber-50 px-2 py-0.5 rounded">
              <User className="w-3.5 h-3.5 text-amber-600" /> {article?.author?.name || "Admin"}
            </span>
          </div>
        </header>

        {/* GAMBAR UTAMA */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-black/5 mb-12">
          <img src={article.image} className="w-full h-full object-cover" alt="" />
        </div>

        {/* --- PERBAIKAN KONTEN: Mencegah Meluber --- */}
        <div className="max-w-full overflow-hidden">
          <div 
            className="prose prose-zinc lg:prose-xl max-w-full text-zinc-800 leading-[1.8] text-justify
                       [&_p]:mb-6 [&_p]:break-words
                       first-letter:text-7xl md:first-letter:text-8xl first-letter:font-black first-letter:text-amber-600 
                       first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85] first-letter:mt-1"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>

        {/* --- PERBAIKAN QUOTE: Cek Properti Database --- */}
        {(article.excerpt || article.quote) && (
          <div className="relative my-16 py-10 px-8 lg:px-14 border-y-2 border-amber-500/30 bg-amber-50/30 italic text-center rounded-2xl">
            <Quote className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 text-amber-500 bg-[#fffdfa] px-2" />
            <p className="text-lg lg:text-2xl font-black leading-snug uppercase tracking-tighter text-amber-950 relative z-10">
              {/* Menghapus tag HTML jika mengambil dari excerpt */}
              "{ (article.quote || article.excerpt).replace(/<[^>]*>?/gm, '') }"
            </p>
          </div>
        )}

        {/* FOOTER NAVIGASI */}
        <div className="flex flex-col items-center gap-10 pt-12 border-t border-black/5 mt-12">
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">BAGIKAN WARTA</span>
            <div className="flex gap-4">
              <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-3 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all border border-green-200">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-200">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <Button 
            onClick={onBack}
            className="bg-zinc-900 hover:bg-amber-600 text-white rounded-full px-10 h-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> KEMBALI KE DAFTAR
          </Button>
        </div>
      </div>

      {/* GULUNGAN BAWAH */}
      <div className="w-full max-w-4xl h-12 bg-amber-500 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center mb-20 px-4">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
        <div className="w-20 h-1 bg-white/40 rounded-full"></div>
      </div>
    </article>
  )
}
