"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
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
  image: string // Ini path dari Laravel
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // 1. Fetch Data
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

  // 2. Handle Submit (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("title", title)
    formData.append("category", category)
    formData.append("description", description)
    if (imageFile) formData.append("image", imageFile)

    let url = "https://backend.mejatika.com/api/galleries"
    if (editing) {
      url = `https://backend.mejatika.com/api/galleries/${editing.id}`
      formData.append("_method", "PUT") // Spoofing method untuk Laravel
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Selalu POST untuk kirim FormData/File
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        toast({ title: editing ? "Foto diperbarui" : "Foto berhasil ditambah" })
        setOpen(false)
        fetchGallery()
      } else {
        toast({ title: "Gagal menyimpan", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error koneksi", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Delete Photo
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
    setImageFile(null)
    setEditing(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Gallery Management</h1>
          <p className="text-muted-foreground">Manage photo gallery</p>
        </div>

        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if(!val) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Photo" : "Add New Photo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contoh: Event, Workshop, dll" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>File Foto {editing && "(Kosongkan jika tidak ganti)"}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required={!editing} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update Photo" : "Upload Photo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-48 w-full">
                  <img 
                    src={item.image.startsWith('http') ? item.image : `https://backend.mejatika.com/storage/${item.image}`} 
                    alt={item.title} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-balance leading-tight">{item.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditing(item)
                      setTitle(item.title)
                      setCategory(item.category)
                      setDescription(item.description)
                      setOpen(true)
                    }}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus foto ini?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(item.id)} className="bg-red-500">Hapus</AlertDialogAction>
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
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
          Belum ada foto di galeri.
        </div>
      )}
    </div>
  )
}
