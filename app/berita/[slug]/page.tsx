"use client"

import { useState, useEffect, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Quote, Loader2 } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (resolvedParams.slug) {
      setLoading(true);
      fetch(`https://backend.mejatika.com/api/news/${resolvedParams.slug}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((json) => {
          // KEAMANAN: Jika status bukan published, anggap tidak ditemukan (error)
          if (json.success && json.data.status === 'published') {
            setArticle(json.data);
          } else {
            setError(true);
          }
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [resolvedParams.slug]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500 w-12 h-12 mb-4" />
      <p className="font-black text-amber-600 tracking-widest text-xs uppercase animate-pulse">Memuat Warta Digital...</p>
    </div>
  );

  if (error || !article) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <p className="font-black text-zinc-400 uppercase tracking-widest">Warta tidak ditemukan atau masih dalam draf.</p>
      <Link href="/berita">
        <Button className="bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase text-xs px-8 rounded-full">Kembali</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      <Navigation />
      
      <main className="mt-10 flex flex-col items-center px-4 overflow-x-hidden">
        {/* --- GULUNGAN ATAS --- */}
        <div className="w-full max-w-4xl relative z-30">
          <div className="w-full h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-between px-6 lg:px-12 relative overflow-hidden border-b-4 border-amber-700/30">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
            <span className="text-[10px] lg:text-[12px] font-black text-white uppercase tracking-[0.4em] z-10">MEJATIKA</span>
            <span className="text-[10px] lg:text-[12px] font-black text-amber-900/60 uppercase tracking-[0.4em] z-10 italic">Warta Digital</span>
          </div>
        </div>

        {/* --- BODY KERTAS --- */}
        <div className="w-full max-w-[95%] lg:max-w-[850px] bg-[#fffdfa] shadow-2xl px-5 md:px-16 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20 overflow-hidden">
          <header className="space-y-4 text-center mb-10">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase tracking-widest font-black text-[9px] px-4 py-1.5 mx-auto">
              {article?.category?.name || "UMUM"}
            </Badge>

            <h1 className="text-2xl lg:text-4xl font-black uppercase leading-tight tracking-tight text-zinc-900 italic break-words">
              {article?.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
              <span className="flex items-center gap-1.5 text-zinc-900 bg-amber-50 px-2 py-0.5 rounded">
                <User className="w-3.5 h-3.5 text-amber-600" /> {article?.author || "Admin"}
              </span>
            </div>
          </header>

          {/* GAMBAR UTAMA */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-12 bg-zinc-100 border border-black/5">
            <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
          </div>

          {/* --- AREA KONTEN (Penyaring Kebocoran) --- */}
          <div className="article-content-wrapper">
            <div 
              className="rich-text-body"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>

          {/* --- QUOTE / EXCERPT --- */}
          {(article.quote || article.excerpt) && (
            <div className="relative my-16 py-10 px-8 border-y-2 border-dashed border-amber-500/30 bg-amber-50/30 italic text-center rounded-2xl">
              <Quote className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-500 bg-[#fffdfa] px-1" />
              <p className="text-lg lg:text-xl font-black leading-snug uppercase tracking-tighter text-amber-950">
                "{ (article.quote || article.excerpt).replace(/<[^>]*>?/gm, '') }"
              </p>
            </div>
          )}

          {/* NAVIGASI BAWAH */}
          <div className="flex flex-col items-center gap-10 pt-12 border-t border-black/5 mt-12">
            <Link href="/berita">
              <Button className="bg-zinc-900 hover:bg-amber-600 text-white rounded-full px-10 h-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl">
                <ArrowLeft className="w-4 h-4 mr-2" /> KEMBALI KE DAFTAR
              </Button>
            </Link>
          </div>
        </div>

        {/* GULUNGAN BAWAH */}
        <div className="w-full max-w-4xl h-12 bg-amber-500 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center mb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
          <div className="w-20 h-1 bg-white/40 rounded-full"></div>
        </div>
      </main>

      {/* STYLE CSS GLOBAL UNTUK PENYARING CONTENT QUILL */}
      <style jsx global>{`
        .article-content-wrapper {
          width: 100%;
          overflow-x: hidden;
        }

        .rich-text-body {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #27272a;
          text-align: justify;
        }

        /* Dropcap */
        .rich-text-body::first-letter {
          float: left;
          font-size: 4.5rem;
          line-height: 0.8;
          font-weight: 900;
          color: #d97706;
          margin-right: 0.6rem;
          margin-top: 0.6rem;
          text-transform: uppercase;
        }

        .rich-text-body p {
          margin-bottom: 1.5rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Anti-Bocor untuk Gambar di Dalam Konten */
        .rich-text-body img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 12px;
          margin: 2rem 0;
          display: block;
        }

        /* Anti-Bocor untuk Tabel */
        .rich-text-body table {
          display: block;
          width: 100% !important;
          overflow-x: auto;
          border-collapse: collapse;
          margin: 2rem 0;
          -webkit-overflow-scrolling: touch;
        }

        .rich-text-body td, .rich-text-body th {
          border: 1px solid #e5e7eb;
          padding: 10px 14px;
          min-width: 100px;
        }

        .rich-text-body blockquote {
          border-left: 4px solid #f59e0b;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4b5563;
        }
      `}</style>
      
      <Footer />
    </div>
  )
}
