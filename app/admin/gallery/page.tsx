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
    formData.append("category", category)
    formData.append("description", description || "")

    try {
      if (editing) {
        // --- LOGIKA UPDATE (Single Image) ---
        formData.append("_method", "PUT")
        if (imageFiles.length > 0) {
          formData.append("image", imageFiles[0])
        }

        const res = await fetch(`https://backend.mejatika.com/api/galleries/${editing.id}`, {
          method: "POST", // Menggunakan POST + _method PUT untuk Laravel compatibility
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        
        if (!res.ok) throw new Error("Gagal mengupdate data")
      } else {
        // --- LOGIKA CREATE (Batch/Multiple Images) ---
        // Masukkan semua file ke dalam array images[]
        imageFiles.forEach((file) => {
          formData.append("images[]", file)
        })

        const res = await fetch("https://backend.mejatika.com/api/galleries", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        if (!res.ok) throw new Error("Gagal mengunggah gambar")
      }

      toast({ 
        title: editing ? "Berhasil diperbarui" : "Berhasil diunggah",
        description: !editing ? `${imageFiles.length} foto telah ditambahkan ke galeri.` : undefined
      })
      
      setOpen(false)
      fetchGallery()
      resetForm()
    } catch (err: any) {
      toast({ 
        title: "Terjadi kesalahan", 
        description: err.message || "Gagal menyimpan data ke server",
        variant: "destructive" 
      })
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
          <p className="text-muted-foreground">Kelola koleksi foto dan dokumentasi</p>
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
              <DialogTitle>{editing ? "Edit Detail Foto" : "Upload Foto Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Judul {editing ? "" : "(Berlaku untuk semua foto)"}</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Masukkan judul foto"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="Contoh: Event, Workshop, Fasilitas" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Tambahkan keterangan singkat..."
                />
              </div>
              <div className="space-y-2">
                <Label>Pilih Gambar {editing ? "" : "(Bisa pilih banyak sekaligus)"}</Label>
                <div className="grid w-full items-center gap-1.5">
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
                </div>
                {!editing && imageFiles.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] text-green-600 font-semibold bg-green-50 p-2 rounded-md border border-green-100 mt-2">
                    <CheckCircle2 className="h-3 w-3" />
                    {imageFiles.length} foto terpilih dan siap diunggah.
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting || (!editing && imageFiles.length === 0)}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mengunggah...</>
                ) : (
                  editing ? "Simpan Perubahan" : `Upload ${imageFiles.length} Foto Sekarang`
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Memuat Galeri...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all border-muted/60">
              <CardContent className="p-0">
                <div className="relative h-52 w-full bg-muted">
                  <img 
                    src={item.image.startsWith('http') ? item.image : `https://backend.mejatika.com/storage/${item.image}`} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Badge className="absolute top-3 right-3 shadow-md border-none bg-primary/90 backdrop-blur-sm" variant="default">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed">
                    {item.description || "Tidak ada deskripsi."}
                  </p>
                  
                  <div className="flex justify-end gap-2 border-t mt-4 pt-3">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => {
                      setEditing(item)
                      setTitle(item.title)
                      setCategory(item.category)
                      setDescription(item.description)
                      setOpen(true)
                    }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus foto permanen?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Hapus Foto</AlertDialogAction>
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
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/20 border-muted-foreground/20">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-semibold">Galeri masih kosong</p>
          <p className="text-sm text-muted-foreground/60 mb-6">Mulai unggah foto dokumentasi Anda.</p>
          <Button variant="secondary" onClick={() => setOpen(true)}>
             Unggah Sekarang
          </Button>
        </div>
      )}
    </div>
  )
}
