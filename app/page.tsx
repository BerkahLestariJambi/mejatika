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
import { Calendar, User, Loader2, ChevronRight, ChevronLeft, X } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) 

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null)
      setCurrentPage(0)
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

  // Fungsi memotong konten agar pas di halaman tinggi tanpa scroll
  // Kita gunakan batas 1200 karakter untuk ukuran modal besar
  const paginateContent = (text: string) => {
    if (!text || typeof text !== 'string') return [];
    const pageSize = 1200; 
    const regex = new RegExp(`[\\s\\S]{1,${pageSize}}(?:\\s|$)`, 'g');
    return text.match(regex) || [text];
  }

  const pages = article ? paginateContent(article.content) : [];
  const totalSteps = Math.ceil((pages.length + 1) / 2); // +1 karena halaman pertama kiri dipakai judul

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-6">
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
        {/* UKURAN MODAL DIBUAT SANGAT BESAR (90vh & 7xl) */}
        <DialogContent className="max-w-7xl w-[98vw] h-[92vh] p-0 bg-transparent border-none shadow-none outline-none overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="flex flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative border border-white/10">
              
              {/* --- TOMBOL CLOSE CUSTOM --- */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-8 z-50 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors dark:bg-white/5"
              >
                <X className="w-6 h-6" />
              </button>

              {/* --- SISI KIRI --- */}
              <div className="flex-1 h-full flex flex-col border-r border-black/5 relative">
                <div className="flex-grow p-12 lg:p-20 overflow-hidden">
                  {currentPage === 0 ? (
                    /* HALAMAN 1: JUDUL & GAMBAR */
                    <div className="flex flex-col h-full">
                      <div className="space-y-6">
                        <Badge className="w-fit uppercase tracking-widest font-black px-4 py-1.5 text-[11px]">
                          {article.category?.name || "SPECIAL REPORT"}
                        </Badge>
                        <h1 className="text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tighter text-foreground italic">
                          {article.title}
                        </h1>
                        <div className="flex items-center gap-6 text-[11px] font-bold opacity-40 uppercase tracking-[0.2em] border-y py-4">
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="flex items-center gap-2"><User className="w-4 h-4" /> {article.user?.name || "ADMIN"}</span>
                        </div>
                      </div>
                      <div className="mt-10 relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                        <img src={article.image} className="w-full h-full object-cover" alt="img" />
                      </div>
                    </div>
                  ) : (
                    /* HALAMAN BERIKUTNYA (SISI KIRI) */
                    <div className="prose prose-lg dark:prose-invert text-justify leading-relaxed antialiased">
                      {pages[currentPage * 2 - 1]}
                    </div>
                  )}
                </div>
                <div className="p-10 border-t text-[10px] font-black opacity-20 tracking-[0.4em] flex justify-between">
                  <span>MEJATIKA OFFICIAL</span>
                  <span>HAL. {currentPage * 2 + 1}</span>
                </div>
              </div>

              {/* SPINE (GARIS TENGAH) */}
              <div className="w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-30">
                <div className="absolute top-0 bottom-0 -left-10 w-20 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.02] to-transparent pointer-events-none" />
              </div>

              {/* --- SISI KANAN --- */}
              <div className="flex-1 h-full flex flex-col bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="flex-grow p-12 lg:p-20 overflow-hidden">
                  <div className="prose prose-lg dark:prose-invert text-justify leading-relaxed antialiased">
                    {/* HALAMAN SISI KANAN (Selalu menampilkan urutan genap dari konten) */}
                    {pages[currentPage * 2] || <p className="opacity-10 italic">Halaman sengaja dikosongkan.</p>}
                  </div>
                </div>

                <div className="p-10 border-t flex justify-between items-center bg-transparent">
                  <span className="text-[10px] font-black opacity-20 tracking-[0.4em]">HAL. {currentPage * 2 + 2}</span>
                  
                  <div className="flex gap-4">
                    {currentPage > 0 && (
                      <Button onClick={() => setCurrentPage(v => v - 1)} variant="outline" className="rounded-xl h-14 px-8 font-black uppercase text-xs tracking-widest border-2">
                        <ChevronLeft className="w-5 h-5 mr-2" /> PREV
                      </Button>
                    )}
                    {(currentPage + 1) < totalSteps && (
                      <Button 
                        onClick={() => setCurrentPage(v => v + 1)} 
                        className="rounded-xl h-14 px-8 bg-primary shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all font-black text-xs tracking-widest uppercase flex items-center gap-3"
                      >
                        NEXT PAGE <ChevronRight className="w-5 h-5" />
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
