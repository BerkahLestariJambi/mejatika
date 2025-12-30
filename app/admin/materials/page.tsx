"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  Loader2, 
  Trash2, 
  Edit3,
  Globe,
  BookOpen,
  Save
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Import React Quill secara Dynamic (SSR Disabled)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    file: "", // Sekarang berupa string URL (Link)
    content: "",
  })

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  }), [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const [resMat, resCourse] = await Promise.all([
        fetch("https://backend.mejatika.com/api/materials", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("https://backend.mejatika.com/api/courses")
      ])
      
      const dataMat = await resMat.json()
      const dataCourse = await resCourse.json()
      
      setMaterials(Array.isArray(dataMat) ? dataMat : dataMat.data || [])
      setCourses(dataCourse.data || dataCourse)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      course_id: item.course_id.toString(),
      file: item.file || "",
      content: item.content || "",
    })
    setOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ title: "", course_id: "", file: "", content: "" })
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file || !formData.course_id) return alert("Lengkapi link materi dan kursus!")

    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    
    // Karena sistem LINK, kita gunakan JSON biasa (lebih ringan dari FormData)
    const url = editingId 
      ? `https://backend.mejatika.com/api/materials/${editingId}`
      : "https://backend.mejatika.com/api/materials"
    
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        resetForm()
        fetchData()
      } else {
        alert("Gagal menyimpan materi.")
      }
    } catch (err) {
      alert("Kesalahan koneksi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMaterial = async (id: number) => {
    if (!confirm("Hapus materi ini?")) return
    const token = localStorage.getItem("token")
    try {
      await fetch(`https://backend.mejatika.com/api/materials/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      setMaterials(materials.filter(m => m.id !== id))
    } catch (err) {
      alert("Gagal menghapus.")
    }
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Course <span className="text-amber-500">Materials</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">Sistem Cloud Link (YouTube, Drive, atau OneDrive).</p>
        </div>

        <Button 
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 rounded-2xl h-12 px-6 shadow-lg shadow-zinc-200 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5 text-amber-500" />
          Add New Material
        </Button>
      </div>

      {/* MODAL ADD / EDIT MATERIAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              {editingId ? "Edit Material" : "New Material"}
            </DialogTitle>
            <DialogDescription>Input materi belajar berbasis link cloud.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Judul Materi</Label>
                <Input 
                  placeholder="Contoh: Pengenalan Next.js 14" 
                  className="rounded-xl border-zinc-100 bg-zinc-50 focus:ring-amber-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Pilih Kursus</Label>
                <Select 
                  value={formData.course_id}
                  onValueChange={(val) => setFormData({...formData, course_id: val})}
                >
                  <SelectTrigger className="rounded-xl border-zinc-100 bg-zinc-50">
                    <SelectValue placeholder="Pilih Kursus" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">URL Materi (YouTube / Drive / Web)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="rounded-xl border-zinc-100 bg-zinc-50 pl-10 focus:ring-amber-500"
                  value={formData.file}
                  onChange={(e) => setFormData({...formData, file: e.target.value})}
                  required
                />
              </div>
              <p className="text-[9px] text-zinc-400 italic font-medium px-1">Pastikan link dapat diakses publik atau dibagikan.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Deskripsi / Isi Materi</Label>
              <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                <ReactQuill 
                  theme="snow"
                  modules={quillModules}
                  value={formData.content}
                  onChange={(val) => setFormData({...formData, content: val})}
                  className="bg-white min-h-[150px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Button type="button" variant="outline" onClick={resetForm} className="flex-1 rounded-xl h-12 font-bold uppercase italic text-xs">
                  Cancel
               </Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-zinc-900 hover:bg-zinc-800 rounded-xl h-12 font-bold uppercase italic tracking-tighter">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4 text-amber-500" />}
                  {editingId ? "Update Material" : "Publish Material"}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* TABLE MATERIALS */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-zinc-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <BookOpen className="text-amber-500" /> Materials Library
            </CardTitle>
            <CardDescription>Daftar link materi pembelajaran aktif</CardDescription>
          </div>
          <Badge className="bg-zinc-100 text-zinc-900 rounded-full px-4 border-none text-[10px] font-black italic uppercase">
             {materials.length} Items
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-amber-500 h-10 w-10" /></div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm text-zinc-300">No content found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-[0.2em]">Materi & Kursus</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-[0.2em]">Link Reference</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {materials.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-zinc-900 group-hover:text-amber-600 transition-colors leading-none mb-2">{item.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase italic text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                            {item.course?.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                         <a 
                          href={item.file} 
                          target="_blank" 
                          className="text-[10px] text-amber-600 font-bold underline truncate block max-w-[200px]"
                         >
                           {item.file}
                         </a>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            onClick={() => handleEdit(item)}
                            variant="ghost" size="icon" 
                            className="text-zinc-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <Edit3 size={18} />
                          </Button>
                          <Button 
                            onClick={() => deleteMaterial(item.id)}
                            variant="ghost" size="icon" 
                            className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Komponen Badge Sederhana
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
