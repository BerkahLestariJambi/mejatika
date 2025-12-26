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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* Kontainer Utama Modal dengan Perspektif */}
        <DialogContent className="max-w-[95vw] md:max-w-7xl h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full max-w-4xl h-[60vh] flex items-center justify-center rounded-3xl shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="w-full h-full flex flex-col md:flex-row items-stretch gap-0 perspective-[2000px]">
              
              {/* HALAMAN KIRI (Cover/Text Awal) */}
              <div 
                className="flex-1 bg-white dark:bg-zinc-950 p-8 md:p-14 shadow-2xl transition-all duration-500 origin-right
                rounded-l-3xl md:rounded-r-none border-r border-zinc-200 dark:border-zinc-800
                flex flex-col relative overflow-hidden h-full"
                style={{ transform: "rotateY(5deg)" }}
              >
                {/* Efek Gradasi Lipatan Dalam */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/[0.05] dark:from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-y-auto flex-grow pr-4 custom-scrollbar">
                  <Badge className="mb-6 uppercase font-bold tracking-widest">{article.category?.name || "BERITA"}</Badge>
                  <h1 className="text-3xl md:text-5xl font-black italic uppercase leading-tight mb-8 text-foreground tracking-tighter">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-6 mb-8">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.user?.name || "ADMIN"}</span>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none text-justify leading-relaxed">
                    {currentPage === 1 ? splitContent(article.content)[0] : <p className="opacity-30 italic">Bagian awal artikel...</p>}
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between items-center text-[10px] font-bold opacity-50">
                  <span>MEJATIKA DIGITAL MAGAZINE</span>
                  <span>HAL. {currentPage === 1 ? "01" : "03"}</span>
                </div>
              </div>

              {/* HALAMAN KANAN (Image/Text Lanjutan) */}
              <div 
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 p-8 md:p-14 shadow-2xl transition-all duration-500 origin-left
                rounded-r-3xl md:rounded-l-none border-l border-zinc-200 dark:border-zinc-800
                flex flex-col relative overflow-hidden h-full"
                style={{ transform: "rotateY(-5deg)" }}
              >
                {/* Efek Gradasi Lipatan Dalam */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/[0.05] dark:from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-y-auto flex-grow pr-4 custom-scrollbar">
                  {currentPage === 1 ? (
                    <div className="flex flex-col justify-center h-full">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-8 ring-white dark:ring-zinc-800 mb-8">
                        <img 
                          src={article.image || "/placeholder.svg"} 
                          className="w-full h-full object-cover" 
                          alt="content" 
                        />
                      </div>
                      <div className="text-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                        <p className="text-sm font-bold text-muted-foreground uppercase italic tracking-widest">
                          Gunakan tombol di bawah untuk membalik halaman
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify leading-relaxed">
                      {splitContent(article.content)[1]}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex justify-between items-center mt-4">
                  <span className="text-[10px] font-bold opacity-50 uppercase font-mono">HAL. {currentPage === 1 ? "02" : "04"}</span>
                  
                  <div className="flex gap-4">
                    {currentPage === 2 && (
                      <Button onClick={() => setCurrentPage(1)} variant="secondary" className="rounded-full px-6 font-bold">
                        <ChevronLeft className="mr-2 w-5 h-5" /> KEMBALI
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button 
                        onClick={() => setCurrentPage(2)} 
                        className="rounded-full h-16 w-16 bg-primary shadow-xl hover:scale-110 transition-transform active:scale-90"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Spine (Punggung Buku Tengah) */}
              <div className="absolute left-1/2 top-4 bottom-4 w-4 -translate-x-1/2 bg-gradient-to-r from-black/10 via-white/20 to-black/10 dark:from-black/40 dark:via-white/5 dark:to-black/40 z-20 hidden md:block rounded-full shadow-inner" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
