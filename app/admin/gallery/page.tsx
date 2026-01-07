"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, ImageIcon, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type GalleryItem = {
  id: number
  title: string
  // category: string // Hapus jika benar-benar tidak pakai kategori di DB
  description: string
  image: string[] | string // Bisa array (multiple) atau string (lama)
}

export default function GalleryManagementPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/galleries", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      setGallery(result.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const token = localStorage.getItem("token")
    const formData = new FormData()

    formData.append("title", title)
    formData.append("description", description || "")

    try {
      if (editing) {
        formData.append("_method", "PUT")
        // Untuk update, kita kirim ke field 'images[]' juga agar konsisten di backend
        if (imageFiles.length > 0) {
          imageFiles.forEach(file => formData.append("images[]", file))
        }

        const res = await fetch(`https://backend.mejatika.com/api/galleries/${editing.id}`, {
          method: "POST", 
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) throw new Error("Gagal update")
      } else {
        // Kirim multiple files dalam SATU request
        imageFiles.forEach((file) => {
          formData.append("images[]", file)
        })

        const res = await fetch("https://backend.mejatika.com/api/galleries", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) throw new Error("Gagal upload")
      }

      toast({ title: "Berhasil disimpan" })
      setOpen(false)
      fetchGallery()
      resetForm()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async (id: number) => {
    const token = localStorage.getItem("token")
    try {
      await fetch(`https://backend.mejatika.com/api/galleries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchGallery()
    } catch (error) {
      toast({ title: "Gagal hapus", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImageFiles([])
    setEditing(null)
  }

  // Helper untuk menampilkan gambar pertama dari array
  const getImageUrl = (image: string | string[]) => {
    const firstImage = Array.isArray(image) ? image[0] : image
    if (!firstImage) return ""
    return firstImage.startsWith('http') ? firstImage : `https://backend.mejatika.com/storage/${firstImage}`
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Photos
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Upload"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Pilih Gambar (Multiple)</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} />
              {imageFiles.length > 0 && <p className="text-xs text-green-600 mt-1">{imageFiles.length} file dipilih</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-20" />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative h-48 bg-muted">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.title} 
                    className="h-full w-full object-cover" 
                  />
                  {Array.isArray(item.image) && item.image.length > 1 && (
                    <Badge className="absolute top-2 right-2">+{item.image.length - 1} Foto</Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{item.title}</h3>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditing(item);
                      setTitle(item.title);
                      setDescription(item.description);
                      setOpen(true);
                    }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => confirmDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
