"use client"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, ImagePlus, Clock, Link as LinkIcon, X } from "lucide-react"

// PAKAI REACT-QUILL-NEW SEPERTI DI HALAMAN BERITA
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-md" />
})
import 'react-quill-new/dist/quill.snow.css'

export function CourseModal({ isOpen, onClose, course, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category_id: "1",
    price: "",
    duration: ""
  })

  // Toolbar editor disamakan dengan berita
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), [])

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
      setPreviewUrl(course.thumbnail || null)
    } else {
      setFormData({ title: "", slug: "", description: "", category_id: "1", price: "", duration: "" })
      setPreviewUrl(null)
    }
    setSelectedFile(null)
  }, [course, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const createSlug = (text: string) => text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    const data = new FormData()
    data.append("title", formData.title)
    data.append("slug", formData.slug)
    data.append("description", formData.description) 
    data.append("category_id", formData.category_id)
    data.append("price", formData.price)
    data.append("duration", formData.duration)
    
    if (selectedFile) data.append("thumbnail", selectedFile)
    if (course) data.append("_method", "PUT")

    try {
      const url = course ? `https://backend.mejatika.com/api/courses/${course.id}` : `https://backend.mejatika.com/api/courses`
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: data
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        const result = await res.json()
        alert("Gagal: " + (result.message || "Terjadi kesalahan"))
      }
    } catch (err) {
      alert("Gagal terhubung ke API")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-8 bg-[#fffdfa] rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            {course ? "Update" : "Add"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Course Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value, slug: createSlug(e.target.value)})}
                  className="rounded-2xl h-12 border-zinc-100 font-bold" required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1"><LinkIcon size={10}/> Slug</Label>
                <Input value={formData.slug} readOnly className="rounded-2xl h-12 bg-zinc-50 border-none text-zinc-400 italic" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price (IDR)</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-2xl h-12" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1"><Clock size={10}/> Duration</Label>
                  <Input placeholder="2 BULAN" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="rounded-2xl h-12" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1"><ImagePlus size={10}/> Thumbnail Preview</Label>
              <div className="relative h-44 w-full rounded-[2rem] border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden bg-zinc-50 hover:border-amber-400 transition-all cursor-pointer">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImagePlus className="mx-auto text-zinc-300 mb-2" size={32} />
                    <p className="text-[9px] text-zinc-400">UPLOAD THUMBNAIL</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Course Description</Label>
            <div className="rounded-2xl border border-zinc-100 overflow-hidden bg-white">
              <ReactQuill 
                theme="snow" 
                value={formData.description} 
                onChange={(val) => setFormData({...formData, description: val})} 
                modules={modules}
              />
            </div>
          </div>

          <Button disabled={loading} className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : "Save Course Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
