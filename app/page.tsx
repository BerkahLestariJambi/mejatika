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
import { Calendar, User, Loader2, ChevronRight, ChevronLeft, Share2, Facebook, Twitter, MessageCircle, Quote, ArrowLeft } from "lucide-react"

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
      setArticle(null)
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

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
  }

  const handleBackToList = () => {
    setSelectedSlug(null)
    setArticle(null)
  }

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
            /* --- TAMPILAN LIST BERITA UTAMA --- */
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6"
            >
              <div className="lg:col-span-2 space-y-8">
                <NewsSlider onReadMore={handleOpenDetail} />
                <NewsList onReadMore={handleOpenDetail} />
              </div>
              <div className="lg:col-span-1">
                <ScheduleSidebar />
              </div>
            </motion.div>
          ) : (
            /* --- TAMPILAN HALALMAN BERITA (MAGAZINE STYLE) --- */
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 flex flex-col gap-6"
            >
              <Button 
                onClick={handleBackToList}
                variant="ghost" 
                className="w-fit gap-2 hover:bg-primary/10 font-bold uppercase text-xs tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
              </Button>

              <div className="w-full min-h-[75vh] lg:h-[80vh] flex flex-col lg:flex-row bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/5 relative">
                
                {loadingDetail ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : article && (
                  <>
                    {/* HALAMAN KIRI (VISUAL) */}
                    <div className="flex-1 h-full flex flex-col border-r border-black/5 relative">
                      <div className="flex-grow p-8 lg:p-14">
                        {currentPage === 1 ? (
                          <div className="space-y-6">
                            <Badge className="bg-primary/10 text-primary border-none uppercase tracking-[0.2em] font-black text-[9px] px-3 py-1.5">
                              {article.category?.name}
                            </Badge>
                            <h1 className="text-2xl lg:text-4xl font-black uppercase leading-tight italic tracking-tighter text-zinc-900 dark:text-white">
                              {article.title}
                            </h1>
                            <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                              <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-t border-black/5 pt-6">
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.user?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-base lg:text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300 first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left"
                          >
                            {getPagedContent(article.content)[1]}
                          </motion.div>
                        )}
                      </div>
                      <div className="h-20 px-14 border-t border-black/5 flex items-center justify-between text-[10px] font-black opacity-20 tracking-[0.4em] uppercase">
                         <span>MEJATIKA</span>
                         <span>P. {currentPage === 1 ? "01" : "03"}</span>
                      </div>
                    </div>

                    {/* SPINE (Garis Tengah Buku) */}
                    <div className="hidden lg:block w-[1px] h-full bg-black/5 relative z-10">
                       <div className="absolute inset-0 -left-10 w-20 bg-gradient-to-r from-black/[0.02] via-transparent to-black/[0.02] pointer-events-none" />
                    </div>

                    {/* HALAMAN KANAN (KONTEN) */}
                    <div className="flex-1 h-full flex flex-col bg-zinc-50/30 dark:bg-zinc-900/10">
                      <div className="flex-grow p-8 lg:p-14 relative">
                        <div className="text-base lg:text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {currentPage === 1 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              {getPagedContent(article.content)[0]}
                            </motion.div>
                          ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                              <p>{getPagedContent(article.content)[2]}</p>
                              {article.quote && (
                                <div className="relative py-8 px-10 border-l-4 border-primary bg-primary/5 rounded-r-[2rem] italic shadow-inner">
                                  <Quote className="absolute top-4 right-6 w-12 h-12 opacity-10 text-primary" />
                                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">"{article.quote}"</p>
                                </div>
                              )}
                              <div className="flex flex-col items-center gap-4 py-6">
                                <span className="h-[1px] w-20 bg-primary/20" />
                                <p className="font-black italic text-primary uppercase tracking-widest text-[10px]">Terima kasih sudah membaca</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* NAVIGASI HALAMAN & FOOTER HALAMAN KANAN */}
                      <div className="h-24 px-8 lg:px-14 border-t border-black/5 flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
                        <span className="text-[10px] font-black opacity-20 tracking-[0.4em]">P. {currentPage === 1 ? "02" : "04"}</span>
                        
                        <div className="flex gap-4">
                          <AnimatePresence mode="wait">
                            {currentPage === 1 ? (
                              <motion.div key="next" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <Button 
                                  onClick={() => setCurrentPage(2)} 
                                  className="rounded-2xl h-12 px-8 bg-primary hover:scale-105 transition-transform font-black text-[10px] tracking-[0.2em] uppercase text-white shadow-xl shadow-primary/20"
                                >
                                  Halaman Berikutnya <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div key="prev" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <Button 
                                  onClick={() => setCurrentPage(1)} 
                                  variant="outline"
                                  className="rounded-2xl h-12 px-8 border-2 font-black text-[10px] tracking-[0.2em] uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <ChevronLeft className="w-5 h-5 mr-2" /> Kembali
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
