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

  // Fungsi pemotong konten menjadi dua bagian seimbang
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
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="flex flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
              
              {/* === HALAMAN KIRI === */}
              <div className="flex-1 h-full flex flex-col border-r border-black/10 relative">
                <div className="flex-grow overflow-y-auto p-10 lg:p-16 custom-scrollbar">
                  {currentPage === 1 ? (
                    /* COVER: JUDUL SAJA */
                    <div className="h-full flex flex-col justify-center">
                      <Badge className="w-fit mb-6 uppercase tracking-[0.2em] font-bold px-4 py-1">
                        {article.category?.name || "LATEST NEWS"}
                      </Badge>
                      <h1 className="text-4xl lg:text-6xl font-black italic uppercase leading-[0.9] mb-10 tracking-tighter text-foreground">
                        {article.title}
                      </h1>
                      <div className="flex flex-col gap-3 text-[11px] font-bold uppercase text-muted-foreground border-l-4 border-primary pl-4 tracking-widest">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> BY {article.user?.name || "ADMIN MEJATIKA"}</span>
                      </div>
                    </div>
                  ) : (
                    /* KONTEN BAGIAN 1 */
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify antialiased">
                      {splitContent(article.content)[0]}
                    </div>
                  )}
                </div>

                <div className="p-8 border-t flex justify-between items-center text-[10px] font-black opacity-30 tracking-[0.3em]">
                  <span>MEJATIKA MAGZ</span>
                  <span>{currentPage === 1 ? "VOL. 01" : "PAGE 03"}</span>
                </div>
              </div>

              {/* SPINE (GARIS TENGAH) */}
              <div className="w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-20">
                 <div className="absolute top-0 bottom-0 -left-6 w-12 bg-gradient-to-r from-black/[0.05] via-transparent to-black/[0.05] pointer-events-none" />
              </div>

              {/* === HALAMAN KANAN === */}
              <div className="flex-1 h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10 relative">
                <div className="flex-grow overflow-y-auto p-10 lg:p-16 custom-scrollbar">
                  {currentPage === 1 ? (
                    /* COVER: GAMBAR SAJA */
                    <div className="h-full flex flex-col justify-center items-center">
                      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5">
                        <img 
                          src={article.image || "/placeholder.svg"} 
                          className="w-full h-full object-cover" 
                          alt="cover-image" 
                        />
                      </div>
                    </div>
                  ) : (
                    /* KONTEN BAGIAN 2 */
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify antialiased">
                      {splitContent(article.content)[1]}
                    </div>
                  )}
                </div>

                <div className="p-8 border-t flex justify-between items-center">
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{currentPage === 1 ? "COVER ISSUE" : "PAGE 04"}</span>
                  
                  <div className="flex gap-4">
                    {currentPage === 2 && (
                      <Button onClick={() => setCurrentPage(1)} variant="outline" className="rounded-full font-bold uppercase text-[10px] px-8 h-10 border-2">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Kembali ke Judul
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button 
                        onClick={() => setCurrentPage(2)} 
                        className="rounded-2xl h-14 px-8 bg-primary shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-xs tracking-widest uppercase"
                      >
                        Buka Artikel <ChevronRight className="w-5 h-5" />
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
