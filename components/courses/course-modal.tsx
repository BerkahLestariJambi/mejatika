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
    category_id: "1",
    price: "", // Tambahkan Price
    duration: "", // Tambahkan Duration
  })

  // Sinkronisasi data saat modal dibuka untuk Edit atau Tambah Baru
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        category_id: course.category_id?.toString() || "1",
        price: course.price?.toString() || "",
        duration: course.duration || "",
      })
    } else {
      setFormData({ 
        title: "", 
        slug: "", 
        description: "", 
        thumbnail: "", 
        category_id: "1", 
        price: "", 
        duration: "" 
      })
    }
  }, [course, isOpen])

  // Helper: Membuat Slug otomatis dari Judul
  const createSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Gunakan URL API Laravel Anda
    const API_URL = "https://backend.mejatika.com/api/courses"
    const url = course ? `${API_URL}/${course.id}` : API_URL
    
    // Penanganan khusus Laravel: PUT sering kali butuh method POST dengan spoofing _method
    // Namun jika API Anda sudah mendukung PUT murni, Anda bisa tetap menggunakan method PUT
    const method = course ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          // Jika sudah ada sistem login, tambahkan token di sini:
          // "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price), // Pastikan harga dikirim sebagai angka
          category_id: Number(formData.category_id) // Pastikan ID kategori sebagai angka
        })
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess() // Refresh list di page utama
        onClose()   // Tutup modal
      } else {
        // Tampilkan error validasi spesifik dari Laravel
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join(", ") 
          : result.message
        alert("Gagal Menyimpan: " + errorMsg)
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
            {course ? "Update" : "Add"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6 font-bold uppercase tracking-widest text-[10px]">
          {/* TITLE & SLUG */}
          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Course Title</label>
            <Input 
              placeholder="CONTOH: WEB DEVELOPMENT" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: createSlug(e.target.value)})}
              className="rounded-2xl h-12 border-zinc-100 focus:border-amber-500 font-bold"
              required 
            />
          </div>

          <div className="space-y-1 text-zinc-400">
            <label className="ml-2">Slug (Auto-Generated)</label>
            <Input 
              value={formData.slug} 
              readOnly 
              className="rounded-2xl h-12 bg-zinc-50 border-none italic"
            />
          </div>

          {/* CATEGORY & DURATION */}
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
              <label className="text-zinc-400 ml-2">Duration</label>
              <Input 
                placeholder="2 BULAN"
                value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="rounded-2xl h-12 border-zinc-100"
              />
            </div>
          </div>

          {/* PRICE & THUMBNAIL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-400 ml-2">Price (IDR)</label>
              <Input 
                type="number"
                placeholder="1500000"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
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

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-zinc-400 ml-2">Description</label>
            <Textarea 
              placeholder="Deskripsi materi kursus..."
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-2xl min-h-[100px] border-zinc-100"
            />
          </div>

          <Button 
            disabled={loading} 
            className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save to Laravel Database"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
