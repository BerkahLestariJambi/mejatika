"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ImagePlus, Clock, Link as LinkIcon } from "lucide-react"

export function CourseModal({ isOpen, onClose, course, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Untuk file gambar fisik
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category_id: "1",
    price: "",
    duration: ""
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        category_id: course.category_id?.toString() || "1",
        price: course.price?.toString() || "",
        duration: course.duration || ""
      })
    } else {
      setFormData({ title: "", slug: "", description: "", category_id: "1", price: "", duration: "" })
    }
    setSelectedFile(null)
  }, [course, isOpen])

  const createSlug = (text: string) => text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    const API_URL = "https://backend.mejatika.com/api/courses"
    const url = course ? `${API_URL}/${course.id}` : API_URL
    
    // MENGGUNAKAN FORMDATA UNTUK MENDUKUNG UPLOAD GAMBAR
    const data = new FormData()
    data.append("title", formData.title)
    data.append("slug", formData.slug)
    data.append("description", formData.description || "")
    data.append("category_id", formData.category_id)
    data.append("price", formData.price)
    data.append("duration", formData.duration)
    
    if (selectedFile) {
      data.append("thumbnail", selectedFile)
    }

    // Trik Laravel: Update dengan File harus pakai POST + _method PUT
    if (course) {
      data.append("_method", "PUT")
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Selalu POST jika mengirim FormData
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // Atasi Unauthenticated
        },
        body: data
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        alert("Gagal: " + (result.message || "Cek kembali data Anda"))
      }
    } catch (err) {
      alert("Gagal terhubung ke API")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl overflow-y-auto max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            {course ? "Update" : "Add"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6 font-bold uppercase tracking-widest text-[10px]">
          
          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Course Title</label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: createSlug(e.target.value)})}
              className="rounded-2xl h-12 border-zinc-100" required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 ml-2 flex items-center gap-1"><LinkIcon size={10}/> Slug (URL)</label>
            <Input 
              value={formData.slug} 
              onChange={(e) => setFormData({...formData, slug: e.target.value})} 
              className="rounded-2xl h-12 bg-zinc-50 border-none italic text-zinc-400" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-zinc-400 ml-2">Price (IDR)</label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-2xl h-12" required />
             </div>
             <div className="space-y-1">
                <label className="text-zinc-400 ml-2 flex items-center gap-1"><Clock size={10}/> Duration</label>
                <Input placeholder="E.G. 2 BULAN" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="rounded-2xl h-12" required />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-zinc-400 ml-2">Category ID</label>
                <Input type="number" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="rounded-2xl h-12" required />
             </div>
             <div className="space-y-1">
                <label className="text-zinc-400 ml-2 flex items-center gap-1"><ImagePlus size={10}/> Thumbnail Image</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                  className="rounded-2xl h-12 border-dashed pt-2 cursor-pointer" 
                />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Description</label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-2xl min-h-[100px]" />
          </div>

          <Button disabled={loading} className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl mt-4">
            {loading ? <Loader2 className="animate-spin" /> : "Save Course Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
