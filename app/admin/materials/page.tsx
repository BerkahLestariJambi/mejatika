"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
  Save,
  Search,
  ExternalLink
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

// Import React Quill secara Dynamic dengan Loading state
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-zinc-50 animate-pulse rounded-xl" />
})
import "react-quill/dist/quill.snow.css"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    file: "", 
    content: "",
  })

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  }), [])

  const fetchData = useCallback(async () => {
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
      setCourses(Array.isArray(dataCourse) ? dataCourse : dataCourse.data || [])
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter materi berdasarkan search
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    if (!formData.file || !formData.course_id) return alert("Lengkapi data materi!")

    setIsSubmitting(true)
    const token = localStorage.getItem("token")
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
        const errorData = await res.json()
        alert(errorData.message || "Gagal menyimpan materi.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMaterial = async (id: number) => {
    if (!confirm("Hapus materi ini secara permanen?")) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/materials/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) setMaterials(materials.filter(m => m.id !== id))
    } catch (err) {
      alert("Gagal menghapus.")
    }
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
            Course <span className="text-amber-500">Materials</span>
          </h1>
          <p className="text-zinc-500 font-medium italic mt-2">Manage cloud-based learning resources.</p>
        </div>

        <Button 
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 rounded-2xl h-12 px-6 shadow-lg shadow-zinc-200 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5 text-amber-500" />
          Add New Material
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Cari materi atau kursus..." 
          className="pl-11 rounded-2xl border-none shadow-sm bg-white h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MODAL FORM */}
      <Dialog open={open} onOpenChange={(v) => { if(!v) resetForm(); }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
              {editingId ? "Edit Content" : "Create Content"}
            </DialogTitle>
            <DialogDescription>Link video YouTube atau dokumen Drive akan di-preview otomatis di dashboard peserta.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-400 ml-1">Judul Materi</Label>
                <Input 
                  placeholder="Misal: Modul 1 - Fundamental" 
                  className="rounded-xl border-zinc-100 bg-zinc-50 h-12 focus:ring-amber-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-400 ml-1">Kursus Terkait</Label>
                <Select 
                  value={formData.course_id}
                  onValueChange={(val) => setFormData({...formData, course_id: val})}
                >
                  <SelectTrigger className="rounded-xl border-zinc-100 bg-zinc-50 h-12">
                    <SelectValue placeholder="Pilih Kursus" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-400 ml-1">Cloud Link (YT/Drive/OneDrive)</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="https://..." 
                  className="rounded-xl border-zinc-100 bg-zinc-50 pl-12 h-12 focus:ring-amber-500"
                  value={formData.file}
                  onChange={(e) => setFormData({...formData, file: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-400 ml-1">Deskripsi Tambahan</Label>
              <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                <ReactQuill 
                  theme="snow"
                  modules={quillModules}
                  value={formData.content}
                  onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                  className="bg-white min-h-[200px]"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 rounded-2xl h-14 font-bold uppercase italic text-zinc-400 hover:text-zinc-900 transition-all">
                  Discard
               </Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-zinc-900 hover:bg-zinc-800 rounded-2xl h-14 font-black uppercase italic tracking-widest shadow-xl shadow-zinc-200">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5 text-amber-500" />}
                  {editingId ? "Save Changes" : "Publish Content"}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MATERIALS TABLE */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-zinc-50 flex flex-row items-center justify-between bg-white">
          <div>
            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <BookOpen className="text-amber-600 h-6 w-6" />
              </div>
              Materials Library
            </CardTitle>
            <CardDescription className="font-medium">Total {filteredMaterials.length} materi ditemukan</CardDescription>
          </div>
          <Badge className="bg-zinc-900 text-amber-500 rounded-full px-5 py-2 border-none text-[10px] font-black italic uppercase tracking-widest">
             Active Database
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className="animate-spin text-amber-500 h-12 w-12" /></div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm">No materials available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-zinc-400 border-b border-zinc-100">Info Materi</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-zinc-400 border-b border-zinc-100">Resource Link</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-zinc-400 border-b border-zinc-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredMaterials.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/30 transition-all group">
                      <td className="p-6">
                        <div className="font-black text-zinc-900 group-hover:text-amber-600 transition-colors text-lg leading-tight mb-1">{item.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase italic text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded-md">
                            Course: {item.course?.title || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                         <a 
                          href={item.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] text-zinc-500 font-bold hover:text-amber-600 transition-all truncate max-w-[250px]"
                         >
                           <ExternalLink size={12} className="text-amber-500 shrink-0" />
                           {item.file}
                         </a>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Button 
                            onClick={() => handleEdit(item)}
                            variant="ghost" size="icon" 
                            className="h-11 w-11 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"
                          >
                            <Edit3 size={20} />
                          </Button>
                          <Button 
                            onClick={() => deleteMaterial(item.id)}
                            variant="ghost" size="icon" 
                            className="h-11 w-11 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
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

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${className}`}>
      {children}
    </span>
  )
}
