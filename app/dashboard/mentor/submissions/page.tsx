"use client"

// 1. Pengamanan Build (Next.js 15+)
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Search,
  RefreshCcw,
  User,
  MessageCircle,
  Award,
  ExternalLink,
  Send,
  BookOpen
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Swal from 'sweetalert2'

export default function MentorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [search, setSearch] = useState("")

  const [feedbackData, setFeedbackData] = useState({
    mentor_feedback: "",
    score: 0
  })

  // 2. Fetch Data dari endpoint MENTOR
  const fetchData = useCallback(async () => {
    if (typeof window === "undefined") return
    
    setLoading(true)
    const token = localStorage.getItem("token")
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      // PERUBAHAN: Endpoint sekarang ke /mentor/submissions
      const res = await fetch("https://backend.mejatika.com/api/mentor/submissions", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        cache: 'no-store'
      })
      const result = await res.json()
      if (result.success) {
        setSubmissions(result.data || [])
      }
    } catch (err) {
      console.error("Fetch error:", err)
      if (typeof window !== "undefined") {
        Swal.fire('Error', 'Gagal mengambil data tugas siswa', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { 
    fetchData() 
  }, [fetchData])

  const handleOpenReview = (sub: any) => {
    setSelectedSub(sub)
    setFeedbackData({
      mentor_feedback: sub.mentor_feedback || "",
      score: sub.score || 0
    })
  }

  // 3. Fungsi Kirim Penilaian (Assessment)
  const submitFeedback = async () => {
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Error', 'Skor harus di antara 0-100', 'warning')
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    
    try {
      // PERUBAHAN: Endpoint update assessment khusus mentor
      const res = await fetch(`https://backend.mejatika.com/api/mentor/submissions/${selectedSub.id}/assessment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            score: feedbackData.score,
            mentor_feedback: feedbackData.mentor_feedback
        })
      })

      const result = await res.json()

      if (res.ok) {
        const isLulus = feedbackData.score >= 75
        
        Swal.fire({
          title: isLulus ? 'Lulus & Sertifikat Terbit!' : 'Penilaian Disimpan',
          text: isLulus 
            ? `Siswa ${selectedSub.user?.name} dinyatakan LULUS.`
            : `Feedback untuk ${selectedSub.user?.name} berhasil diperbarui.`,
          icon: isLulus ? 'success' : 'info',
          confirmButtonColor: '#f59e0b',
        })
        
        setSelectedSub(null)
        fetchData() 
      } else {
        throw new Error(result.message || "Gagal menyimpan penilaian")
      }
    } catch (err: any) {
      Swal.fire('Gagal', err.message, 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredSubmissions = submissions.filter(sub => 
    sub.material?.title.toLowerCase().includes(search.toLowerCase()) || 
    sub.user?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Mentor <span className="text-amber-500">Grading</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">Evaluasi tugas dari kursus yang Anda ampu.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Cari materi atau nama siswa..." 
              className="pl-10 rounded-2xl bg-white border-zinc-200 h-12 shadow-sm focus:ring-amber-500" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white border-zinc-200 shadow-sm">
            <RefreshCcw size={18} className={loading ? "animate-spin text-amber-500" : "text-zinc-600"} />
          </Button>
        </div>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-[10px]">Sinkronisasi Tugas Siswa...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
           <BookOpen className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
           <p className="text-zinc-500 font-bold italic">Belum ada tugas yang masuk untuk kursus Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => (
              <motion.div key={sub.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all group">
                  <CardHeader className="bg-zinc-900 text-white p-6 relative">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5 uppercase tracking-wider">
                        {sub.material?.course?.title || "MODUL"}
                      </Badge>
                      {sub.score >= 75 && (
                        <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black">
                          <Award size={8} /> LULUS
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg font-black italic uppercase tracking-tighter line-clamp-2 min-h-[2.5rem]">
                      {sub.material?.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase italic">
                       <User size={12} className="text-amber-500" /> {sub.user?.name}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-2 tracking-widest">Lampiran Tugas:</span>
                      {sub.project_link && sub.project_link !== '-' ? (
                         <a href={sub.project_link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-amber-500 transition-colors">
                           <ExternalLink size={12} /> Buka Link Proyek
                         </a>
                      ) : (
                        <p className="text-xs text-zinc-600 line-clamp-2 font-medium italic leading-relaxed">
                          {sub.student_answer || "Tidak ada lampiran teks."}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-zinc-400 uppercase">Skor Saat Ini</span>
                         <span className={`text-xl font-black ${sub.score >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {sub.score > 0 ? sub.score : "—"}
                         </span>
                       </div>
                       
                       <Button 
                        onClick={() => handleOpenReview(sub)}
                        className={`rounded-xl font-black text-[10px] uppercase italic h-10 px-5 shadow-lg shadow-zinc-200 transition-transform active:scale-95 ${
                          sub.student_reply ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' : 'bg-zinc-900 hover:bg-amber-500'
                        }`}
                       >
                         {sub.student_reply ? <><MessageCircle size={14} className="mr-2" /> Ada Balasan Siswa</> : "Beri Nilai"}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL REVIEW & GRADING */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award size={120} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                Reviewing <span className="text-amber-500">{selectedSub?.user?.name}</span>
              </DialogTitle>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Modul: {selectedSub?.material?.title}</p>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Jawaban/Konteks */}
            <div className="space-y-4">
               <div className="bg-zinc-100 p-5 rounded-3xl rounded-tl-none border border-zinc-200">
                  <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Isi Jawaban Siswa:</p>
                  <p className="text-sm text-zinc-700 italic font-medium leading-relaxed">
                    {selectedSub?.student_answer || "Siswa tidak mengirimkan jawaban teks."}
                  </p>
               </div>

               {selectedSub?.student_reply && (
                 <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4">
                    <div className="bg-rose-100 p-5 rounded-3xl rounded-tl-none border-2 border-rose-200 max-w-[90%]">
                       <p className="text-[9px] font-black text-rose-500 uppercase mb-2 flex items-center gap-1">
                          <MessageCircle size={10} /> Pesan Terakhir Siswa:
                       </p>
                       <p className="text-sm font-bold text-rose-700 italic">"{selectedSub?.student_reply}"</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Form Penilaian */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100 shadow-inner">
              <div className="md:col-span-1 space-y-2 text-center">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px] tracking-widest">Skor (0-100)</Label>
                <Input 
                  type="number" 
                  min="0"
                  max="100"
                  value={feedbackData.score}
                  onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})}
                  className="h-14 rounded-2xl text-center font-black text-2xl border-2 border-zinc-200 focus:border-amber-500 transition-all"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px] tracking-widest">Feedback Mentor</Label>
                <textarea 
                  className="w-full h-28 p-4 rounded-2xl border-2 border-zinc-200 text-sm font-medium resize-none outline-none focus:border-amber-500 transition-all"
                  placeholder="Berikan saran atau catatan evaluasi untuk siswa ini..."
                  value={feedbackData.mentor_feedback}
                  onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setSelectedSub(null)} className="flex-1 h-14 rounded-2xl font-black uppercase text-zinc-400 hover:text-zinc-900">
                Kembali
              </Button>
              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="flex-[2] h-14 bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Send size={18} /> {feedbackData.score >= 75 ? "Luluskan Siswa" : "Simpan Evaluasi"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
