"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  ExternalLink,
  Video,
  ClipboardCheck,
  Rocket,
  X
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
import Swal from 'sweetalert2'

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-zinc-50 animate-pulse rounded-xl" />
})
import "react-quill-new/dist/quill.snow.css"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  // UPDATE STATE: Menambahkan kolom baru
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    file: "", 
    live_link: "",             // Tambah link live session
    content: "",
    quiz_task: "",             // Tambah soal latihan
    project_instructions: "",  // Tambah instruksi projek mini
  })

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
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

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [materials, searchQuery])

  // UPDATE HANDLE EDIT: Menyesuaikan field baru
  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      course_id: item.course_id.toString(),
      file: item.file || "",
      live_link: item.live_link || "",
      content: item.content || "",
      quiz_task: item.quiz_task || "",
      project_instructions: item.project_instructions || "",
    })
    setOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ 
        title: "", 
        course_id: "", 
        file: "", 
        live_link: "", 
        content: "", 
        quiz_task: "", 
        project_instructions: "" 
    })
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        Toast.fire({ icon: 'success', title: editingId ? 'Materi diperbarui' : 'Materi berhasil diterbitkan' });
        resetForm()
        fetchData()
      } else {
        Toast.fire({ icon: 'error', title: 'Gagal menyimpan materi' });
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Kesalahan koneksi' });
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMaterial = async (id: number) => {
    Swal.fire({
      title: 'Hapus materi ini?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token")
        try {
          const res = await fetch(`https://backend.mejatika.com/api/materials/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          })
          if (res.ok) {
            setMaterials(materials.filter(m => m.id !== id))
            Toast.fire({ icon: 'success', title: 'Materi terhapus' })
          }
        } catch (err) {
          Toast.fire({ icon: 'error', title: 'Gagal menghapus' })
        }
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-amber-600">MANAGEMENT MATERI</h1>
          <p className="text-muted-foreground">Pusat Pembelajaran Digital Mejatika</p>
        </motion.div>

        <Button 
          onClick={() => { resetForm(); setOpen(true); }}
          size="lg" 
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-transform active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Tambah Materi
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
        <Input 
          placeholder="Cari materi atau kursus..." 
          className="pl-10 rounded-full border-amber-100 bg-white shadow-sm focus:ring-amber-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MODAL FORM */}
      <Dialog open={open} onOpenChange={(v) => { if(!v) resetForm(); }}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none overflow-visible">
          <div className="relative z-50 w-[95%] mx-auto">
            <div className="w-full h-14 bg-amber-500 rounded-full shadow-xl flex items-center justify-between px-10 relative overflow-hidden border-b-4 border-amber-700/30">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">EDITOR MATERI</span>
              <span className="text-[10px] font-black text-amber-900/50 uppercase tracking-[0.4em] z-10 italic">MEJATIKA</span>
            </div>
          </div>

          <div className="bg-[#fffdfa] dark:bg-zinc-950 -mt-6 pt-12 pb-10 px-8 md:px-12 rounded-b-xl shadow-2xl relative border-x border-black/5 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Judul Materi</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Contoh: Pengenalan Dasar" 
                    className="border-amber-200 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pilih Kursus</Label>
                  <Select 
                    value={formData.course_id}
                    onValueChange={(val) => setFormData({...formData, course_id: val})}
                  >
                    <SelectTrigger className="border-amber-200 rounded-xl">
                      <SelectValue placeholder="Pilih Kursus" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* URL SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> URL Sumber (YT/File)
                  </Label>
                  <Input 
                    value={formData.file} 
                    onChange={(e) => setFormData({...formData, file: e.target.value})} 
                    required 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="border-amber-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <Video className="w-3 h-3" /> Link Live Session (Zoom/GMeet)
                  </Label>
                  <Input 
                    value={formData.live_link} 
                    onChange={(e) => setFormData({...formData, live_link: e.target.value})} 
                    placeholder="https://zoom.us/j/..." 
                    className="border-amber-200 rounded-xl"
                  />
                </div>
              </div>

              {/* CONTENT EDITOR */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Isi / Deskripsi Materi</Label>
                <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-inner">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} 
                    modules={quillModules} 
                  />
                </div>
              </div>

              {/* NEW SECTION: ASSIGNMENT & QUIZ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100/50">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Soal Latihan (Quiz)
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-xl border border-amber-200 text-xs focus:ring-amber-500 outline-none"
                    placeholder="Tuliskan soal-soal latihan di sini..."
                    value={formData.quiz_task}
                    onChange={(e) => setFormData({...formData, quiz_task: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Instruksi Mini Projek
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-xl border border-amber-200 text-xs focus:ring-amber-500 outline-none"
                    placeholder="Jelaskan detail tugas/projek mini..."
                    value={formData.project_instructions}
                    onChange={(e) => setFormData({...formData, project_instructions: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 rounded-xl font-bold uppercase italic text-zinc-400">
                    Batal
                 </Button>
                 <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest h-12 rounded-xl">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : editingId ? "SIMPAN PERUBAHAN" : "TERBITKAN MATERI"}
                 </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* MATERIALS TABLE */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100 text-[10px] font-black uppercase tracking-widest text-amber-700">
                <th className="px-6 py-4">Materi & Aktivitas</th>
                <th className="px-6 py-4">Akses Link</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-amber-500" /></td></tr>
              ) : filteredMaterials.length === 0 ? (
                <tr><td colSpan={3} className="py-20 text-center text-zinc-400 italic">Tidak ada materi ditemukan</td></tr>
              ) : (
                filteredMaterials.map((item) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    key={item.id} 
                    className="border-b border-zinc-50 hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-zinc-800 group-hover:text-amber-600 transition-colors">{item.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase italic text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {item.course?.title || 'Umum'}
                        </span>
                        {item.quiz_task && (
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                             <ClipboardCheck size={8}/> Quiz OK
                          </span>
                        )}
                        {item.project_instructions && (
                          <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                             <Rocket size={8}/> Project OK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                         <a href={item.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-amber-600 transition-all">
                           <ExternalLink size={12} className="shrink-0" />
                           <span className="truncate max-w-[120px]">Video/File</span>
                         </a>
                         {item.live_link && (
                           <a href={item.live_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-amber-500 font-bold hover:underline">
                             <Video size={12} className="shrink-0" />
                             <span>Live Session</span>
                           </a>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:bg-amber-50" onClick={() => handleEdit(item)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={() => deleteMaterial(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
