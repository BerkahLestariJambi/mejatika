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
import { Calendar, User, Loader2, ChevronRight, ChevronLeft } from "lucide-react"

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

  const splitContent = (text: any) => {
    if (!text || typeof text !== 'string') return ["", ""];
    const mid = Math.floor(text.length / 2);
    const lastSpace = text.lastIndexOf(' ', mid);
    const splitIndex = lastSpace !== -1 ? lastSpace : mid;
    return [text.substring(0, splitIndex).trim(), text.substring(splitIndex).trim()];
  }

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
          <div className="lg:col-span-1 text-center items-center">
            <ScheduleSidebar />
          </div>
        </div>
      </main>
      
      <Footer />

      {/* POPUP MODAL UKURAN BESAR (6XL) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-[98vw] h-[90vh] md:h-[85vh] p-0 overflow-hidden border-none bg-transparent shadow-none outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="relative w-full h-full flex flex-col md:flex-row shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden bg-white dark:bg-zinc-950">
              
              {/* HALAMAN 1 (KIRI) */}
              <div className="flex-1 p-8 md:p-14 border-r border-black/5 relative flex flex-col h-full">
                <div className="overflow-y-auto flex-grow custom-scrollbar pr-4">
                  <Badge variant="secondary" className="mb-6 uppercase tracking-widest text-[10px] px-3">
                    {article.category?.name || "Breaking News"}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-[1.1] mb-8 text-foreground tracking-tighter">
                    {article.title}
                  </h1>
                  
                  <div className="flex items-center gap-6 text-[10px] text-muted-foreground mb-10 font-bold uppercase tracking-[0.2em] border-b pb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(article.publishedAt || article.created_at || Date.now()).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      {article.user?.name || "ADMIN MEJATIKA"}
                    </div>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-justify antialiased">
                    {currentPage === 1 
                      ? splitContent(article.content)[0] 
                      : <p className="opacity-50 italic">Halaman ini berisi bagian awal artikel...</p>}
                  </div>
                </div>
                
                <div className="pt-6 border-t flex justify-between items-center bg-white dark:bg-zinc-950 z-10">
                   <span className="text-[10px] font-black italic tracking-widest text-primary">MEJATIKA DIGITAL EDITION</span>
                   <span className="text-xs font-mono font-bold">PAGE. {currentPage === 1 ? "01" : "03"}</span>
                </div>
              </div>

              {/* HALAMAN 2 (KANAN) */}
              <div className="flex-1 p-8 md:p-14 relative flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/20 shadow-[inset_20px_0_40px_rgba(0,0,0,0.02)]">
                <div className="overflow-y-auto flex-grow custom-scrollbar pr-4">
                  {currentPage === 1 ? (
                    <div className="space-y-8 h-full flex flex-col justify-center">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white dark:ring-zinc-800 transition-transform hover:scale-[1.02] duration-500">
                        <img 
                          src={article.image || "/placeholder.svg"} 
                          className="w-full h-full object-cover" 
                          alt="feature" 
                        />
                      </div>
                      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                        <p className="text-sm text-primary font-medium italic leading-relaxed text-center uppercase tracking-tight">
                          Klik panah di bawah untuk melanjutkan membaca bagian kedua artikel.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-justify antialiased">
                      {splitContent(article.content)[1]}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex justify-between items-center mt-4 bg-transparent z-10">
                  <span className="text-xs font-mono font-bold">PAGE. {currentPage === 1 ? "02" : "04"}</span>
                  
                  <div className="flex gap-3">
                    {currentPage === 2 && (
                      <Button size="lg" variant="outline" onClick={() => setCurrentPage(1)} className="rounded-full font-bold text-xs px-6 shadow-sm">
                        <ChevronLeft className="w-4 h-4 mr-2" /> SEBELUMNYA
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button 
                        size="icon" 
                        onClick={() => setCurrentPage(2)} 
                        className="rounded-2xl h-16 w-16 bg-primary hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(var(--primary),0.3)]"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* SPINE (LIPATAN TENGAH) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 dark:bg-white/10 hidden md:block" />
              <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.03] dark:via-white/[0.01] to-transparent hidden md:block pointer-events-none" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
