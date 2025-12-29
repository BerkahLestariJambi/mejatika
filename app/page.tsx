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
import { Calendar, User, Loader2, Quote, ArrowLeft, Share2, ChevronDown } from "lucide-react"

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

  // Membersihkan HTML untuk konten tunggal
  const getCleanContent = (htmlContent: string) => {
    if (!htmlContent) return "";
    return htmlContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

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
            /* --- DESAIN KERTAS GULUNG TUNGGAL --- */
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="mt-6 flex flex-col items-center"
            >
              <div className="w-full max-w-4xl flex flex-col gap-4 mb-6">
                <Button 
                  onClick={() => setSelectedSlug(null)}
                  variant="ghost" 
                  className="w-fit group gap-2 hover:bg-white/50 font-black uppercase text-[10px] tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> KEMBALI KE BERANDA
                </Button>
              </div>

              {/* ORNAMEN GULUNGAN ATAS */}
              <div className="w-full max-w-4xl h-8 bg-zinc-200 dark:bg-zinc-800 rounded-t-full shadow-inner relative z-10 border-b-4 border-black/5">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full blur-sm opacity-50" />
              </div>

              {/* BODY KERTAS */}
              <div className="w-full max-w-[95%] lg:max-w-4xl bg-[#fdfcf8] dark:bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-8 lg:px-20 py-12 lg:py-20 relative border-x border-black/5">
                
                {loadingDetail ? (
                  <div className="h-[40vh] flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : article && (
                  <article className="space-y-12">
                    {/* Header Berita */}
                    <header className="space-y-6 text-center">
                      <Badge className="bg-primary text-white border-none uppercase tracking-[0.3em] font-black text-[10px] px-4 py-2 mx-auto">
                        {article.category?.name}
                      </Badge>
                      <h1 className="text-3xl lg:text-6xl font-black uppercase leading-[1.1] italic tracking-tighter text-zinc-900 dark:text-white">
                        {article.title}
                      </h1>
                      <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] border-y border-black/5 py-4">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.user?.name}</span>
                      </div>
                    </header>

                    {/* Gambar Utama */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
                      <img src={article.image} className="w-full h-full object-cover" alt="main" />
                    </div>

                    {/* Konten dengan Drop Cap */}
                    <div className="text-xl leading-[1.8] text-justify text-zinc-800 dark:text-zinc-200 first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] selection:bg-primary selection:text-white">
                      {getCleanContent(article.content)}
                    </div>

                    {/* Quote Section */}
                    {article.quote && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative py-12 px-10 lg:px-20 border-y-2 border-primary/20 bg-zinc-50/50 dark:bg-white/5 italic text-center"
                      >
                        <Quote className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 opacity-10 text-primary rotate-180" />
                        <p className="text-2xl lg:text-4xl font-black leading-tight uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">
                          "{article.quote}"
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                          <div className="h-[2px] w-8 bg-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">EDITORIAL HIGHLIGHT</span>
                          <div className="h-[2px] w-8 bg-primary" />
                        </div>
                      </motion.div>
                    )}

                    {/* Footer Content */}
                    <div className="flex flex-col items-center gap-8 pt-10 border-t border-black/5">
                      <div className="flex items-center gap-4 opacity-30">
                        <div className="h-[1px] w-20 bg-current" />
                        <Share2 className="w-5 h-5" />
                        <div className="h-[1px] w-20 bg-current" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-20 text-center">
                        MEJATIKA DIGITAL PRESS © 2025
                      </p>
                    </div>
                  </article>
                )}
              </div>

              {/* ORNAMEN GULUNGAN BAWAH */}
              <div className="w-full max-w-4xl h-10 bg-zinc-200 dark:bg-zinc-800 rounded-b-[2rem] shadow-2xl relative border-t-4 border-black/5 mb-10">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-2 bg-black/10 rounded-full blur-[1px]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  )
}
