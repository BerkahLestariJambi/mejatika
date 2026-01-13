"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Splash } from "@/components/splash"
// Header dan Navigation SUDAH DIHAPUS dari import karena sudah ada di layout.tsx
import { NewsSlider } from "@/components/news-slider"
import { NewsList } from "@/components/news-list"
import { ScheduleSidebar } from "@/components/schedule-sidebar"
// Footer SUDAH DIHAPUS
import { RunningText } from "@/components/running-text"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, Quote, ArrowLeft, Share2, Facebook, MessageCircle } from "lucide-react"

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
      <div className="quill-html-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${selectedSlug}` : '';

  if (showSplash) return <Splash />

  return (
    // Header dan Navigation sudah otomatis muncul dari layout.tsx di atas div ini
    <div className="flex flex-col overflow-x-hidden">
      
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
              {/* DETAIL BERITA TETAP DI SINI */}
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

              <div className="w-full max-w-[96%] lg:max-w-[850px] bg-[#fffdfa] dark:bg-zinc-950 shadow-2xl px-5 md:px-12 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20 overflow-hidden">
                {loadingDetail ? (
                  <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Membuka Gulungan...</p>
                  </div>
                ) : article && (
                  <article className="space-y-10">
                    {/* ... (Konten artikel Anda tetap sama seperti sebelumnya) ... */}
                    <header className="space-y-4 text-center">
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-[0.4em] font-black text-[9px] px-4 py-1.5 mx-auto">
                        {article.category?.name || "Warta"}
                      </Badge>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tighter text-zinc-900 dark:text-white">
                        {article.title}
                      </h1>
                    </header>
                    {/* (Dan seterusnya sampai tombol kembali) */}
                    <div className="text-lg lg:text-xl leading-[1.8] text-zinc-800 dark:text-zinc-200 article-body">
                      {renderRichContent(article.content)}
                    </div>
                    <Button 
                      onClick={() => setSelectedSlug(null)}
                      className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-8 font-black uppercase text-[10px] tracking-widest mx-auto block mt-10"
                    >
                      Kembali ke Beranda
                    </Button>
                  </article>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer sudah otomatis dari layout.tsx di bawah div ini */}

      <style jsx global>{`
        /* (Style Anda tetap sama) */
      `}</style>
    </div>
  )
}
