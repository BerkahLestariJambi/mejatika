"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

type DownloadItem = {
  id: number
  title: string
  description: string
  file_path: string // URL atau path file dari backend
  file_type: string
  file_size: string
  download_count: number
}

export default function DownloadPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/downloads")
        const result = await res.json()
        setDownloads(result.data || result)
      } catch (error) {
        console.error("Gagal mengambil data download:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDownloads()
  }, [])

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Pastikan URL file lengkap (mengarah ke storage Laravel)
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `https://backend.mejatika.com/storage/${fileUrl}`
    
    const link = document.createElement("a")
    link.href = fullUrl
    link.download = fileName
    link.target = "_blank" // Opsional: buka di tab baru jika browser mendukung
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Download Center</h1>
          <p className="text-muted-foreground">Unduh berbagai dokumen dan materi yang tersedia</p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {downloads.length > 0 ? (
              downloads.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-bold text-balance text-lg">{file.title}</h3>
                          <p className="mb-3 text-sm text-muted-foreground text-pretty">
                            {file.description || "Tidak ada deskripsi tersedia."}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="uppercase">{file.file_type || "File"}</Badge>
                            <span>{file.file_size}</span>
                            <span className="hidden md:inline">•</span>
                            <span>{file.download_count} downloads</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full md:w-auto"
                        onClick={() => handleDownload(file.file_path, file.title)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-lg border-dashed">
                Belum ada file yang tersedia untuk diunduh.
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
