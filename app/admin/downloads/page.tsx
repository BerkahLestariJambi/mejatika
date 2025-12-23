import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Download } from "lucide-react"
import { db } from "@/lib/db"

export default async function DownloadsManagementPage() {
  const downloads = await db.getDownloads()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Downloads Management</h1>
          <p className="text-muted-foreground">Manage downloadable files</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add File
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Downloads</CardTitle>
          <CardDescription>Manage downloadable resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {downloads.map((file) => (
              <div key={file.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Download className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{file.title}</h3>
                    <p className="text-sm text-muted-foreground">{file.description}</p>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">{file.fileType}</Badge>
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span>{file.downloadCount} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
