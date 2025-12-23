import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { db } from "@/lib/db"

export default async function GalleryManagementPage() {
  const gallery = await db.getGallery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Gallery Management</h1>
          <p className="text-muted-foreground">Manage photo gallery</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Photo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-balance">{item.title}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground text-pretty">{item.description}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
