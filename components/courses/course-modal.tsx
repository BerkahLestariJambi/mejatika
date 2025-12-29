"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export function CourseModal({ isOpen, onClose, course, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    category_id: "1", // Default ID kategori (sesuaikan dengan DB Anda)
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        category_id: course.category_id || "1",
      })
    } else {
      setFormData({ title: "", slug: "", description: "", thumbnail: "", category_id: "1" })
    }
  }, [course, isOpen])

  // Helper: Membuat Slug otomatis dari Judul
  const createSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const API_URL = "https://backend.mejatika.com/api/courses"
    const url = course ? `${API_URL}/${course.id}` : API_URL
    
    // Laravel sering butuh spoofing method untuk PUT
    const method = course ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        // Tampilkan pesan error validasi dari Laravel
        alert("Validasi Gagal: " + JSON.stringify(result.errors || result.message))
      }
    } catch (err) {
      alert("Gagal terhubung ke server Laravel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
            {course ? "Update" : "Add"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 font-bold uppercase tracking-widest text-[10px]">
          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Course Title</label>
            <Input 
              placeholder="Contoh: Belajar NextJS" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: createSlug(e.target.value)})}
              className="rounded-2xl h-12 border-zinc-100 focus:border-amber-500"
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Slug (Auto)</label>
            <Input 
              value={formData.slug} 
              readOnly 
              className="rounded-2xl h-12 bg-zinc-50 border-none text-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-400 ml-2">Category ID</label>
              <Input 
                type="number"
                value={formData.category_id} 
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="rounded-2xl h-12 border-zinc-100"
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 ml-2">Thumbnail URL</label>
              <Input 
                placeholder="https://..." 
                value={formData.thumbnail} 
                onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                className="rounded-2xl h-12 border-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Description</label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-2xl min-h-[100px] border-zinc-100"
            />
          </div>

          <Button 
            disabled={loading} 
            className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save to Laravel Database"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
