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

  // Fungsi membagi konten menjadi 3 bagian (untuk halaman 1-kanan, 2-kiri, 2-kanan)
  const getPagedContent = (text: string) => {
    if (!text || typeof text !== 'string') return ["", "", ""];
    const parts = text.match(/[\s\S]{1,1500}(?=\s|$)/g) || [text];
    return [parts[0] || "", parts[1] || "", parts[2] || ""];
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
              
              {/* --- HALAMAN KIRI --- */}
              <div className="flex-1 h-full flex flex-col border-r border-black/10 relative">
                <div className="flex-grow overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                  {currentPage === 1 ? (
                    /* HALAMAN 1 KIRI: JUDUL + GAMBAR */
                    <div className="space-y-8">
                      <Badge className="w-fit uppercase tracking-widest font-bold px-4 py-1">
                        {article.category?.name || "MEJATIKA NEWS"}
                      </Badge>
                      <h1 className="text-3xl lg:text-5xl font-black italic uppercase leading-none tracking-tighter text-foreground antialiased">
                        {article.title}
                      </h1>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5">
                        <img src={article.image || "/placeholder.svg"} className="w-full h-full object-cover" alt="cover" />
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-t pt-4">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> {article.user?.name || "ADMIN"}</span>
                      </div>
                    </div>
                  ) : (
                    /* HALAMAN 2 KIRI: LANJUTAN KONTEN */
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify leading-relaxed antialiased">
                      {getPagedContent(article.content)[1]}
                    </div>
                  )}
                </div>

                <div className="p-8 border-t flex justify-between items-center text-[10px] font-black opacity-30 tracking-[0.3em]">
                   <span>MEJATIKA DIGITAL</span>
                   <span>PAGE {currentPage === 1 ? "01" : "03"}</span>
                </div>
              </div>

              {/* SPINE TENGAH */}
              <div className="w-[1px] h-full bg-black/10 dark:bg-white/10 relative z-20">
                 <div className="absolute top-0 bottom-0 -left-6 w-12 bg-gradient-to-r from-black/[0.05] via-transparent to-black/[0.05] pointer-events-none" />
              </div>

              {/* --- HALAMAN KANAN --- */}
              <div className="flex-1 h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10 relative">
                <div className="flex-grow overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                  {currentPage === 1 ? (
                    /* HALAMAN 1 KANAN: LANGSUNG MULAI KONTEN */
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify leading-relaxed antialiased">
                      {getPagedContent(article.content)[0]}
                    </div>
                  ) : (
                    /* HALAMAN 2 KANAN: SISA KONTEN */
                    <div className="prose prose-lg dark:prose-invert max-w-none text-justify leading-relaxed antialiased">
                      {getPagedContent(article.content)[2] || <p className="opacity-20 italic">Akhir dari artikel.</p>}
                    </div>
                  )}
                </div>

                <div className="p-8 border-t flex justify-between items-center">
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">PAGE {currentPage === 1 ? "02" : "04"}</span>
                  
                  <div className="flex gap-4">
                    {currentPage === 2 && (
                      <Button onClick={() => setCurrentPage(1)} variant="outline" className="rounded-full font-bold uppercase text-[10px] px-8 h-12 border-2 shadow-sm">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Halaman Sebelumnya
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button 
                        onClick={() => setCurrentPage(2)} 
                        className="rounded-2xl h-14 px-10 bg-primary shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-xs tracking-[0.2em] uppercase"
                      >
                        Halaman Berikutnya <ChevronRight className="w-5 h-5" />
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
