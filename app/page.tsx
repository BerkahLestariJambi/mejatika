"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Splash } from "@/components/splash"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { NewsSlider } from "@/components/news-slider"
import { NewsList } from "@/components/news-list"
import { ScheduleSidebar } from "@/components/schedule-sidebar"
import { Footer } from "@/components/footer"
import { RunningText } from "@/components/running-text"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, Quote, ArrowLeft, Share2, Facebook, MessageCircle } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug) {
      setLoadingDetail(true)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.status === 'published') {
            setArticle(json.data)
          } else {
            setArticle(null)
            setSelectedSlug(null)
          }
          setLoadingDetail(false)
        })
        .catch(() => {
          setLoadingDetail(false)
          setSelectedSlug(null)
        })
    }
  }, [selectedSlug])

  const renderRichContent = (htmlContent: string) => {
    if (!htmlContent) return null;
    return (
      <div 
        className="quill-html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    );
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${selectedSlug}` : '';

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex flex-col overflow-x-hidden">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-6">
        <RunningText />

        <AnimatePresence mode="wait">
          {!selectedSlug ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6"
            >
              <div className="lg:col-span-2 space-y-8">
                <NewsSlider onReadMore={(slug) => setSelectedSlug(slug)} />
                <NewsList onReadMore={(slug) => setSelectedSlug(slug)} />
              </div>
              <div className="lg:col-span-1">
                <ScheduleSidebar />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center"
            >
              {/* HEADER GULUNGAN - Dibuat lebih slim */}
              <div className="w-full max-w-3xl relative z-30">
                <div className="w-full h-12 bg-amber-500 rounded-full shadow-xl flex items-center justify-between px-8 relative overflow-hidden border-b-2 border-amber-700/30">
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">MEJATIKA</span>
                  <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.4em] z-10 italic">Warta Digital</span>
                </div>
              </div>

              {/* BODY KERTAS - Lebar dikurangi dari 850px ke 750px agar fokus */}
              <div className="w-full max-w-[92%] lg:max-w-[750px] bg-[#fffdfa] dark:bg-zinc-950 shadow-2xl px-6 md:px-12 lg:px-16 py-12 -mt-6 relative border-x border-black/5 z-20 overflow-hidden">
                
                {loadingDetail ? (
                  <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Memuat...</p>
                  </div>
                ) : article && (
                  <article className="space-y-8">
                    <header className="space-y-3 text-center">
                      <Badge className="bg-amber-100 text-amber-700 border-none uppercase tracking-[0.3em] font-bold text-[8px] px-3 py-1 mx-auto">
                        {article.category?.name || "Warta"}
                      </Badge>

                      <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase leading-tight tracking-tighter text-zinc-900 dark:text-white">
                        {article.title}
                      </h1>
                      
                      <div className="flex items-center justify-center gap-3 text-[8px] font-bold uppercase text-zinc-400 tracking-widest pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        <span className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 bg-amber-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          <User className="w-3 h-3 text-amber-600" /> {article.author || "Admin"}
                        </span>
                      </div>
                    </header>

                    {/* Gambar Disesuaikan ukurannya agar tidak terlalu makan tempat */}
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg border border-black/5 bg-zinc-100">
                      <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="news" />
                    </div>

                    {/* KONTEN UTAMA - Ukuran font dikurangi (text-base) agar elegan */}
                    <div className="text-base md:text-lg leading-[1.7] text-justify text-zinc-800 dark:text-zinc-200 article-body">
                      {renderRichContent(article.content)}
                    </div>

                    {/* QUOTE AREA */}
                    {article.quote && (
                      <div className="relative py-8 px-6 border-y border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10 italic text-center rounded-lg">
                         <p className="text-lg font-bold leading-tight text-amber-900 dark:text-amber-100">
                           "{article.quote}"
                         </p>
                      </div>
                    )}

                    {/* SHARE AREA */}
                    <div className="flex flex-col items-center gap-6 pt-6 border-t border-black/5">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-600">Bagikan</span>
                        <div className="flex gap-3">
                          <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-green-500 hover:text-white transition-all">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-blue-600 hover:text-white transition-all">
                            <Facebook className="w-4 h-4" />
                          </a>
                          <button onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            alert("Tautan disalin!");
                          }} className="p-2.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-amber-500 hover:text-white transition-all">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedSlug(null)}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-6 h-9 font-bold uppercase text-[9px] tracking-widest hover:scale-105 transition-transform"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Kembali
                      </Button>
                    </div>
                  </article>
                )}
              </div>

              {/* FOOTER GULUNGAN - Lebih tipis */}
              <div className="w-full max-w-3xl h-10 bg-amber-500 rounded-full shadow-lg relative z-10 border-t-2 border-amber-700/30 flex items-center justify-center mb-16">
                 <div className="w-16 h-1 bg-white/20 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <style jsx global>{`
        /* Ukuran Font Konten Lebih Proporsional */
        .article-body {
          font-size: 1.05rem; /* Tidak terlalu besar, tidak terlalu kecil */
        }

        .article-body::first-letter {
          float: left;
          font-size: 3.5rem; /* Perkecil dari 4rem */
          line-height: 0.7;
          font-weight: 900;
          color: #d97706;
          margin-right: 0.5rem;
          margin-top: 0.5rem;
        }

        .quill-html-content p {
          margin-bottom: 1.25rem;
        }

        /* Gambar di dalam konten dibuat lebih manis */
        .quill-html-content img {
          max-width: 90% !important; /* Jangan penuhi frame */
          margin: 1.5rem auto !important;
          border-radius: 8px;
        }

        /* Tabel dibuat lebih ringkas */
        .quill-html-content table {
          font-size: 0.9rem;
          margin: 1.5rem 0;
        }

        .quill-html-content td, .quill-html-content th {
          padding: 8px 12px;
        }
      `}</style>
    </div>
  )
}
