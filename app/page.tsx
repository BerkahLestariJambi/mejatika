"use client"

import { useState, useEffect, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Quote, Loader2, Share2, Facebook, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // 1. Resolve params di paling atas
  const resolvedParams = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 2. Gunakan AbortController untuk mencegah memory leak & stuck loading
    const controller = new AbortController();
    
    const fetchArticle = async () => {
      if (!resolvedParams?.slug) return;

      try {
        setLoading(true);
        const res = await fetch(`https://backend.mejatika.com/api/news/${resolvedParams.slug}`, {
          signal: controller.signal
        });

        if (!res.ok) throw new Error("Gagal mengambil data");

        const json = await res.json();

        // 3. Pastikan data ada dan statusnya published
        if (json.success && json.data && json.data.status === 'published') {
          setArticle(json.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Fetch error:", err);
          setError(true);
        }
      } finally {
        // 4. SELALU matikan loading di akhir, apa pun hasilnya
        setLoading(false);
      }
    };

    fetchArticle();

    return () => controller.abort();
  }, [resolvedParams.slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Tampilan Loading
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 font-sans">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10 mb-4" />
      <p className="font-black text-amber-600 tracking-widest text-[10px] uppercase animate-pulse">Memuat Warta Digital...</p>
    </div>
  );

  // Tampilan Error
  if (error || !article) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 font-sans">
      <p className="font-black text-zinc-400 uppercase tracking-widest text-sm">Warta tidak ditemukan atau terjadi kesalahan.</p>
      <Link href="/berita">
        <Button className="bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase text-[10px] px-8 rounded-full">Kembali Ke Berita</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <Navigation />
      
      <main className="mt-10 flex flex-col items-center px-4 overflow-x-hidden">
        {/* --- HEADER GULUNGAN --- */}
        <div className="w-full max-w-3xl relative z-30">
          <div className="w-full h-14 bg-amber-500 rounded-full shadow-xl flex items-center justify-between px-8 relative overflow-hidden border-b-4 border-amber-700/30">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">MEJATIKA</span>
            <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.4em] z-10 italic">Warta Digital</span>
          </div>
        </div>

        {/* --- BODY KERTAS --- */}
        <div className="w-full max-w-[95%] lg:max-w-[750px] bg-[#fffdfa] shadow-2xl px-6 md:px-12 lg:px-16 py-12 -mt-7 relative border-x border-black/5 z-20 overflow-hidden box-border">
          
          <header className="space-y-4 text-center mb-8">
            <Badge className="bg-amber-100 text-amber-700 border-none uppercase tracking-widest font-black text-[8px] px-3 py-1 mx-auto">
              {article?.category?.name || "UMUM"}
            </Badge>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase leading-tight tracking-tight text-zinc-900 italic break-words">
              {article?.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase text-zinc-400 tracking-widest pt-1">
              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
              <span className="flex items-center gap-1.5 text-zinc-800 bg-amber-50 px-2 py-0.5 rounded">
                <User className="w-3 h-3 text-amber-600" /> {article?.author || "Admin"}
              </span>
            </div>
          </header>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-10 bg-zinc-100 border border-black/5">
            <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
          </div>

          {/* KONTEN (SUDAH ANTI-BOCOR) */}
          <div className="content-container">
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>

          {article.quote && (
            <div className="relative my-12 py-8 px-6 border-y border-dashed border-amber-500/30 bg-amber-50/30 italic text-center rounded-xl">
              <Quote className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500 bg-[#fffdfa] px-1" />
              <p className="text-base lg:text-lg font-black leading-snug uppercase tracking-tight text-amber-950">
                "{ article.quote }"
              </p>
            </div>
          )}

          {/* SHARE & BACK */}
          <div className="flex flex-col items-center gap-8 pt-8 border-t border-black/5 mt-10">
            <div className="flex flex-col items-center gap-3">
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-600">Bagikan Warta</span>
               <div className="flex gap-3">
                  <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-green-500 hover:text-white transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-blue-600 hover:text-white transition-all">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Tautan disalin!"); }} className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-amber-500 hover:text-white transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <Link href="/berita">
              <Button className="bg-zinc-900 hover:bg-amber-600 text-white rounded-full px-8 h-10 font-black uppercase text-[9px] tracking-widest transition-all shadow-lg">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> DAFTAR BERITA
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-3xl h-10 bg-amber-500 rounded-full shadow-xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center mb-20">
          <div className="w-16 h-1 bg-white/30 rounded-full"></div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .content-container {
          width: 100%;
          overflow: hidden;
        }
        .rich-text-content {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #27272a;
          text-align: justify;
          /* Kunci utama anti-bocor: */
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .rich-text-content::first-letter {
          float: left;
          font-size: 3.5rem;
          line-height: 0.8;
          font-weight: 900;
          color: #d97706;
          margin-right: 0.5rem;
          margin-top: 0.5rem;
          text-transform: uppercase;
        }
        .rich-text-content p {
          margin-bottom: 1.25rem;
        }
        .rich-text-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          margin: 1.5rem auto;
          display: block;
        }
        .rich-text-content table {
          display: block;
          width: 100% !important;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  )
}
