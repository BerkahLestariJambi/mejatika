"use client"

import { useState, useEffect, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Quote, Loader2 } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // 1. Resolve params di level paling atas sesuai standar Next.js 15
  const resolvedParams = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Gunakan fungsi async di dalam useEffect agar proses berurutan
    const getArticle = async () => {
      try {
        setLoading(true);
        
        // Pastikan slug benar-benar ada
        if (!resolvedParams.slug) {
          setError(true);
          return;
        }

        const res = await fetch(`https://backend.mejatika.com/api/news/${resolvedParams.slug}`);
        
        if (!res.ok) throw new Error("Gagal mengambil data");

        const json = await res.json();

        // Cek data dan status
        if (json.success && json.data && json.data.status === 'published') {
          setArticle(json.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(true);
      } finally {
        // INI KUNCINYA: Loading wajib mati di akhir proses apa pun hasilnya
        setLoading(false);
      }
    };

    getArticle();
  }, [resolvedParams.slug]);

  // Loading Screen
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 font-sans">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10 mb-4" />
      <p className="font-black text-amber-600 tracking-widest text-[10px] uppercase animate-pulse">Membuka Gulungan Warta...</p>
    </div>
  );

  // Error Screen
  if (error || !article) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 font-sans">
      <p className="font-black text-zinc-400 uppercase tracking-widest text-sm px-6 text-center">Warta tidak ditemukan atau masih dalam draf.</p>
      <Link href="/berita">
        <Button className="bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase text-[10px] px-8 rounded-full">Kembali ke Beranda</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <Navigation />
      
      <main className="mt-10 flex flex-col items-center px-4 overflow-x-hidden">
        {/* --- HEADER GULUNGAN (Slim & Proporsional) --- */}
        <div className="w-full max-w-3xl relative z-30">
          <div className="w-full h-12 bg-amber-500 rounded-full shadow-xl flex items-center justify-between px-8 relative overflow-hidden border-b-2 border-amber-700/30">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">MEJATIKA</span>
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.4em] z-10 italic">Warta Digital</span>
          </div>
        </div>

        {/* --- BODY KERTAS (Ukuran 750px agar tidak terlalu besar) --- */}
        <div className="w-full max-w-[92%] lg:max-w-[750px] bg-[#fffdfa] shadow-2xl px-6 md:px-12 lg:px-16 py-12 -mt-6 relative border-x border-black/5 z-20 overflow-hidden box-border">
          
          <header className="space-y-4 text-center mb-8">
            <Badge className="bg-amber-100 text-amber-700 border-none uppercase tracking-widest font-bold text-[8px] px-3 py-1 mx-auto">
              {article?.category?.name || "UMUM"}
            </Badge>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase leading-tight tracking-tight text-zinc-900 italic break-words">
              {article?.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase text-zinc-400 tracking-widest pt-1 border-y border-zinc-100 py-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
              <span className="flex items-center gap-1.5 text-zinc-800 bg-amber-50 px-2 py-0.5 rounded">
                <User className="w-3 h-3 text-amber-600" /> {article?.author || "Admin"}
              </span>
            </div>
          </header>

          {/* GAMBAR UTAMA */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-10 bg-zinc-100 border border-black/5">
            <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
          </div>

          {/* AREA KONTEN (SUDAH ANTI-BOCOR) */}
          <div className="content-lock">
            <div 
              className="rich-content-render"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>

          {/* QUOTE AREA */}
          {(article.quote || article.excerpt) && (
            <div className="relative my-10 py-8 px-6 border-y border-dashed border-amber-500/30 bg-amber-50/30 italic text-center rounded-xl">
              <Quote className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500 bg-[#fffdfa] px-1" />
              <p className="text-base lg:text-lg font-bold leading-snug text-amber-950">
                "{ (article.quote || article.excerpt).replace(/<[^>]*>?/gm, '') }"
              </p>
            </div>
          )}

          {/* NAVIGASI */}
          <div className="flex flex-col items-center pt-8 border-t border-black/5 mt-10">
            <Link href="/berita">
              <Button className="bg-zinc-900 hover:bg-amber-600 text-white rounded-full px-8 h-10 font-black uppercase text-[9px] tracking-widest transition-all shadow-lg">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> DAFTAR BERITA
              </Button>
            </Link>
          </div>
        </div>

        {/* GULUNGAN BAWAH */}
        <div className="w-full max-w-3xl h-10 bg-amber-500 rounded-full shadow-xl relative z-10 border-t-2 border-amber-700/30 flex items-center justify-center mb-20 overflow-hidden">
          <div className="w-16 h-1 bg-white/30 rounded-full"></div>
        </div>
      </main>

      <Footer />

      {/* --- CSS ANTI-BOCOR & UKURAN ELEGAN --- */}
      <style jsx global>{`
        .content-lock {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .rich-content-render {
          font-size: 1.05rem; /* Tidak terlalu besar */
          line-height: 1.75;
          color: #27272a;
          text-align: justify;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word; /* Mencegah teks keluar frame */
        }

        .rich-content-render::first-letter {
          float: left;
          font-size: 3.5rem;
          line-height: 0.7;
          font-weight: 900;
          color: #d97706;
          margin-right: 0.6rem;
          margin-top: 0.5rem;
          text-transform: uppercase;
        }

        .rich-content-render p {
          margin-bottom: 1.25rem;
        }

        .rich-content-render img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          margin: 1.5rem auto;
          display: block;
        }

        .rich-content-render table {
          display: block;
          width: 100% !important;
          overflow-x: auto; /* Tabel bisa di-scroll di dalam frame */
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .rich-content-render td, .rich-content-render th {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          min-width: 80px;
        }
      `}</style>
    </div>
  )
}
