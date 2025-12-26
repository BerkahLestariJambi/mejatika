"use client"

import { useState, useEffect } from "react"
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
    const part1 = text.match(/[\s\S]{1,900}(?=\s|$)/g) || [text];
    const remaining = text.substring(part1[0].length);
    const otherParts = remaining.match(/[\s\S]{1,1100}(?=\s|$)/g) || [""];
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
        <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[85vh] p-0 bg-transparent border-none shadow-none outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl shadow-2xl text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="flex flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative">
              
              {/* --- HALAMAN KIRI --- */}
              <div className="flex-1 h-full flex flex-col border-r border-black/10 relative overflow-hidden">
                <div className="flex-grow p-10 lg:p-14 overflow-hidden">
                  {currentPage === 1 ? (
                    <div className="space-y-6">
                      <Badge className="w-fit uppercase tracking-widest font-bold px-3 py-1 text-[10px]">{article.category?.name || "REPORT"}</Badge>
                      <h1 className="text-xl lg:text-3xl font-black uppercase leading-tight italic tracking-tighter">{article.title}</h1>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md ring-1 ring-black/5">
                        <img src={article.image} className="w-full h-full object-cover" alt="cover" />
                      </div>
                      
                      {/* --- KUTIPAN (QUOTE) DARI BACKEND --- */}
                      {article.quote && (
                        <div className="relative py-4 px-6 border-l-4 border-primary bg-primary/5 rounded-r-xl italic">
                          <Quote className="absolute top-2 right-2 w-8 h-8 opacity-10 text-primary" />
                          <p className="text-sm lg:text-base font-medium text-foreground/80 leading-relaxed">
                            "{article.quote}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-[9px] font-bold uppercase text-muted-foreground tracking-widest border-t pt-4">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID")}</span>
                        <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-primary" /> {article.user?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-justify leading-relaxed">
                      {getPagedContent(article.content)[1]}
                    </div>
                  )}
                </div>

                {/* Footer Kiri (Simetris h-20) */}
                <div className="h-20 px-10 lg:px-14 border-t flex items-center justify-between text-[10px] font-black opacity-30 tracking-[0.3em] uppercase">
                   <span>MEJATIKA DIGITAL</span>
                   <span>PAGE {currentPage === 1 ? "01" : "03"}</span>
                </div>
              </div>

              {/* SPINE */}
              <div className="w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-20">
                 <div className="absolute top-0 bottom-0 -left-6 w-12 bg-gradient-to-r from-black/[0.03] via-transparent to-black/[0.03] pointer-events-none" />
              </div>

              {/* --- HALAMAN KANAN --- */}
              <div className="flex-1 h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10 relative overflow-hidden">
                <div className="flex-grow p-10 lg:p-14 pb-32 lg:pb-40 overflow-hidden">
                  <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none text-justify leading-relaxed">
                    {currentPage === 1 ? (
                      getPagedContent(article.content)[0]
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <div>{getPagedContent(article.content)[2]}</div>
                        
                        {/* Pesan Penutup & Fitur Share */}
                        <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-4">
                          <p className="font-black italic text-primary uppercase tracking-tighter text-base lg:text-lg">Terima kasih sudah membaca!</p>
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                              <Share2 className="w-3 h-3" /> Bagikan:
                            </span>
                            <div className="flex gap-4">
                              <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" className="p-2 hover:text-green-500 transition-colors"><MessageCircle className="w-5 h-5" /></a>
                              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="p-2 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5" /></a>
                              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${shareUrl}`} target="_blank" className="p-2 hover:text-sky-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Kanan (Simetris h-20) */}
                <div className="absolute bottom-0 left-0 right-0 h-20 px-10 lg:px-14 bg-gradient-to-t from-white via-white dark:from-zinc-950 flex items-center justify-between z-50">
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">PAGE {currentPage === 1 ? "02" : "04"}</span>
                  <div className="flex gap-3">
                    {currentPage === 2 && (
                      <Button onClick={() => setCurrentPage(1)} variant="outline" size="sm" className="rounded-full font-bold uppercase text-[9px] px-6 h-9 border-2">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button onClick={() => setCurrentPage(2)} className="rounded-xl h-10 px-6 bg-primary font-black text-[9px] tracking-widest uppercase">
                        Halaman Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
