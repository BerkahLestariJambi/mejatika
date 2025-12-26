"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Loader2 } from "lucide-react"

interface NewsDetailModalProps {
  slug: string | null
  isOpen: boolean
  onClose: () => void
}

export function NewsDetailModal({ slug, isOpen, onClose }: NewsDetailModalProps) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (slug && isOpen) {
      setLoading(true)
      fetch(`https://backend.mejatika.com/api/news/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Gagal mengambil detail:", err)
          setLoading(false)
        })
    }
  }, [slug, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="hidden">
           <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[90vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Memuat konten...</p>
            </div>
          ) : article ? (
            <div className="flex flex-col">
              {/* Gambar Utama */}
              <div className="relative aspect-video w-full bg-muted">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />
              </div>

              {/* Konten Berita */}
              <div className="p-6 md:p-10">
                <div className="flex items-center gap-2 mb-4">
                  {article.category && (
                    <Badge variant="secondary">{article.category.name}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b">
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
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              Konten tidak ditemukan atau terjadi kesalahan.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
