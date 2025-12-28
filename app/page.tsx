"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Calendar, User, Loader2, ChevronRight, ChevronLeft, Share2, Facebook, Twitter, MessageCircle, Quote } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null)
      setCurrentPage(1)
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

  const getPagedContent = (text: string) => {
    if (!text || typeof text !== 'string') return ["", "", ""];
    // Distribusi konten yang lebih seimbang untuk layout majalah
    const part1 = text.match(/[\s\S]{1,800}(?=\s|$)/g) || [text];
    const remaining = text.substring(part1[0].length);
    const otherParts = remaining.match(/[\s\S]{1,1000}(?=\s|$)/g) || [""];
    return [part1[0] || "", otherParts[0] || "", otherParts[1] || ""];
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
            <div className="flex flex-col lg:flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-2xl lg:rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/5 relative">
              
              {/* --- HALAMAN KIRI (Tampak di Mobile hanya jika page 1) --- */}
              <AnimatePresence mode="wait">
                {(currentPage === 1 || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex-1 h-full flex flex-col border-r border-black/5 relative overflow-hidden ${currentPage === 2 ? 'hidden lg:flex' : 'flex'}`}
                  >
                    <div className="flex-grow p-6 lg:p-14 overflow-y-auto lg:overflow-hidden scrollbar-hide">
                      {currentPage === 1 ? (
                        <div className="space-y-5 lg:space-y-6">
                          <Badge className="w-fit uppercase tracking-widest font-bold px-3 py-1 text-[10px]">{article.category?.name}</Badge>
                          <h1 className="text-xl lg:text-3xl font-black uppercase leading-tight italic tracking-tighter">{article.title}</h1>
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5">
                            <img src={article.image} className="w-full h-full object-cover" alt="cover" />
                          </div>
                          <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[9px] font-bold uppercase text-muted-foreground tracking-widest border-t pt-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID")}</span>
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-primary" /> {article.user?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-justify leading-relaxed">
                          <div dangerouslySetInnerHTML={{ __html: getPagedContent(article.content)[1] }} />
                        </div>
                      )}
                    </div>

                    <div className="h-16 lg:h-20 px-6 lg:px-14 border-t flex items-center justify-between text-[8px] lg:text-[10px] font-black opacity-30 tracking-[0.2em] lg:tracking-[0.3em] uppercase bg-zinc-50/50">
                       <span>MEJATIKA DIGITAL</span>
                       <span>PAGE {currentPage === 1 ? "01" : "03"}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SPINE (Desktop Only) */}
              <div className="hidden lg:block w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-20">
                 <div className="absolute top-0 bottom-0 -left-6 w-12 bg-gradient-to-r from-black/[0.03] via-transparent to-black/[0.03] pointer-events-none" />
              </div>

              {/* --- HALAMAN KANAN (Tampak di Mobile hanya jika page 2) --- */}
              <AnimatePresence mode="wait">
                {(currentPage === 2 || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex-1 h-full flex flex-col bg-zinc-50/30 dark:bg-zinc-900/10 relative overflow-hidden ${currentPage === 1 ? 'hidden lg:flex' : 'flex'}`}
                  >
                    <div className="flex-grow p-6 lg:p-14 pb-32 lg:pb-40 overflow-y-auto lg:overflow-hidden scrollbar-hide">
                      <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-justify leading-relaxed">
                        {currentPage === 1 ? (
                          <div dangerouslySetInnerHTML={{ __html: getPagedContent(article.content)[0] }} />
                        ) : (
                          <div className="flex flex-col gap-6">
                            <div dangerouslySetInnerHTML={{ __html: getPagedContent(article.content)[2] }} />
                            
                            {article.quote && (
                              <div className="relative py-4 px-6 border-l-4 border-primary bg-primary/5 rounded-r-xl italic shadow-sm mt-4">
                                <Quote className="absolute top-2 right-3 w-6 h-6 opacity-10 text-primary" />
                                <p className="text-sm font-medium text-foreground/80">"{article.quote}"</p>
                              </div>
                            )}

                            <p className="font-black italic text-primary uppercase tracking-tighter text-center py-2 border-y border-primary/10 text-[10px]">
                              Terima kasih sudah membaca!
                            </p>

                            <div className="bg-white dark:bg-zinc-900 border border-black/5 rounded-2xl p-4 shadow-sm flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <Share2 className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black uppercase opacity-60">Share</span>
                              </div>
                              <div className="flex gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-green-500 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${shareUrl}`} target="_blank" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-sky-400 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STICKY NAVIGATION BAR (Mobile & Desktop) */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 px-6 lg:px-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-between z-50 border-t lg:bg-transparent lg:border-none">
                      <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">PAGE {currentPage === 1 ? "02" : "04"}</span>
                      <div className="flex gap-3">
                        {currentPage === 2 && (
                          <Button onClick={() => setCurrentPage(1)} variant="outline" size="sm" className="rounded-full font-bold uppercase text-[9px] px-6 h-9 border-2 bg-background shadow-sm">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                          </Button>
                        )}
                        {currentPage === 1 && (
                          <Button onClick={() => setCurrentPage(2)} className="rounded-xl h-10 px-6 bg-primary font-black text-[9px] tracking-widest uppercase shadow-lg shadow-primary/20">
                            Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
