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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, Share2, Facebook, Twitter, MessageCircle, Quote, X } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null)
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoadingDetail(false)
        })
        .catch(() => setLoadingDetail(false))
    }
  }, [selectedSlug, isModalOpen])

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${selectedSlug}` : '';

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <RunningText />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            <NewsSlider onReadMore={handleOpenDetail} />
            <NewsList onReadMore={handleOpenDetail} />
          </div>
          <div className="lg:col-span-1">
            <ScheduleSidebar />
          </div>
        </div>
      </main>
      
      <Footer />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[98vw] lg:max-w-7xl h-[92vh] lg:h-[85vh] p-0 bg-transparent border-none shadow-none outline-none overflow-hidden transition-all">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col lg:flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-2xl lg:rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/10 relative"
            >
              
              {/* Tombol Close Custom untuk Mobile agar tidak menutupi teks */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-[100] p-2 bg-black/5 hover:bg-black/10 rounded-full lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* --- SEKSI KIRI: VISUAL & JUDUL (Sticky di Desktop) --- */}
              <div className="w-full lg:w-2/5 h-auto lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-black/5 relative bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex-grow p-6 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-4 lg:space-y-6">
                    <Badge className="w-fit uppercase tracking-widest font-bold px-3 py-1 text-[10px] bg-primary/10 text-primary border-none">
                      {article.category?.name || "BERITA"}
                    </Badge>
                    <h1 className="text-xl lg:text-3xl font-black uppercase leading-tight italic tracking-tighter text-balance">
                      {article.title}
                    </h1>
                    <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-xl lg:rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                      <img src={article.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="cover" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[9px] font-bold uppercase text-muted-foreground tracking-widest border-t border-black/5 pt-6">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" /> {article.user?.name || "REDAKSI"}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex h-20 px-12 border-t border-black/5 items-center text-[10px] font-black opacity-20 tracking-[0.4em] uppercase">
                   MEJATIKA DIGITAL MAGAZINE
                </div>
              </div>

              {/* SPINE: Efek Garis Tengah Buku (Hanya Desktop) */}
              <div className="hidden lg:block w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-20">
                 <div className="absolute top-0 bottom-0 -left-8 w-16 bg-gradient-to-r from-black/[0.04] via-transparent to-black/[0.04] pointer-events-none" />
              </div>

              {/* --- SEKSI KANAN: ISI BERITA FULL (Scrollable) --- */}
              <div className="flex-1 h-full flex flex-col bg-white dark:bg-zinc-950 relative overflow-hidden">
                <div className="flex-grow p-6 lg:p-16 overflow-y-auto scroll-smooth custom-scrollbar">
                  <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-justify leading-relaxed">
                    
                    {/* ISI BERITA UTAMA */}
                    <div 
                      className="article-body first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-primary"
                      dangerouslySetInnerHTML={{ __html: article.content }} 
                    />
                    
                    {/* SEKSI QUOTE / KUTIPAN */}
                    {article.quote && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative py-8 px-10 border-l-4 border-primary bg-primary/5 rounded-r-3xl italic my-10 shadow-sm"
                      >
                        <Quote className="absolute top-4 right-6 w-10 h-10 opacity-10 text-primary" />
                        <p className="text-lg font-medium text-foreground/80 leading-relaxed">
                          "{article.quote}"
                        </p>
                      </motion.div>
                    )}

                    {/* FOOTER ARTIKEL */}
                    <div className="mt-16 pt-10 border-t border-black/5 flex flex-col items-center gap-8">
                       <div className="flex flex-col items-center">
                          <p className="font-black italic text-primary uppercase tracking-tighter text-sm">
                            Terima kasih sudah membaca!
                          </p>
                          <div className="h-1 w-12 bg-primary/20 mt-2 rounded-full" />
                       </div>
                       
                       {/* SHARE CARD */}
                       <div className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-900 border border-black/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                               <Share2 className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Bagikan Berita</span>
                         </div>
                         <div className="flex gap-3">
                            <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-2 hover:bg-green-500 hover:text-white rounded-full transition-all duration-300"><MessageCircle className="w-5 h-5" /></a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-2 hover:bg-blue-600 hover:text-white rounded-full transition-all duration-300"><Facebook className="w-5 h-5" /></a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${shareUrl}`} target="_blank" className="p-2 hover:bg-sky-400 hover:text-white rounded-full transition-all duration-300"><Twitter className="w-5 h-5" /></a>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Penomoran Halaman (Hanya Desktop) */}
                <div className="hidden lg:flex h-20 px-16 border-t border-black/5 items-center justify-end text-[10px] font-black opacity-20 tracking-[0.4em] uppercase">
                   PAGE NO. 02
                </div>
              </div>

            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSS internal untuk scrollbar cantik */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .article-body p {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  )
}
