"use client"

import { useState, useEffect, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Loader2, Quote, MessageCircle, Facebook, Share2 } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`https://backend.mejatika.com/api/news/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  }, [slug]);

  // 1. Tampilan saat Loading
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 w-12 h-12 mb-4" />
        <p className="text-zinc-500 font-bold tracking-widest animate-pulse">MEMUAT WARTA...</p>
      </div>
    );
  }

  // 2. Tampilan jika Artikel tidak ditemukan
  if (!article || article.message) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Warta tidak ditemukan</h1>
        <Link href="/berita">
          <Button className="bg-amber-500 text-white">Kembali ke Daftar Berita</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      <Navigation />
      
      {/* GULUNGAN ATAS BATIK */}
      <div className="mt-10 w-full flex flex-col items-center">
        <div className="w-full max-w-4xl relative z-30">
          <div className="w-full h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-between px-12 relative overflow-hidden border-b-4 border-amber-700/30">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
            <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] z-10">MEJATIKA</span>
            <span className="text-[12px] font-black text-amber-900/60 uppercase tracking-[0.5em] z-10 italic text-right">Warta Digital</span>
          </div>
        </div>

        {/* BODY KERTAS */}
        <div className="w-full max-w-[92%] lg:max-w-[850px] bg-[#fffdfa] shadow-2xl px-8 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20">
          <header className="space-y-4 text-center mb-10">
            {/* PENCEGAHAN ERROR CATEGORY */}
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-[0.4em] font-black text-[9px] px-4 py-1.5 mx-auto">
              {article?.category?.name || "BERITA"}
            </Badge>

            <h1 className="text-[24px] lg:text-[32px] font-black uppercase leading-tight tracking-widest text-zinc-900 italic">
              {article?.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              <span className="flex items-center gap-1.5 text-zinc-900 bg-amber-50 px-2 py-0.5 rounded">
                <User className="w-3.5 h-3.5 text-amber-600" /> {article?.author?.name || article?.user?.name || "Admin Mejatika"}
              </span>
            </div>
          </header>

          {/* GAMBAR UTAMA */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-black/5 mb-12">
            <img src={article.image} className="w-full h-full object-cover" alt="" />
          </div>

          {/* RENDER HTML AMAN */}
          <div className="prose prose-zinc max-w-none">
            <div 
              className="text-lg lg:text-xl leading-[1.8] text-justify text-zinc-800 first-letter:text-8xl first-letter:font-black first-letter:text-amber-600 first-letter:mr-3 first-letter:float-left"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>

          {/* SHARE & NAVIGASI */}
          <div className="flex flex-col items-center gap-10 pt-12 border-t border-black/5 mt-12">
            <div className="flex flex-col items-center gap-4 w-full text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">BAGIKAN WARTA</span>
              <div className="flex gap-5">
                <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-3.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-3.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <Link href="/berita">
              <Button className="bg-zinc-900 text-white rounded-full px-10 h-12 font-black uppercase text-[11px] tracking-[0.2em] shadow-lg">
                <ArrowLeft className="w-4 h-4 mr-2" /> KEMBALI KE DAFTAR
              </Button>
            </Link>
          </div>
        </div>

        {/* GULUNGAN BAWAH */}
        <div className="w-full max-w-4xl h-16 bg-amber-500 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center overflow-hidden mb-16">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
          <div className="w-24 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
