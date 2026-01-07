"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

type GalleryItem = {
  id: number
  title: string
  description: string
  image: string[] | string
}

export default function GalleryManagementPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([]) // Untuk preview sebelum upload
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // Handle Preview Gambar
  useEffect(() => {
    if (imageFiles.length === 0) {
      setPreviews([])
      return
    }
    const objectUrls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviews(objectUrls)

    // Cleanup memori
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url))
  }, [imageFiles])

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
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description || "")
    imageFiles.forEach(file => formData.append("images[]", file))

    if (editing) formData.append("_method", "PUT")

    try {
      const url = editing 
        ? `https://backend.mejatika.com/api/galleries/${editing.id}`
        : "https://backend.mejatika.com/api/galleries"

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      })

      if (!res.ok) throw new Error("Gagal memproses data")
      
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

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImageFiles([])
    setPreviews([])
    setEditing(null)
  }

  // Komponen Slider Internal
  const ImageSlider = ({ images }: { images: string | string[] }) => {
    const imageArray = Array.isArray(images) ? images : [images]
    
    return (
      <div className="relative group overflow-hidden h-48 w-full bg-muted">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full">
          {imageArray.map((img, idx) => (
            <div key={idx} className="flex-none w-full h-full snap-center">
              <img 
                src={img.startsWith('blob') ? img : (img.startsWith('http') ? img : `https://backend.mejatika.com/storage/${img}`)} 
                alt="gallery" 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {imageArray.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imageArray.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gallery Management</h1>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Photos
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Gallery" : "Upload New Photos"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Judul</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-32" />
                </div>
                <div>
                  <Label>Pilih Gambar</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} 
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-muted rounded-lg p-4">
                <Label className="mb-2 block text-center">Preview ({previews.length})</Label>
                {previews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                    {previews.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-xs">Belum ada gambar</p>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : editing ? "Update Gallery" : "Upload Gallery"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden border-muted-foreground/10">
              <ImageSlider images={item.image} />
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <Badge variant="secondary">{Array.isArray(item.image) ? item.image.length : 1} Pic</Badge>
                </div>
                <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                    setEditing(item);
                    setTitle(item.title);
                    setDescription(item.description);
                    setOpen(true);
                  }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => {
                    if(confirm("Hapus galeri ini?")) {
                      const token = localStorage.getItem("token")
                      fetch(`https://backend.mejatika.com/api/galleries/${item.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` }
                      }).then(() => fetchGallery())
                    }
                  }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
