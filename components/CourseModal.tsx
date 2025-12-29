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
    category_id: "" // Pastikan ini sesuai dengan ID kategori di DB Laravel
  })

  useEffect(() => {
    if (course) setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      category_id: course.category_id
    })
  }, [course, isOpen])

  // Fungsi otomatis buat slug dari judul
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const url = course 
      ? `https://backend.mejatika.com/api/courses/${course.id}` 
      : "https://backend.mejatika.com/api/courses"
    
    const method = course ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        alert("Validasi Gagal: " + JSON.stringify(err.errors))
      }
    } catch (err) {
      alert("Gagal koneksi ke Laravel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
            {course ? "Update" : "Create"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 font-bold text-[11px] uppercase tracking-widest">
          <div className="space-y-1">
            <label>Title</label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} 
              className="rounded-xl" required 
            />
          </div>
          <div className="space-y-1 text-zinc-400">
            <label>Slug (Auto-generated)</label>
            <Input value={formData.slug} disabled className="rounded-xl bg-zinc-50" />
          </div>
          <div className="space-y-1">
            <label>Category ID</label>
            <Input 
              type="number" value={formData.category_id} 
              onChange={e => setFormData({...formData, category_id: e.target.value})} 
              className="rounded-xl" required 
            />
          </div>
          <div className="space-y-1">
            <label>Description</label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="rounded-xl" 
            />
          </div>
          <div className="space-y-1">
            <label>Thumbnail URL</label>
            <Input 
              value={formData.thumbnail} 
              onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
              className="rounded-xl" 
            />
          </div>
          <Button disabled={loading} className="w-full bg-amber-500 rounded-2xl py-6 font-black uppercase tracking-widest">
            {loading ? <Loader2 className="animate-spin" /> : "Sync to Laravel DB"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
