"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Send, 
  MessageSquare, 
  Star, 
  Search,
  RefreshCcw,
  AlertCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Swal from 'sweetalert2'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [search, setSearch] = useState("")

  const [feedbackData, setFeedbackData] = useState({
    mentor_feedback: "",
    material_score: 0
  })

  // 1. PERBAIKAN: Fungsi Fetch Data yang sinkron dengan Backend
  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("https://backend.mejatika.com/api/materials", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      const result = await res.json()
      
      // Ambil dari result.data karena Backend membungkusnya
      const allMaterials = result.data || []
      
      // Filter: Hanya yang sudah ada jawaban tapi belum dinilai atau perlu direview
      const onlySubmissions = allMaterials.filter((m: any) => 
        m.student_answer !== null && m.student_answer !== ""
      )
      
      setSubmissions(onlySubmissions)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenReview = (sub: any) => {
    setSelectedSub(sub)
    setFeedbackData({
      mentor_feedback: sub.mentor_feedback || "",
      material_score: sub.material_score || 0
    })
  }

  // 2. PERBAIKAN: Fungsi Submit Feedback (Metode PUT)
  const submitFeedback = async () => {
    if (feedbackData.material_score < 0 || feedbackData.material_score > 100) {
      return Swal.fire('Error', 'Skor harus antara 0-100', 'warning')
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/materials/${selectedSub.id}`, {
        method: "PUT", // Gunakan PUT langsung karena kita mengirim JSON
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
      })

      if (res.ok) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Nilai dan feedback telah disimpan.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
        setSelectedSub(null)
        fetchData()
      } else {
        throw new Error("Gagal update")
      }
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  // 3. FITUR: Filter Pencarian
  const filteredSubmissions = submissions.filter(sub => 
    sub.title.toLowerCase().includes(search.toLowerCase()) || 
    sub.course?.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Koreksi tugas dan berikan apresiasi kepada siswa.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Cari materi atau kursus..." 
              className="pl-10 rounded-2xl bg-white border-zinc-200 h-12 shadow-sm focus:ring-amber-500" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} variant="outline" className="h-12 rounded-2xl bg-white border-zinc-200 shadow-sm">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* GRID DAFTAR TUGAS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-xs">Memuat data submission...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-inner border border-zinc-100">
          <div className="bg-zinc-50 p-6 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-zinc-300" />
          </div>
          <h3 className="text-zinc-900 font-black uppercase italic">Tidak Ada Antrean</h3>
          <p className="text-zinc-400 text-sm">Belum ada tugas siswa yang perlu dikoreksi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSubmissions.map((sub) => (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all border border-zinc-100 group">
                  <CardHeader className="bg-zinc-900 text-white p-6 group-hover:bg-zinc-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-amber-500 text-white border-none text-[9px] uppercase font-black px-3">
                        {sub.course?.title || "Umum"}
                      </Badge>
                      {sub.material_score > 0 ? (
                        <div className="flex items-center text-amber-400 gap-1 text-sm font-black">
                          <Star size={14} fill="currentColor" /> {sub.material_score}
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[9px] font-bold">BELUM DINILAI</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-xl font-black italic uppercase leading-tight tracking-tighter">
                      {sub.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Jawaban Siswa:</span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md italic">Baru saja</span>
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-4 bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-200 font-medium italic">
                        "{sub.student_answer}"
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleOpenReview(sub)}
                      className="w-full bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl font-black uppercase italic text-xs h-14 shadow-lg shadow-zinc-100 transition-all"
                    >
                      <MessageSquare size={16} className="mr-2" /> 
                      {sub.material_score > 0 ? "Edit Penilaian" : "Beri Nilai & Feedback"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL REVIEW */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-zinc-900 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                Review <span className="text-amber-500">Submission</span>
              </DialogTitle>
              <p className="text-zinc-400 text-sm font-bold uppercase italic tracking-widest mt-1">
                Materi: {selectedSub?.title}
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100">
              <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Isi Jawaban Siswa</Label>
              <div className="text-zinc-700 text-sm whitespace-pre-wrap font-medium leading-relaxed italic">
                "{selectedSub?.student_answer}"
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-xs">Skor (0-100)</Label>
                <Input 
                  type="number" 
                  value={feedbackData.material_score}
                  onChange={(e) => setFeedbackData({...feedbackData, material_score: parseInt(e.target.value) || 0})}
                  className="h-14 rounded-2xl border-zinc-200 text-xl font-black text-center focus:ring-amber-500"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-xs">Feedback Mentor</Label>
                <textarea 
                  className="w-full h-32 p-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  placeholder="Contoh: Kerja bagus! Pertahankan logikanya..."
                  value={feedbackData.mentor_feedback}
                  onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSub(null)}
                className="flex-1 h-14 rounded-2xl font-bold uppercase italic text-zinc-400"
              >
                Batal
              </Button>
              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="flex-[2] h-14 bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-amber-100 transition-all"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : (
                  <>Simpan Penilaian <Send size={18} className="ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
