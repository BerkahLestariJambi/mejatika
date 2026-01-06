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
  AlertCircle,
  User,
  History
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
    score: 0
  })

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("https://backend.mejatika.com/api/admin/submissions", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      const result = await res.json()
      setSubmissions(result.data || [])
    } catch (err) {
      console.error("Fetch error:", err)
      Swal.fire('Error', 'Gagal mengambil data dari server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleOpenReview = (sub: any) => {
    setSelectedSub(sub)
    setFeedbackData({
      mentor_feedback: sub.mentor_feedback || "",
      score: sub.score || 0
    })
  }

  const submitFeedback = async () => {
    // Final check sebelum kirim
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Error', 'Skor harus di antara 0-100', 'warning')
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
      })

      if (res.ok) {
        Swal.fire({
          title: 'Tugas Dinilai!',
          text: `Skor ${feedbackData.score} berhasil dikirim ke ${selectedSub.user?.name}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        setSelectedSub(null)
        fetchData() // Refresh list
      } else {
        throw new Error("Gagal update")
      }
    } catch (err) {
      Swal.fire('Gagal', 'Koneksi terputus atau server error.', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredSubmissions = submissions.filter(sub => 
    sub.material?.title.toLowerCase().includes(search.toLowerCase()) || 
    sub.user?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Sistem penilaian tugas terintegrasi Mejatika.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Cari materi atau nama..." 
              className="pl-10 rounded-2xl bg-white border-zinc-200 h-12 shadow-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-xs">Syncing Data...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
          <AlertCircle className="h-12 w-12 text-zinc-200 mb-4" />
          <h3 className="text-zinc-900 font-black uppercase italic">Tidak Ada Data</h3>
          <p className="text-zinc-400 text-sm">Coba kata kunci lain atau segarkan halaman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all group">
                  <CardHeader className="bg-zinc-900 text-white p-6 group-hover:bg-zinc-800 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5">
                        {sub.material?.course?.title || "MODULE"}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <User size={12} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase truncate max-w-[80px]">{sub.user?.name}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-black italic uppercase leading-none tracking-tighter min-h-[2.5rem] line-clamp-2">
                      {sub.material?.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Jawaban:</span>
                      <p className="text-xs text-zinc-600 line-clamp-3 font-medium italic leading-relaxed">
                        "{sub.student_answer}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between px-1">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-zinc-400 uppercase">Status</span>
                         {sub.score > 0 ? (
                           <div className="flex items-center text-emerald-500 font-black text-sm">
                             <Star size={12} fill="currentColor" className="mr-1" /> {sub.score}/100
                           </div>
                         ) : (
                           <span className="text-[10px] text-rose-500 font-black animate-pulse">PENDING</span>
                         )}
                       </div>
                       <Button 
                        onClick={() => handleOpenReview(sub)}
                        size="sm"
                        className="rounded-xl bg-zinc-900 hover:bg-amber-500 font-black text-[10px] uppercase italic h-9 px-4"
                       >
                         {sub.score > 0 ? "Edit Nilai" : "Beri Nilai"}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL REVIEW / REPLY SYSTEM */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-zinc-900 p-8 text-white relative">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Assessment</span>
              </div>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                {selectedSub?.score > 0 ? "Update" : "Submit"} <span className="text-amber-500">Feedback</span>
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Konten Jawaban Siswa</Label>
                <Badge variant="outline" className="text-[9px] border-zinc-200 text-zinc-400 font-bold italic">
                   ID: #{selectedSub?.id}
                </Badge>
              </div>
              <div className="bg-zinc-50 p-5 rounded-[1.5rem] border border-zinc-100 max-h-40 overflow-y-auto custom-scrollbar">
                <p className="text-zinc-600 text-sm font-medium italic leading-relaxed">
                  "{selectedSub?.student_answer}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px] flex items-center gap-1">
                  Skor <Star size={10} className="text-amber-500" />
                </Label>
                <Input 
                  type="number" 
                  min="0"
                  max="100"
                  value={feedbackData.score}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 100) return;
                    setFeedbackData({...feedbackData, score: isNaN(val) ? 0 : val})
                  }}
                  className="h-14 rounded-2xl border-zinc-200 text-2xl font-black text-center focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px] flex items-center gap-1">
                  Feedback Mentor <MessageSquare size={10} className="text-amber-500" />
                </Label>
                <textarea 
                  className="w-full h-32 p-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium resize-none transition-all"
                  placeholder="Contoh: Jawaban sudah bagus, namun perlu diperdalam di bagian implementasi..."
                  value={feedbackData.mentor_feedback}
                  onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSub(null)}
                className="flex-1 h-14 rounded-2xl font-black uppercase italic text-zinc-400 hover:bg-zinc-50"
              >
                Batal
              </Button>
              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="flex-[2] h-14 bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-amber-100 transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center">
                    Simpan Penilaian <Send size={16} className="ml-2" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
