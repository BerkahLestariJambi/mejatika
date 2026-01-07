"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, ImageIcon } from "lucide-react"
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
  category: string
  description: string
  image: string
}

export default function GalleryManagementPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  // Ubah ke Array untuk menampung banyak file
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

    try {
      if (editing) {
        // LOGIKA UPDATE (Single)
        const formData = new FormData()
        formData.append("title", title)
        formData.append("category", category)
        formData.append("description", description)
        formData.append("_method", "PUT")
        if (imageFiles.length > 0) formData.append("image", imageFiles[0])

        const res = await fetch(`https://backend.mejatika.com/api/galleries/${editing.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) throw new Error()
      } else {
        // LOGIKA CREATE (Multiple)
        // Kita kirim setiap file satu per satu ke API agar terbuat record terpisah
        const uploadPromises = imageFiles.map((file) => {
          const formData = new FormData()
          formData.append("title", title)
          formData.append("category", category)
          formData.append("description", description)
          formData.append("image", file)

          return fetch("https://backend.mejatika.com/api/galleries", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
        })

        await Promise.all(uploadPromises)
      }

      toast({ title: editing ? "Berhasil diperbarui" : `Berhasil upload ${imageFiles.length} foto` })
      setOpen(false)
      fetchGallery()
      resetForm()
    } catch (err) {
      toast({ title: "Gagal menyimpan data", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async (id: number) => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/galleries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast({ title: "Foto dihapus" })
        fetchGallery()
      }
    } catch (error) {
      toast({ title: "Gagal hapus", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setDescription("")
    setImageFiles([])
    setEditing(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Gallery Management</h1>
          <p className="text-muted-foreground">Manage and upload your photo gallery</p>
        </div>

        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if(!val) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Photo" : "Upload New Photos"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Judul {editing ? "" : "(Sama untuk semua batch)"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contoh: Event, Fasilitas" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pilih Gambar {editing ? "" : "(Bisa pilih banyak)"}</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple={!editing} 
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFiles(Array.from(e.target.files))
                    }
                  }} 
                  required={!editing} 
                />
                {!editing && imageFiles.length > 0 && (
                  <p className="text-[10px] text-blue-600 font-medium">
                    {imageFiles.length} file terpilih siap upload.
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  editing ? "Update Photo" : `Upload ${imageFiles.length} Photos`
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">Loading gallery...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="relative h-48 w-full bg-muted">
                  <img 
                    src={item.image.startsWith('http') ? item.image : `https://backend.mejatika.com/storage/${item.image}`} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                  />
                  <Badge className="absolute top-2 right-2 shadow-sm" variant="secondary">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 h-10 italic">
                    {item.description || "No description provided."}
                  </p>
                  
                  <div className="flex justify-end gap-2 border-t mt-4 pt-3">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditing(item)
                      setTitle(item.title)
                      setCategory(item.category)
                      setDescription(item.description)
                      setOpen(true)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus foto?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && gallery.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-2xl bg-muted/30">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">Gallery is empty.</p>
          <p className="text-xs text-muted-foreground">Click "Add Photos" to start.</p>
        </div>
      )}
    </div>
  )
}
