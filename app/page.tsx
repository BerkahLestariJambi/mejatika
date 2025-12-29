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
        .then((data) => {
          // DEBUG: Lihat di console browser apakah ada field 'quote'
          console.log("Data Berita:", data);
          setArticle(data)
          setLoadingDetail(false)
        })
        .catch(() => setLoadingDetail(false))
    }
  }, [selectedSlug])

  const getCleanContent = (htmlContent: string) => {
    if (!htmlContent) return "";
    return htmlContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${selectedSlug}` : '';

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex flex-col overflow-x-hidden">
      <Header />
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
              {/* --- GULUNGAN ATAS BATIK CERAH --- */}
              <div className="w-full max-w-4xl relative z-30">
                <div className="w-full h-16 bg-amber-500 dark:bg-amber-600 rounded-full shadow-2xl flex items-center justify-between px-12 relative overflow-hidden border-b-4 border-amber-700/30">
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] z-10 drop-shadow-md">MEJATIKA</span>
                  <div className="flex gap-1.5 z-10">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/80" />)}
                  </div>
                  <span className="text-[12px] font-black text-amber-900/60 uppercase tracking-[0.5em] z-10 italic">Warta Digital</span>
                </div>
              </div>

              {/* BODY KERTAS */}
              <div className="w-full max-w-[92%] lg:max-w-[850px] bg-[#fffdfa] dark:bg-zinc-950 shadow-2xl px-8 lg:px-20 py-16 -mt-8 relative border-x border-black/5 z-20">
                
                {loadingDetail ? (
                  <div className="h-[40vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : article && (
                  <article className="space-y-10">
                    <header className="space-y-4 text-center">
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-[0.4em] font-black text-[9px] px-4 py-1.5 mx-auto">
                        {article.category?.name || "BERITA"}
                      </Badge>

                      <h1 className="text-[18px] font-black uppercase leading-snug tracking-widest text-zinc-900 dark:text-white">
                        {article.title}
                      </h1>
                      
                      {/* AUTHOR & DATE */}
                      <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] pt-2">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 bg-amber-50 px-2 py-0.5 rounded">
                          <User className="w-3.5 h-3.5 text-amber-600" /> {article.user?.name || article.author || "Admin Mejatika"}
                        </span>
                      </div>
                    </header>

                    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-black/5">
                      <img src={article.image} className="w-full h-full object-cover" alt="news" />
                    </div>

                    <div className="text-lg lg:text-xl leading-[1.8] text-justify text-zinc-800 dark:text-zinc-200 first-letter:text-8xl first-letter:font-black first-letter:text-amber-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85] first-letter:mt-1">
                      {getCleanContent(article.content)}
                    </div>

                    {/* --- KONDISI QUOTE DIPERBAIKI --- */}
                    {(article.quote || article.excerpt) && (
                      <div className="relative py-12 px-8 lg:px-14 border-y-4 border-amber-500 bg-amber-50/40 dark:bg-amber-900/10 italic text-center rounded-xl shadow-inner">
                         <Quote className="absolute top-4 left-6 w-12 h-12 opacity-20 text-amber-600" />
                         <p className="text-xl lg:text-3xl font-black leading-tight uppercase tracking-tighter text-amber-950 dark:text-amber-100 relative z-10 px-6">
                           "{article.quote || article.quote}"
                         </p>
                         <Quote className="absolute bottom-4 right-6 w-12 h-12 opacity-20 text-amber-600 rotate-180" />
                      </div>
                    )}

                    {/* SHARE & NAVIGASI BAWAH */}
                    <div className="flex flex-col items-center gap-10 pt-8 border-t border-black/5">
                      <div className="flex flex-col items-center gap-4 w-full">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">BAGIKAN WARTA</span>
                        <div className="flex gap-5">
                          <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-3.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-md">
                            <MessageCircle className="w-5 h-5" />
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-3.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-md">
                            <Facebook className="w-5 h-5" />
                          </a>
                          <button onClick={() => {
                            if(navigator.share) {
                                navigator.share({ title: article.title, url: shareUrl });
                            } else {
                                alert("Link disalin ke clipboard!");
                                navigator.clipboard.writeText(shareUrl);
                            }
                          }} className="p-3.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full pt-2 flex justify-center">
                        <Button 
                          onClick={() => setSelectedSlug(null)}
                          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-10 h-12 font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:scale-105 transition-transform gap-3"
                        >
                          <ArrowLeft className="w-4 h-4" /> KEMBALI KE BERANDA
                        </Button>
                      </div>
                    </div>
                  </article>
                )}
              </div>

              {/* GULUNGAN BAWAH */}
              <div className="w-full max-w-4xl h-16 bg-amber-500 dark:bg-amber-600 rounded-full shadow-2xl relative z-10 border-t-4 border-amber-700/30 flex items-center justify-center overflow-hidden mb-16">
                 <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                 <div className="w-24 h-1 bg-white/30 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
