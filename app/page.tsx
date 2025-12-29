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
              <div className="w-full max-w-4xl flex mb-4">
                <Button 
                  onClick={() => setSelectedSlug(null)}
                  variant="ghost" 
                  className="group gap-2 font-black uppercase text-[10px] tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> KEMBALI
                </Button>
              </div>

              {/* GULUNGAN ATAS BATIK */}
              <div className="w-full max-w-4xl relative z-30">
                <div className="w-full h-16 bg-zinc-900 dark:bg-black rounded-full shadow-2xl flex items-center justify-between px-12 relative overflow-hidden border-b-4 border-primary/20">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] z-10">MEJATIKA</span>
                  <div className="flex gap-1 z-10">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40" />)}
                  </div>
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] z-10 italic">Warta Digital</span>
                </div>
              </div>

              {/* BODY KERTAS */}
              <div className="w-full max-w-[92%] lg:max-w-[850px] bg-[#fefdfa] dark:bg-zinc-950 shadow-2xl px-8 lg:px-20 py-20 -mt-8 relative border-x border-black/5 z-20">
                
                {loadingDetail ? (
                  <div className="h-[40vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : article && (
                  <article className="space-y-12">
                    <header className="space-y-6 text-center">
                      <Badge className="bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.4em] font-black text-[10px] px-5 py-2 mx-auto">
                        {article.category?.name || "BERITA"}
                      </Badge>
                      <h1 className="text-4xl lg:text-6xl font-black uppercase leading-[1.1] italic tracking-tighter">
                        {article.title}
                      </h1>
                      
                      {/* PENULIS / AUTHOR - DIPASTIKAN MUNCUL */}
                      <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] border-y border-black/5 py-5">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                          <User className="w-4 h-4 text-primary" /> {article.user?.name || "Admin Mejatika"}
                        </span>
                      </div>
                    </header>

                    <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-2xl">
                      <img src={article.image} className="w-full h-full object-cover" alt="main" />
                    </div>

                    <div className="text-xl lg:text-2xl leading-[1.9] text-justify text-zinc-800 dark:text-zinc-200 first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2">
                      {getCleanContent(article.content)}
                    </div>

                    {/* QUOTE - DENGAN PENGECEKAN DATA */}
                    {article.quote && (
                      <div className="relative py-14 px-10 lg:px-16 border-y-2 border-dashed border-primary/20 bg-zinc-50/50 dark:bg-white/5 italic text-center">
                         <Quote className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 opacity-10 text-primary rotate-180" />
                         <p className="text-2xl lg:text-4xl font-black leading-tight uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">
                           "{article.quote}"
                         </p>
                      </div>
                    )}

                    {/* TOMBOL SHARE - DIPASTIKAN MUNCUL */}
                    <div className="flex flex-col items-center gap-6 pt-10 border-t border-black/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic text-primary">Bagikan Warta</span>
                      <div className="flex gap-4">
                        <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:text-green-500 transition-all shadow-sm">
                          <MessageCircle className="w-6 h-6" />
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:text-blue-600 transition-all shadow-sm">
                          <Facebook className="w-6 h-6" />
                        </a>
                        <button onClick={() => navigator.share?.({ title: article.title, url: shareUrl })} className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:text-primary transition-all shadow-sm">
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.6em] opacity-20">MEJATIKA PRESS © 2025</p>
                    </div>
                  </article>
                )}
              </div>

              {/* GULUNGAN BAWAH */}
              <div className="w-full max-w-4xl h-16 bg-zinc-900 dark:bg-black rounded-full shadow-2xl relative z-10 border-t-4 border-primary/20 flex items-center justify-center overflow-hidden mb-16">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                 <div className="w-32 h-1 bg-primary/20 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
