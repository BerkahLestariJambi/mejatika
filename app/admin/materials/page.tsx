"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  Loader2, 
  Trash2, 
  Upload,
  BookOpen,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([]) // Untuk dropdown pilih kursus
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [open, setOpen] = useState(false)

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    file: null as File | null,
  })

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      // 1. Ambil data materi
      const resMat = await fetch("https://backend.mejatika.com/api/materials", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const dataMat = await resMat.json()
      setMaterials(Array.isArray(dataMat) ? dataMat : dataMat.data || [])

      // 2. Ambil data kursus untuk dropdown
      const resCourse = await fetch("https://backend.mejatika.com/api/courses")
      const dataCourse = await resCourse.json()
      setCourses(dataCourse.data || dataCourse)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file || !formData.course_id) return alert("Lengkapi data!")

    setIsUploading(true)
    const token = localStorage.getItem("token")
    const data = new FormData()
    data.append("title", formData.title)
    data.append("course_id", formData.course_id)
    data.append("file", formData.file) // Sesuaikan key dengan $request->file('file') di Laravel

    try {
      const res = await fetch("https://backend.mejatika.com/api/materials", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      })

      if (res.ok) {
        setOpen(false)
        setFormData({ title: "", course_id: "", file: null })
        fetchData()
      } else {
        alert("Gagal mengunggah materi.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setIsUploading(false)
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
          <p className="text-zinc-500 font-medium">Upload PDF, Video, atau Dokumen belajar.</p>
        </div>

        {/* MODAL ADD MATERIAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-zinc-800 rounded-2xl h-12 px-6 shadow-lg shadow-zinc-200 transition-all active:scale-95">
              <Plus className="mr-2 h-5 w-5 text-amber-500" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">New Material</DialogTitle>
              <DialogDescription>Input materi belajar untuk kursus spesifik.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Judul Materi</Label>
                <Input 
                  placeholder="Contoh: Dasar-dasar React Hooks" 
                  className="rounded-xl border-zinc-100 bg-zinc-50"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Pilih Kursus</Label>
                <Select onValueChange={(val) => setFormData({...formData, course_id: val})}>
                  <SelectTrigger className="rounded-xl border-zinc-100 bg-zinc-50">
                    <SelectValue placeholder="Pilih Kursus" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-100">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">File Dokumen/Video</Label>
                <div className="border-2 border-dashed border-zinc-100 rounded-2xl p-4 hover:border-amber-200 transition-colors bg-zinc-50/50">
                  <input 
                    type="file" 
                    className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                    onChange={(e) => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-xl h-12 font-bold uppercase italic tracking-tighter">
                {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4 text-amber-500" />}
                {isUploading ? "Uploading..." : "Publish Material"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE/LIST MATERIALS */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-zinc-50">
          <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Materials Library
          </CardTitle>
          <CardDescription>Total {materials.length} konten pembelajaran tersedia</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-amber-500 h-10 w-10" /></div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm">Belum ada materi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest">Materi & Kursus</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-center">Tipe File</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {materials.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-zinc-900 group-hover:text-amber-600 transition-colors leading-none mb-1">{item.title}</div>
                        <div className="text-[10px] font-black uppercase italic text-zinc-400 tracking-tighter">Kursus: {item.course?.title || 'Unknown'}</div>
                      </td>
                      <td className="p-6 text-center">
                         <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase italic">
                           {item.file_path?.split('.').pop() || 'File'}
                         </span>
                      </td>
                      <td className="p-6 text-right">
                        <Button 
                          onClick={() => deleteMaterial(item.id)}
                          variant="ghost" 
                          size="icon" 
                          className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </Button>
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
