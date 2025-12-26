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

// Shadcn UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, ChevronRight, ChevronLeft } from "lucide-react"

// Memastikan halaman dirender secara dinamis agar tidak eror saat build fetch API
export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
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
        .catch((err) => {
          console.error("Gagal mengambil detail:", err)
          setLoadingDetail(false)
        })
    }
  }, [selectedSlug, isModalOpen])

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  // Fungsi pemotong teks yang AMAN untuk Build
  const splitContent = (text: any) => {
    if (!text || typeof text !== 'string') return ["", ""];
    
    // Potong berdasarkan jumlah karakter tengah
    const mid = Math.floor(text.length / 2);
    const lastSpace = text.lastIndexOf(' ', mid);
    const splitIndex = lastSpace !== -1 ? lastSpace : mid;

    return [
      text.substring(0, splitIndex).trim(),
      text.substring(splitIndex).trim()
    ];
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

      {/* MODAL POPUP MODEL BUKU */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] md:h-[80vh] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-2xl shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : article && (
            <div className="relative w-full h-full flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden">
              
              {/* HALAMAN 1 (KIRI) */}
              <div className="flex-1 bg-white dark:bg-zinc-950 p-6 md:p-12 border-r border-black/10 relative overflow-hidden flex flex-col">
                <div className="flex-grow overflow-y-auto pr-2">
                  <Badge variant="secondary" className="mb-4 uppercase tracking-tighter text-[10px]">
                    {article.category?.name || "News"}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-black italic uppercase leading-tight mb-6 text-foreground">
                    {article.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-6 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary" />
                      {new Date(article.publishedAt || article.created_at || Date.now()).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-primary" />
                      {article.user?.name || "Admin"}
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed text-justify">
                    {currentPage === 1 
                      ? splitContent(article.content)[0] 
                      : "Lanjutan dari halaman sebelumnya..."}
                  </div>
                </div>
                
                {/* Footer Halaman Kiri */}
                <div className="pt-4 border-t border-border/50 flex justify-between items-center mt-2">
                   <span className="text-[10px] font-bold opacity-30 italic">MEJATIKA MAGZ</span>
                   <span className="text-[10px] font-mono">Hal. {currentPage === 1 ? "01" : "03"}</span>
                </div>
              </div>

              {/* HALAMAN 2 (KANAN) */}
              <div className="flex-1 bg-white dark:bg-zinc-950 p-6 md:p-12 relative flex flex-col shadow-[inset_15px_0_30px_rgba(0,0,0,0.03)]">
                <div className="flex-grow overflow-y-auto pr-2">
                  {/* Konten Gambar di Halaman 1, atau konten lanjutan di Halaman 2 */}
                  {currentPage === 1 ? (
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl ring-1 ring-border">
                        <img 
                          src={article.image || "/placeholder.svg"} 
                          className="w-full h-full object-cover" 
                          alt="feature" 
                        />
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed text-center px-4">
                        "Lanjut ke halaman berikutnya untuk membaca detail lengkap artikel ini."
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed text-justify">
                      {splitContent(article.content)[1]}
                    </div>
                  )}
                </div>

                {/* Navigasi Pindah Halaman */}
                <div className="pt-4 border-t border-border/50 flex justify-between items-center mt-4">
                  <span className="text-[10px] font-mono">Hal. {currentPage === 1 ? "02" : "04"}</span>
                  
                  <div className="flex gap-2">
                    {currentPage === 2 && (
                      <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} className="rounded-full text-[10px] h-8">
                        <ChevronLeft className="w-3 h-3 mr-1" /> KEMBALI
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button 
                        size="icon" 
                        onClick={() => setCurrentPage(2)} 
                        className="rounded-xl h-12 w-12 bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/30"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Garis Lipatan Tengah */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 dark:bg-white/5 hidden md:block" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[20px] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.02] to-transparent hidden md:block" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
