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
  
  // State navigasi buku
  const [currentPage, setCurrentPage] = useState(0) // 0 = Halaman 1 & 2, 1 = Halaman 3 & 4, dst.

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

  // FUNGSI MAGIC: Membagi teks menjadi potongan-potongan kecil (Pagination)
  // 1200 karakter biasanya pas untuk satu halaman buku tanpa scroll
  const paginateContent = (text: string) => {
    if (!text || typeof text !== 'string') return [];
    const pageSize = 1000; // Batas karakter per halaman agar tidak scroll
    const regex = new RegExp(`[\\s\\S]{1,${pageSize}}(?:\\s|$)`, 'g');
    return text.match(regex) || [text];
  }

  const pages = article ? paginateContent(article.content) : [];
  const maxPages = Math.ceil(pages.length / 2);

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
        <DialogContent className="max-w-6xl w-[95vw] h-[80vh] p-0 bg-transparent border-none shadow-none outline-none overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-3xl shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="flex flex-row w-full h-full bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden relative border border-white/10">
              
              {/* --- SISI KIRI --- */}
              <div className="flex-1 h-full flex flex-col border-r border-black/10">
                <div className="flex-grow p-10 lg:p-14 overflow-hidden">
                  {currentPage === 0 ? (
                    /* HALAMAN 1: JUDUL & GAMBAR */
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-4">
                        <Badge variant="outline" className="text-[10px] tracking-widest uppercase">{article.category?.name}</Badge>
                        <h1 className="text-2xl lg:text-3xl font-black uppercase leading-tight tracking-tighter">
                          {article.title}
                        </h1>
                        <div className="flex items-center gap-4 text-[10px] font-bold opacity-50 uppercase tracking-widest">
                          <span>{new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}</span>
                          <span>•</span>
                          <span>{article.user?.name || "ADMIN"}</span>
                        </div>
                      </div>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                        <img src={article.image} className="w-full h-full object-cover" alt="img" />
                      </div>
                    </div>
                  ) : (
                    /* HALAMAN 3, 5, DST: KONTEN */
                    <div className="prose prose-sm dark:prose-invert text-justify leading-relaxed">
                      {pages[currentPage * 2 - 1]}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t text-[9px] font-bold opacity-30 tracking-[0.2em] flex justify-between">
                  <span>MEJATIKA EDITION</span>
                  <span>HAL. {currentPage * 2 + 1}</span>
                </div>
              </div>

              {/* SPINE */}
              <div className="w-[1px] h-full bg-black/5 relative z-10 shadow-inner" />

              {/* --- SISI KANAN --- */}
              <div className="flex-1 h-full flex flex-col bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="flex-grow p-10 lg:p-14 overflow-hidden">
                  {/* HALAMAN 2, 4, DST: KONTEN */}
                  <div className="prose prose-sm dark:prose-invert text-justify leading-relaxed">
                    {currentPage === 0 ? pages[0] : pages[currentPage * 2]}
                  </div>
                </div>

                <div className="p-6 border-t flex justify-between items-center">
                  <span className="text-[9px] font-bold opacity-30 tracking-[0.2em]">HAL. {currentPage * 2 + 2}</span>
                  
                  <div className="flex gap-2">
                    {currentPage > 0 && (
                      <Button size="icon" variant="outline" onClick={() => setCurrentPage(v => v - 1)} className="rounded-full h-10 w-10">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    )}
                    {(currentPage + 1) < maxPages && (
                      <Button 
                        onClick={() => setCurrentPage(v => v + 1)} 
                        className="rounded-full h-10 px-4 bg-primary text-[10px] font-bold uppercase tracking-widest gap-2"
                      >
                        Berikutnya <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Efek Lipatan Tengah (Visual Saja) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-20 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent pointer-events-none" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
