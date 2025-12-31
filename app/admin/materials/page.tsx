"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
  Rocket
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

  // State Form disesuaikan dengan database: project_link
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    file: "", 
    live_link: "",
    content: "",
    quiz_task: "",
    project_link: "", // Nama kolom sesuai phpMyAdmin
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

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      title: item.title || "",
      course_id: item.course_id ? item.course_id.toString() : "",
      file: item.file || "",
      live_link: item.live_link || "",
      content: item.content || "",
      quiz_task: item.quiz_task || "",
      project_link: item.project_link || "", // Mapping dari DB
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
        project_link: "" 
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
    
    // Method Spoofing untuk Laravel
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

      const result = await res.json()

      if (res.ok) {
        Toast.fire({ icon: 'success', title: editingId ? 'Materi diperbarui' : 'Materi diterbitkan' });
        resetForm()
        fetchData()
      } else {
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
          const res = await fetch(`https://backend.mejatika.com/api/materials/${id}`, {
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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-amber-600">MANAGEMENT MATERI</h1>
          <p className="text-muted-foreground text-sm">Update materi, quiz, dan instruksi projek</p>
        </motion.div>

        <Button 
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-amber-500 hover:bg-amber-600 rounded-full shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Tambah Materi
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
        <Input 
          placeholder="Cari materi..." 
          className="pl-10 rounded-full border-amber-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={(v) => { if(!v) resetForm(); }}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="w-[95%] mx-auto relative z-50">
            <div className="w-full h-12 bg-amber-500 rounded-full shadow-xl flex items-center px-10 border-b-4 border-amber-700/20">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">EDITOR MATERI MEJATIKA</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 -mt-6 pt-12 pb-10 px-8 rounded-b-3xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600">Judul</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                    className="rounded-xl border-amber-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600">Kursus</Label>
                  <Select 
                    value={formData.course_id}
                    onValueChange={(val) => setFormData({...formData, course_id: val})}
                  >
                    <SelectTrigger className="rounded-xl border-amber-100">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Link Video/Materi
                  </Label>
                  <Input 
                    value={formData.file} 
                    onChange={(e) => setFormData({...formData, file: e.target.value})} 
                    required 
                    className="rounded-xl border-amber-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-2">
                    <Video className="w-3 h-3" /> Link Live Session
                  </Label>
                  <Input 
                    value={formData.live_link} 
                    onChange={(e) => setFormData({...formData, live_link: e.target.value})} 
                    className="rounded-xl border-amber-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-amber-600">Deskripsi</Label>
                <div className="bg-white rounded-xl border border-amber-100 overflow-hidden shadow-sm">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} 
                    modules={quillModules} 
                  />
                </div>
              </div>

              {/* ASIGNMENT SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/30 p-6 rounded-3xl border border-amber-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Soal Latihan (Quiz)
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-2xl border border-amber-100 text-xs focus:ring-amber-500 outline-none"
                    placeholder="Masukkan soal..."
                    value={formData.quiz_task}
                    onChange={(e) => setFormData({...formData, quiz_task: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Instruksi Projek
                  </Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-2xl border border-amber-100 text-xs focus:ring-amber-500 outline-none"
                    placeholder="Masukkan instruksi projek..."
                    value={formData.project_link} // Sesuai kolom DB
                    onChange={(e) => setFormData({...formData, project_link: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 rounded-xl">Batal</Button>
                 <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "SIMPAN PERUBAHAN" : "TERBITKAN"}
                 </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50/50 text-[10px] font-black uppercase text-amber-700 border-b border-amber-100">
                <th className="px-6 py-4">Materi</th>
                <th className="px-6 py-4">Link</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-amber-500" /></td></tr>
              ) : (
                filteredMaterials.map((item) => (
                  <motion.tr key={item.id} className="border-b border-zinc-50 hover:bg-amber-50/20 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-zinc-800">{item.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[8px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            {item.course?.title || 'Umum'}
                        </span>
                        {item.quiz_task && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">QUIZ</span>}
                        {item.project_link && <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">PROJECT</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <a href={item.file} target="_blank" className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-amber-600">
                            <ExternalLink size={10} /> Video/File
                          </a>
                          {item.live_link && (
                            <a href={item.live_link} target="_blank" className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                              <Video size={10} /> Live
                            </a>
                          )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500" onClick={() => handleEdit(item)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => deleteMaterial(item.id)}>
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
