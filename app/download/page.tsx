import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default async function DownloadPage() {
  const downloads = await db.getDownloads()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Download Center</h1>
          <p className="text-muted-foreground">Unduh berbagai dokumen dan materi yang tersedia</p>
        </div>

        <div className="grid gap-6">
          {downloads.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-bold text-balance">{file.title}</h3>
                      <p className="mb-3 text-sm text-muted-foreground text-pretty">{file.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{file.fileType}</Badge>
                        <span>{file.fileSize}</span>
                        <span>•</span>
                        <span>{file.downloadCount} downloads</span>
                      </div>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
