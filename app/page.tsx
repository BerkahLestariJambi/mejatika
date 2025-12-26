"use client"

import { useState, useEffect } from "react"
// ... (import lainnya tetap sama)
import { ChevronRight, ChevronLeft, BookOpen, Calendar, User, Loader2 } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // State untuk kontrol halaman buku
  const [currentPage, setCurrentPage] = useState(1)

  // ... (useEffect fetch data tetap sama)
  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null)
      setCurrentPage(1) // Reset ke halaman 1 setiap buka berita
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoadingDetail(false)
        })
    }
  }, [selectedSlug, isModalOpen])

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  // Fungsi helper untuk membagi konten (Opsional, atau bisa manual)
  const splitContent = (text: string) => {
    if (!text) return ["", ""];
    const mid = Math.floor(text.length / 2);
    const before = text.lastIndexOf(' ', mid);
    return [text.substring(0, before), text.substring(before)];
  }

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-6">
        {/* ... (Konten Utama tetap sama) */}
        <NewsSlider onReadMore={handleOpenDetail} />
        <NewsList onReadMore={handleOpenDetail} />
      </main>
      
      <Footer />

      {/* POPUP MODAL MODEL BUKU */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[80vh] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="bg-card w-full h-full flex items-center justify-center rounded-2xl">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : article && (
            <div className="relative w-full h-full flex flex-col md:flex-row perspective-1000">
              
              {/* HALAMAN KIRI */}
              <div className="flex-1 bg-white dark:bg-zinc-900 p-8 md:p-12 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] border-r border-black/10 rounded-l-2xl overflow-y-auto">
                <Badge variant="secondary" className="mb-4">{article.category?.name}</Badge>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-6 leading-tight text-zinc-900 dark:text-white">
                  {article.title}
                </h1>
                
                <div className="flex flex-col gap-3 text-xs text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.publishedAt || article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {article.user?.name || "Admin"}
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert italic text-zinc-700 dark:text-zinc-300">
                  {currentPage === 1 ? splitContent(article.content)[0] : "Lanjutan dari halaman sebelumnya..."}
                </div>
              </div>

              {/* HALAMAN KANAN */}
              <div className="flex-1 bg-white dark:bg-zinc-900 p-8 md:p-12 shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] rounded-r-2xl overflow-y-auto flex flex-col">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted mb-8 shadow-md">
                  <img src={article.image} className="w-full h-full object-cover" alt="cover" />
                </div>

                <div className="prose prose-sm dark:prose-invert text-zinc-700 dark:text-zinc-300 flex-grow">
                   {currentPage === 1 ? "Lanjut ke halaman berikutnya..." : splitContent(article.content)[1]}
                </div>

                {/* Navigasi Halaman (Simbol Panah di bawah kanan) */}
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xs font-mono text-muted-foreground">Halaman {currentPage} dari 2</span>
                  <div className="flex gap-2">
                    {currentPage === 2 && (
                      <Button size="icon" variant="outline" onClick={() => setCurrentPage(1)} className="rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {currentPage === 1 && (
                      <Button size="icon" onClick={() => setCurrentPage(2)} className="rounded-xl h-12 w-12 shadow-lg">
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Garis Tengah Buku */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/10 hidden md:block" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
