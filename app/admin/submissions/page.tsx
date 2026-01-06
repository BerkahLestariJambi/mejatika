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
  History,
  MessageCircle
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
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Error', 'Skor harus di antara 0-100', 'warning')
    }

    setIsUpdating(true)
    const token = localStorage.getItem("token")
    try {
      // Menggunakan rute update yang sudah ada atau rute mentor-reply baru
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
          title: 'Berhasil!',
          text: `Penilaian & Feedback untuk ${selectedSub.user?.name} diperbarui.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        setSelectedSub(null)
        fetchData() 
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
      {/* ... (Header Section Sama Seperti Sebelumnya) ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Manajemen penilaian & diskusi modul.</p>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-xs">Loading Submissions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => (
              <motion.div key={sub.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all group">
                  <CardHeader className="bg-zinc-900 text-white p-6 group-hover:bg-zinc-800 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5">
                        {sub.material?.course?.title || "MODULE"}
                      </Badge>
                      {sub.student_reply && (
                         <div className="flex items-center gap-1 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black animate-pulse">
                            <MessageCircle size={8} /> ADA BALASAN
                         </div>
                      )}
                    </div>
                    <CardTitle className="text-lg font-black italic uppercase leading-none tracking-tighter min-h-[2.5rem] line-clamp-2">
                      {sub.material?.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase italic">
                       <User size={12} className="text-amber-500" /> {sub.user?.name}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Jawaban Siswa:</span>
                      <p className="text-xs text-zinc-600 line-clamp-2 font-medium italic italic">"{sub.student_answer}"</p>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-zinc-400 uppercase">Nilai</span>
                         <span className={`text-sm font-black ${sub.score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {sub.score > 0 ? `${sub.score}/100` : "BELUM DINILAI"}
                         </span>
                       </div>
                       <Button 
                        onClick={() => handleOpenReview(sub)}
                        className="rounded-xl bg-zinc-900 hover:bg-amber-500 font-black text-[10px] uppercase italic h-9 px-4"
                       >
                         Review & Chat
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL REVIEW & DISCUSSION SYSTEM */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Review Modul</span>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {selectedSub?.user?.name} <span className="text-zinc-500">—</span> {selectedSub?.material?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* AREA DISKUSI (MIRIP CHAT) */}
            <div className="space-y-4">
               <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Riwayat Diskusi</Label>
               
               {/* Pesan Jawaban Awal Siswa */}
               <div className="flex flex-col items-start space-y-1">
                  <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none border border-zinc-200 max-w-[90%]">
                     <p className="text-xs font-black text-amber-600 uppercase mb-1">Siswa (Tugas):</p>
                     <p className="text-sm text-zinc-700 font-medium italic">"{selectedSub?.student_answer}"</p>
                  </div>
               </div>

               {/* Balasan/Chat dari Siswa jika ada */}
               {selectedSub?.student_reply && (
                 <div className="flex flex-col items-start space-y-1 animate-in slide-in-from-left-4">
                    <div className="bg-rose-50 p-4 rounded-2xl rounded-tl-none border border-rose-100 max-w-[90%] shadow-sm">
                       <p className="text-xs font-black text-rose-600 uppercase mb-1">Pesan Balasan Siswa:</p>
                       <p className="text-sm text-zinc-800 font-bold italic">"{selectedSub?.student_reply}"</p>
                    </div>
                 </div>
               )}

               {/* Feedback/Balasan Mentor sebelumnya */}
               {selectedSub?.mentor_feedback && (
                 <div className="flex flex-col items-end space-y-1">
                    <div className="bg-zinc-900 p-4 rounded-2xl rounded-tr-none text-white max-w-[90%] shadow-lg">
                       <p className="text-[9px] font-black text-amber-500 uppercase mb-1 text-right">Anda (Mentor):</p>
                       <p className="text-sm italic font-medium">"{selectedSub?.mentor_feedback}"</p>
                    </div>
                 </div>
               )}
            </div>

            <hr className="border-zinc-100" />

            {/* FORM INPUT FEEDBACK/BALASAN BARU */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px]">Skor</Label>
                <Input 
                  type="number" 
                  value={feedbackData.score}
                  onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})}
                  className="h-12 rounded-xl border-zinc-200 text-xl font-black text-center"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label className="font-black text-zinc-900 uppercase italic text-[10px]">Tulis Balasan / Feedback</Label>
                <textarea 
                  className="w-full h-24 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium resize-none transition-all bg-zinc-50"
                  placeholder="Kirim feedback atau jawab pertanyaan siswa..."
                  value={feedbackData.mentor_feedback}
                  onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSub(null)}
                className="flex-1 h-12 rounded-xl font-black uppercase italic text-zinc-400"
              >
                Tutup
              </Button>
              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="flex-[2] h-12 bg-amber-500 hover:bg-zinc-900 text-white rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-amber-100 transition-all"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : "Update Feedback & Skor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
