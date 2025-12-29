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
import { Calendar, User, Loader2, ChevronRight, ChevronLeft, Quote, ArrowLeft, Share2 } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug) {
      setLoadingDetail(true)
      setCurrentPage(1)
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

  const getPagedContent = (htmlContent: string) => {
    if (!htmlContent) return ["", "", ""];
    const cleanText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const part1 = cleanText.match(/[\s\S]{1,700}(?=\s|$)/g) || [cleanText];
    const remaining = cleanText.substring(part1[0].length);
    const otherParts = remaining.match(/[\s\S]{1,850}(?=\s|$)/g) || ["", ""];
    return [part1[0] || "", otherParts[0] || "", otherParts[1] || ""];
  }

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-6 lg:py-10">
        <RunningText />

        <AnimatePresence mode="wait">
          {!selectedSlug ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
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
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center px-2">
                <Button 
                  onClick={() => setSelectedSlug(null)}
                  variant="ghost" 
                  className="group gap-2 hover:bg-primary/10 font-black uppercase text-[10px] tracking-[0.2em]"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> KEMBALI
                </Button>
              </div>

              {/* Magazine Frame */}
              <div className="w-full min-h-[85vh] flex flex-col lg:flex-row bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden border border-black/5 relative">
                
                {loadingDetail ? (
                  <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : article && (
                  <>
                    {/* HALAMAN KIRI */}
                    <div className="flex-1 h-full flex flex-col border-r border-black/5 relative">
                      <div className="flex-grow p-8 lg:p-16">
                        {currentPage === 1 ? (
                          <div className="space-y-8">
                            <Badge className="bg-primary text-white border-none uppercase tracking-[0.2em] font-black text-[9px] px-3 py-1.5">{article.category?.name}</Badge>
                            <h1 className="text-3xl lg:text-5xl font-black uppercase leading-tight italic tracking-tighter">{article.title}</h1>
                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-4 ring-zinc-50 dark:ring-zinc-900">
                              <img src={article.image} className="w-full h-full object-cover" alt="cover" />
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-t border-black/5 pt-8">
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.user?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300 first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85]">
                            {getPagedContent(article.content)[1]}
                          </div>
                        )}
                      </div>

                      {/* FOOTER KIRI: DISEJAJARKAN */}
                      <div className="h-24 px-16 pb-8 flex items-end justify-between text-[10px] font-black opacity-30 tracking-[0.4em] uppercase">
                         <span>MEJATIKA DIGITAL</span>
                         <span>P. {currentPage === 1 ? "01" : "03"}</span>
                      </div>
                    </div>

                    {/* SPINE */}
                    <div className="hidden lg:block w-[1px] h-full bg-black/5 relative z-10" />

                    {/* HALAMAN KANAN */}
                    <div className="flex-1 h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10">
                      <div className="flex-grow p-8 lg:p-16">
                        {currentPage === 1 ? (
                          <div className="text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300 first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-[0.85]">
                            {getPagedContent(article.content)[0]}
                          </div>
                        ) : (
                          <div className="space-y-10">
                            <div className="text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300">
                              {getPagedContent(article.content)[2]}
                            </div>
                            
                            {/* QUOTE DISPLAY */}
                            {article.quote && (
                              <div className="relative py-10 px-12 border-l-[10px] border-primary bg-white dark:bg-zinc-900 rounded-r-[3rem] shadow-xl italic">
                                <Quote className="absolute top-4 right-6 w-12 h-12 opacity-10 text-primary rotate-180" />
                                <p className="text-xl font-black leading-snug uppercase tracking-tighter">"{article.quote}"</p>
                                <div className="mt-4 flex items-center gap-2">
                                  <div className="h-0.5 w-6 bg-primary" />
                                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Kutipan Berita</span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col items-center gap-4 pt-10 opacity-30">
                              <span className="text-[10px] font-black uppercase tracking-[0.5em]">FINISH READING</span>
                              <div className="flex items-center gap-4">
                                 <Share2 className="w-4 h-4" />
                                 <div className="h-[1px] w-20 bg-black/20" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* FOOTER KANAN: DISEJAJARKAN DENGAN KIRI */}
                      <div className="h-24 px-16 pb-8 flex items-end justify-between bg-transparent">
                        <span className="text-[10px] font-black opacity-30 tracking-[0.4em] uppercase">P. {currentPage === 1 ? "02" : "04"}</span>
                        
                        <div className="flex gap-4">
                          {currentPage === 1 ? (
                            <Button 
                              onClick={() => { setCurrentPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                              className="rounded-full h-11 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[9px] tracking-widest uppercase"
                            >
                              HALAMAN BERIKUTNYA <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                              variant="outline"
                              className="rounded-full h-11 px-8 border-2 font-black text-[9px] tracking-widest uppercase"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" /> KEMBALI
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
