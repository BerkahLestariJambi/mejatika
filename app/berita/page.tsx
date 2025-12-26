"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight, Loader2 } from "lucide-react"

export default function BeritaPage() {
  // State untuk daftar berita
  const [news, setNews] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  // State untuk Modal Detail
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 1. Ambil daftar berita saat halaman dimuat
  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data)
        setLoadingList(false)
      })
      .catch(() => setLoadingList(false))
  }, [])

  // 2. Ambil detail berita saat tombol diklik (Popup dibuka)
  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null) // Reset data lama
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Berita & Artikel</h1>
          <p className="text-muted-foreground mt-2">Update informasi terbaru dari MEJATIKA</p>
        </div>

        {/* LIST BERITA */}
        {loadingList ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item: any) => (
              <Card key={item.id} className="group overflow-hidden flex flex-col border-none shadow-md hover:shadow-xl transition-all">
                <div className="relative h-52 w-full overflow-hidden bg-muted">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                    {item.content}
                  </p>
                  <Button 
                    onClick={() => handleOpenDetail(item.slug)} 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Baca Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* POPUP MODAL (FRAME DETAIL) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-full max-h-[90vh]">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center p-24 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Menyiapkan berita...</p>
                </div>
              ) : article && (
                <article>
                  <div className="relative aspect-video w-full bg-muted">
                    <img 
                      src={article.image || "/placeholder.svg"} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                  </div>
                  <div className="p-6 md:p-10 bg-card">
                    <Badge className="mb-4">{article.category?.name || "Umum"}</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                      {article.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(article.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>{article.author?.name || article.user?.name || "Admin MEJATIKA"}</span>
                      </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-line leading-relaxed text-foreground/90">
                        {article.content}
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}
