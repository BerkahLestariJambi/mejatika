"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

type GalleryItem = {
  id: number
  title: string
  description: string
  image: string[] | string
}

// --- KOMPONEN SLIDER UNTUK CARD ---
function CardSlider({ images, title }: { images: string[] | string, title: string }) {
  const [current, setCurrent] = useState(0)
  const imgArray = Array.isArray(images) ? images : [images]

  useEffect(() => {
    if (imgArray.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imgArray.length)
    }, 4000) // Slide otomatis tiap 4 detik
    return () => clearInterval(interval)
  }, [imgArray.length])

  return (
    <div className="relative h-52 w-full overflow-hidden bg-muted">
      {imgArray.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <img
            src={img.startsWith('http') ? img : `https://backend.mejatika.com/storage/${img}`}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
      
      {/* Indikator Dots Kecil */}
      {imgArray.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {imgArray.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/40 w-1"}`} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
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
  const [previews, setPreviews] = useState<string[]>([]) 
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // Handle Preview Gambar Lokal
  useEffect(() => {
    if (imageFiles.length === 0) {
      setPreviews([])
      return
    }
    const urls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [imageFiles])

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://backend.mejatika.com/api/galleries", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const result = await res.json()
      setGallery(result.data || [])
    } catch (error) { console.error(error) } 
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGallery() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description || "")
    imageFiles.forEach(file => formData.append("images[]", file))
    if (editing) formData.append("_method", "PUT")

    try {
      const url = editing ? `https://backend.mejatika.com/api/galleries/${editing.id}` : "https://backend.mejatika.com/api/galleries"
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      })
      if (!res.ok) throw new Error("Gagal menyimpan")
      setOpen(false)
      fetchGallery()
      resetForm()
      toast({ title: "Success!" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const resetForm = () => {
    setTitle(""); setDescription(""); setImageFiles([]); setPreviews([]); setEditing(null)
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <Button onClick={() => { resetForm(); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Add Gallery
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Gallery" : "Create New Gallery"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="h-24" />
              </div>
              <div>
                <Label>Upload Images</Label>
                <Input type="file" multiple accept="image/*" onChange={e => e.target.files && setImageFiles(Array.from(e.target.files))} />
              </div>
              <Button className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mr-2" /> : "Save Gallery"}
              </Button>
            </div>

            {/* Preview Grid */}
            <div className="bg-muted rounded-xl p-4 overflow-y-auto max-h-[350px]">
              <p className="text-sm font-medium mb-3">Preview ({previews.length} images)</p>
              {previews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" />
                      <button onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground"><ImageIcon size={40} className="opacity-20"/></div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <CardSlider images={item.image} title={item.title} />
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <Badge variant="outline">{Array.isArray(item.image) ? item.image.length : 1} Photos</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                  <Button size="icon" variant="ghost" onClick={() => {
                    setEditing(item); setTitle(item.title); setDescription(item.description); setOpen(true)
                  }}><Edit size={16}/></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                    if(confirm("Delete this gallery?")) {
                      fetch(`https://backend.mejatika.com/api/galleries/${item.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                      }).then(() => fetchGallery())
                    }
                  }}><Trash2 size={16}/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
