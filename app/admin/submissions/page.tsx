"use client"

// 1. Tambahkan ini agar tidak error saat build Vercel (Next.js 15+)
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
  CheckCircle2,
  Send
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

  // 2. Fetch Data dengan pengamanan SSR (typeof window)
  const fetchData = useCallback(async () => {
    if (typeof window === "undefined") return
    
    setLoading(true)
    const token = localStorage.getItem("token")
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch("https://backend.mejatika.com/api/admin/submissions", {
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
      // Swal hanya dipanggil jika di browser
      if (typeof window !== "undefined") {
        Swal.fire('Error', 'Gagal mengambil data dari server', 'error')
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

  // 3. Fungsi Kirim Feedback & Skor
  const submitFeedback = async () => {
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

      const result = await res.json()

      if (res.ok) {
        const isLulus = feedbackData.score >= 75
        
        Swal.fire({
          title: isLulus ? 'Lulus & Sertifikat Terbit!' : 'Penilaian Disimpan',
          text: isLulus 
            ? `Sertifikat otomatis dikirim ke profil ${selectedSub.user?.name}`
            : `Feedback untuk ${selectedSub.user?.name} berhasil diperbarui.`,
          icon: isLulus ? 'success' : 'info',
          confirmButtonColor: '#f59e0b',
        })
        
        setSelectedSub(null)
        fetchData() 
      } else {
        throw new Error(result.message || "Gagal update")
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
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Evaluasi tugas & otomatisasi sertifikat lulus.</p>
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
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white border-zinc-200">
            <RefreshCcw size={18} className={loading ? "animate-spin text-amber-500" : "text-zinc-600"} />
          </Button>
        </div>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-[10px]">Loading Mejatika Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => (
              <motion.div key={sub.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-all border border-transparent hover:border-amber-200">
                  <CardHeader className="bg-zinc-900 text-white p-6">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5 uppercase">
                        {sub.material?.course?.title || "MODUL"}
                      </Badge>
                      {sub.score >= 75 && (
                        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-emerald-500/30">
                          <Award size={8} /> CERTIFIED
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
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Status Proyek:</span>
                      {sub.project_link && sub.project_link !== '-' ? (
                         <a href={sub.project_link} target="_blank" className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                           Buka Proyek <ExternalLink size={10} />
                         </a>
                      ) : (
                        <p className="text-xs text-zinc-600 line-clamp-2 font-medium italic">"{sub.student_answer || "Tidak ada jawaban tekstual"}"</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-zinc-400 uppercase">Nilai</span>
                         <span className={`text-sm font-black ${sub.score >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {sub.score > 0 ? `${sub.score}/100` : "PENDING"}
                         </span>
                       </div>
                       
                       <Button 
                        onClick={() => handleOpenReview(sub)}
                        className={`rounded-xl font-black text-[10px] uppercase italic h-9 px-4 ${
                          sub.student_reply ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' : 'bg-zinc-900 hover:bg-amber-500'
                        }`}
                       >
                         {sub.student_reply ? <><MessageCircle size={12} className="mr-1" /> Jawab Chat</> : "Review & Nilai"}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL REVIEW */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {selectedSub?.user?.name} <span className="text-zinc-500">—</span> Review
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Riwayat Chat/Feedback */}
            <div className="space-y-4">
               <div className="bg-zinc-100 p-4 rounded-3xl rounded-tl-none border border-zinc-200">
                  <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Jawaban Siswa:</p>
                  <p className="text-sm text-zinc-700 italic">"{selectedSub?.student_answer}"</p>
               </div>

               {selectedSub?.mentor_feedback && (
                 <div className="flex flex-col items-end">
                    <div className="bg-zinc-900 p-4 rounded-3xl rounded-tr-none text-white max-w-[90%]">
                       <p className="text-sm italic font-medium">"{selectedSub?.mentor_feedback}"</p>
                    </div>
                 </div>
               )}

               {selectedSub?.student_reply && (
                 <div className="animate-in fade-in slide-in-from-left-4">
                    <div className="bg-rose-500 p-4 rounded-3xl rounded-tl-none text-white max-w-[90%] shadow-md">
                       <p className="text-[9px] font-black text-rose-200 uppercase mb-1">Chat Siswa:</p>
                       <p className="text-sm font-bold italic">"{selectedSub?.student_reply}"</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-4 gap-4 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
              <div className="col-span-1 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px]">Skor</Label>
                <Input 
                  type="number" 
                  value={feedbackData.score}
                  onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})}
                  className="h-12 rounded-2xl text-center font-black"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px]">Feedback</Label>
                <textarea 
                  className="w-full h-24 p-4 rounded-2xl border border-zinc-200 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ketik feedback di sini..."
                  value={feedbackData.mentor_feedback}
                  onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setSelectedSub(null)} className="flex-1 rounded-2xl font-black uppercase">
                Tutup
              </Button>
              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="flex-[2] h-12 bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Send size={18} /> Update & {feedbackData.score >= 75 ? "Terbitkan Sertifikat" : "Simpan"}
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
