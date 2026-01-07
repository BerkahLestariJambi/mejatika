"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Edit3,
  Globe,
  Search,
  ExternalLink,
  Video,
  ClipboardCheck,
  Rocket,
  ChevronLeft
} from "lucide-react"
import {
  Dialog,
  DialogContent,
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

export default function ManageMaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id // Menangkap ID dari URL

  const [materials, setMaterials] = useState<any[]>([])
  const [currentCourse, setCurrentCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const API_BASE = "https://backend.mejatika.com/api"
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  const [formData, setFormData] = useState({
    title: "",
    course_id: courseId?.toString() || "",
    file: "", 
    live_link: "",
    content: "",
    quiz_task: "",
    project_link: "",
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
      // Ambil detail kursus ini dan materinya
      const resCourse = await fetch(`${API_BASE}/courses/${courseId}`)
      const dataCourse = await resCourse.json()
      setCurrentCourse(dataCourse)

      // Ambil semua materi (Filter akan dilakukan di frontend agar search tetap jalan)
      const resMat = await fetch(`${API_BASE}/materials`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const dataMat = await resMat.json()
      
      const allMaterials = Array.isArray(dataMat) ? dataMat : dataMat.data || []
      // Hanya tampilkan materi yang milik kursus ini
      setMaterials(allMaterials.filter((m: any) => m.course_id.toString() === courseId))
      
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => { if (courseId) fetchData() }, [fetchData, courseId])

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [materials, searchQuery])

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || "",
      course_id: courseId?.toString() || "",
      file: item.file || "",
      live_link: item.live_link || "",
      content: item.content || "",
      quiz_task: item.quiz_task || "",
      project_link: item.project_link || "",
    })
    setOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ 
        title: "", 
        course_id: courseId?.toString() || "", 
        file: "", 
        live_link: "", 
        content: "", 
        quiz_task: "", 
        project_link: "" 
    })
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const token = localStorage.getItem("token")
    const url = editingId 
      ? `${API_BASE}/materials/${editingId}`
      : `${API_BASE}/materials`
    
    const payload = editingId 
      ? { ...formData, _method: "PUT" } 
      : formData

    try {
      const res = await fetch(url, {
        method: "POST", 
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        Toast.fire({ icon: 'success', title: editingId ? 'Materi diperbarui' : 'Materi diterbitkan' });
        resetForm()
        fetchData()
      } else {
        const result = await res.json()
        Toast.fire({ icon: 'error', title: result.message || 'Gagal menyimpan' });
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Koneksi bermasalah' });
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMaterial = async (id: number) => {
    Swal.fire({
      title: 'Hapus materi?',
      text: "Data akan hilang permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token")
        try {
          const res = await fetch(`${API_BASE}/materials/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          })
          if (res.ok) {
            fetchData()
            Toast.fire({ icon: 'success', title: 'Terhapus' })
          }
        } catch (err) {
          Toast.fire({ icon: 'error', title: 'Gagal' })
        }
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* BREADCRUMB */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-zinc-400 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest p-0"
      >
        <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
      </Button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-zinc-900 leading-tight">
            KELOLA <span className="text-amber-500">MATERI</span>
          </h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-tighter italic">
            Kursus: {currentCourse?.title || 'Memuat...'}
          </p>
        </motion.div>

        <Button 
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-zinc-900 hover:bg-amber-500 hover:text-zinc-900 text-white rounded-2xl shadow-xl font-black italic uppercase text-xs h-12 px-8 transition-all"
        >
          <Plus className="mr-2 h-5 w-5" /> Tambah Materi Baru
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
        <Input 
          placeholder="Cari judul materi di kursus ini..." 
          className="pl-12 h-12 rounded-2xl border-zinc-100 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MODAL (DIALOG EDITOR) */}
      <Dialog open={open} onOpenChange={(v) => { if(!v) resetForm(); }}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="w-[90%] mx-auto relative z-50">
             <div className="w-full h-12 bg-zinc-900 rounded-full shadow-xl flex items-center px-10 border-b-4 border-amber-500">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">EDITOR MATERI • MEJATIKA</span>
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 -mt-6 pt-12 pb-10 px-8 rounded-[2.5rem] shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-amber-600 tracking-widest">Judul Materi</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="Contoh: Pengenalan Dasar UI/UX"
                  className="rounded-xl border-zinc-100 h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Link Video/YT/Drive
                  </Label>
                  <Input 
                    value={formData.file} 
                    onChange={(e) => setFormData({...formData, file: e.target.value})} 
                    required 
                    className="rounded-xl border-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-2">
                    <Video className="w-3 h-3" /> Link Live Session (Opsional)
                  </Label>
                  <Input 
                    value={formData.live_link} 
                    onChange={(e) => setFormData({...formData, live_link: e.target.value})} 
                    className="rounded-xl border-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-amber-600">Deskripsi & Pembahasan Materi</Label>
                <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} 
                    modules={quillModules} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-amber-500" /> Soal Latihan (Quiz)
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-2xl border border-zinc-200 text-xs outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Tuliskan soal-soal untuk materi ini..."
                    value={formData.quiz_task}
                    onChange={(e) => setFormData({...formData, quiz_task: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-amber-500" /> Instruksi Projek Akhir
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-2xl border border-zinc-200 text-xs outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Instruksi untuk tugas praktek..."
                    value={formData.project_link}
                    onChange={(e) => setFormData({...formData, project_link: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 rounded-xl font-bold uppercase text-xs">Batal</Button>
                 <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-zinc-900 hover:bg-amber-500 hover:text-zinc-900 text-white font-black italic rounded-xl h-14 uppercase transition-all shadow-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "SIMPAN PERUBAHAN" : "PUBLIKASIKAN MATERI"}
                 </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* MATERIALS TABLE */}
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900 text-[10px] font-black uppercase text-white tracking-widest">
                <th className="px-8 py-5 italic">Daftar Materi</th>
                <th className="px-8 py-5 italic">Akses Media</th>
                <th className="px-8 py-5 text-right italic">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-amber-500" size={40} /></td></tr>
              ) : filteredMaterials.length === 0 ? (
                <tr><td colSpan={3} className="py-20 text-center text-zinc-400 italic font-medium">Belum ada materi untuk kursus ini.</td></tr>
              ) : (
                filteredMaterials.map((item) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-zinc-50 hover:bg-amber-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-zinc-900 uppercase italic tracking-tight">{item.title}</div>
                      <div className="flex gap-2 mt-2">
                        {item.quiz_task && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-black italic uppercase">QUIZ ACTIVE</span>}
                        {item.project_link && <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black italic uppercase">PROJECT TASK</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <a href={item.file} target="_blank" className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900">
                            <ExternalLink size={12} className="text-amber-500" /> LIHAT VIDEO/FILE
                          </a>
                          {item.live_link && (
                            <a href={item.live_link} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:text-amber-700">
                              <Video size={12} /> JOIN LIVE SESSION
                            </a>
                          )}
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md text-amber-600" onClick={() => handleEdit(item)}>
                          <Edit3 className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-500" onClick={() => deleteMaterial(item.id)}>
                          <Trash2 className="h-5 w-5" />
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
