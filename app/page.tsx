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

  // LOGIKA FETCH DETAIL: ANTI-DRAF & KEAMANAN FRAME
  useEffect(() => {
    if (selectedSlug) {
      setLoadingDetail(true)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((json) => {
          // VALIDASI: Hanya terima jika status 'published'
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
   
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-6 lg:py-10">
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
                {/* Pastikan komponen ini sudah pakai ?status=published di dalamnya */}
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
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center"
            >
              {/* HEADER GULUNGAN */}
              <div className="w-full max-w-4xl relative z-30">
                <div className="w-full h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-between px-12 relative overflow-hidden border-b-4 border-amber-700/30">
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] z-10 drop-shadow-md">MEJATIKA</span>
                  <div className="flex gap-1.5 z-10">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/80" />)}
                  </div>
                  <span className="text-[12px] font-black text-amber-900/60 uppercase tracking-[0.5em] z-10 italic">Warta Digital</span>
                </div>
              </div>

              {/* BODY KERTAS (DITAMBAHKAN OVERFLOW-HIDDEN AGAR TIDAK BOCOR) */}
              <div className="w-full max-w-[96%] lg:max-w-[850px] bg-[#fffdfa] dark:bg-zinc-950 shadow-2xl px-5 md:px-12 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20 overflow-hidden">
                
                {loadingDetail ? (
                  <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Membuka Gulungan...</p>
                  </div>
                ) : article && (
                  <article className="space-y-10">
                    <header className="space-y-4 text-center">
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-[0.4em] font-black text-[9px] px-4 py-1.5 mx-auto">
                        {article.category?.name || "Warta"}
                      </Badge>

                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tighter text-zinc-900 dark:text-white">
                        {article.title}
                      </h1>
                      
                      <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] pt-2">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 bg-amber-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          <User className="w-3.5 h-3.5 text-amber-600" /> {article.author || "Admin"}
                        </span>
                      </div>
                    </header>

                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-black/5 bg-zinc-100">
                      <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="news" />
                    </div>

                    {/* AREA KONTEN UTAMA */}
                    <div className="text-lg lg:text-xl leading-[1.8] text-justify text-zinc-800 dark:text-zinc-200 article-body">
                      {renderRichContent(article.content)}
                    </div>

                    {/* QUOTE AREA */}
                    {article.quote && (
                      <div className="relative py-12 px-8 lg:px-14 border-y-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10 italic text-center rounded-xl">
                         <Quote className="absolute top-4 left-6 w-10 h-10 opacity-10 text-amber-600" />
                         <p className="text-xl lg:text-2xl font-black leading-tight uppercase tracking-tighter text-amber-900 dark:text-amber-100 relative z-10">
                           "{article.quote}"
                         </p>
                         <Quote className="absolute bottom-4 right-6 w-10 h-10 opacity-10 text-amber-600 rotate-180" />
                      </div>
                    )}

                    {/* SHARE & BACK */}
                    <div className="flex flex-col items-center gap-8 pt-10 border-t border-black/5">
                      <div className="flex flex-col items-center gap-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-600">Bagikan Warta</span>
                        <div className="flex gap-4">
                          <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-3 rounded-full bg-zinc-100 text-zinc-400 hover:bg-green-500 hover:text-white transition-all">
                            <MessageCircle className="w-5 h-5" />
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-3 rounded-full bg-zinc-100 text-zinc-400 hover:bg-blue-600 hover:text-white transition-all">
                            <Facebook className="w-5 h-5" />
                          </a>
                          <button onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            alert("Tautan berhasil disalin!");
                          }} className="p-3 rounded-full bg-zinc-100 text-zinc-400 hover:bg-amber-500 hover:text-white transition-all">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedSlug(null)}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-8 font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
                      </Button>
                    </div>
                  </article>
                )}
              </div>

              {/* FOOTER GULUNGAN */}
              <div className="w-full max-w-4xl h-14 bg-amber-500 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center mb-20 overflow-hidden">
                 <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                 <div className="w-20 h-1.5 bg-white/20 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* CSS GLOBAL UNTUK MENGATASI KEBOCORAN KONTEN */}
      <style jsx global>{`
        .article-body {
          word-wrap: break-word;
          overflow-wrap: break-word;
          width: 100%;
        }

        .article-body::first-letter {
          float: left;
          font-size: 4rem;
          line-height: 0.8;
          font-weight: 900;
          color: #d97706;
          margin-right: 0.6rem;
          margin-top: 0.6rem;
          text-transform: uppercase;
        }

        .quill-html-content {
          width: 100%;
          overflow-x: hidden;
        }

        /* Gambar Auto-Fit */
        .quill-html-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 12px;
          margin: 24px 0;
          display: block;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }

        /* Tabel Anti-Bocor (Bisa di-scroll horizontal dalam bingkai) */
        .quill-html-content table {
          display: block;
          width: 100% !important;
          overflow-x: auto;
          border-collapse: collapse;
          margin: 24px 0;
          background: #fff;
          -webkit-overflow-scrolling: touch;
        }

        .quill-html-content td, .quill-html-content th {
          border: 1px solid #e5e7eb;
          padding: 12px 15px;
          min-width: 120px;
        }

        .quill-html-content th {
          background-color: #f9fafb;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .quill-html-content p {
          margin-bottom: 1.5rem;
        }

        .quill-html-content blockquote {
          border-left: 4px solid #f59e0b;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4b5563;
        }
      `}</style>
    </div>
  )
}
