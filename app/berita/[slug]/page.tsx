"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Quote, Share2, MessageCircle, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

// Gunakan library ini atau dangerouslySetInnerHTML untuk merender HTML
export default function NewsDetailPage({ article, onBack }: { article: any, onBack: () => void }) {
  
  // URL untuk share
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <article className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* --- GULUNGAN ATAS BATIK (Sama dengan Homepage) --- */}
      <div className="w-full max-w-4xl relative z-30">
        <div className="w-full h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-between px-12 relative overflow-hidden border-b-4 border-amber-700/30">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
          <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] z-10 drop-shadow-md">MEJATIKA</span>
          <div className="flex gap-1.5 z-10">
            {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/80" />)}
          </div>
          <span className="text-[12px] font-black text-amber-900/60 uppercase tracking-[0.5em] z-10 italic">Warta Digital</span>
        </div>
      </div>

      {/* BODY KERTAS */}
      <div className="w-full max-w-[92%] lg:max-w-[850px] bg-[#fffdfa] shadow-2xl px-8 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20">
        <header className="space-y-4 text-center mb-10">
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-[0.4em] font-black text-[9px] px-4 py-1.5 mx-auto">
            {article.category?.name || "BERITA"}
          </Badge>

          <h1 className="text-[24px] lg:text-[32px] font-black uppercase leading-tight tracking-widest text-zinc-900 italic">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] pt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            <span className="flex items-center gap-1.5 text-zinc-900 bg-amber-50 px-2 py-0.5 rounded">
              <User className="w-3.5 h-3.5 text-amber-600" /> {article.author?.name || "Admin Mejatika"}
            </span>
          </div>
        </header>

        {/* GAMBAR UTAMA */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-black/5 mb-12">
          <img src={article.image} className="w-full h-full object-cover" alt={article.title} />
        </div>

        {/* --- PERBAIKAN KONTEN HTML --- */}
        <div className="prose prose-zinc max-w-none">
          <div 
            className="text-lg lg:text-xl leading-[1.8] text-justify text-zinc-800 first-letter:text-8xl first-letter:font-black first-letter:text-amber-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85] first-letter:mt-1"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>

        {/* QUOTE / EXCERPT */}
        {(article.quote || article.excerpt) && (
          <div className="relative my-12 py-12 px-8 lg:px-14 border-y-4 border-amber-500 bg-amber-50/40 italic text-center rounded-xl shadow-inner">
            <Quote className="absolute top-4 left-6 w-12 h-12 opacity-20 text-amber-600" />
            <p className="text-xl lg:text-2xl font-black leading-tight uppercase tracking-tighter text-amber-950 relative z-10 px-6">
              "{article.quote || article.excerpt.replace(/<[^>]*>/g, '')}"
            </p>
            <Quote className="absolute bottom-4 right-6 w-12 h-12 opacity-20 text-amber-600 rotate-180" />
          </div>
        )}

        {/* SHARE & NAVIGASI BAWAH */}
        <div className="flex flex-col items-center gap-10 pt-12 border-t border-black/5 mt-12">
          <div className="flex flex-col items-center gap-4 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">BAGIKAN WARTA</span>
            <div className="flex gap-5">
              <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-3.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-md">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-3.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-md">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <Button 
            onClick={onBack}
            className="bg-zinc-900 text-white rounded-full px-10 h-12 font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:scale-105 transition-transform gap-3"
          >
            <ArrowLeft className="w-4 h-4" /> KEMBALI KE DAFTAR
          </Button>
        </div>
      </div>

      {/* GULUNGAN BAWAH */}
      <div className="w-full max-w-4xl h-16 bg-amber-500 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center overflow-hidden mb-16">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
        <div className="w-24 h-1 bg-white/30 rounded-full"></div>
      </div>
    </article>
  )
}
