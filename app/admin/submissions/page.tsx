"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Send, 
  Search,
  RefreshCcw,
  User,
  MessageCircle,
  Inbox,
  ExternalLink
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Swal from 'sweetalert2'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [feedbackData, setFeedbackData] = useState({ mentor_feedback: "", score: 0 })

  // 1. Ambil Data dari API (Paling Akurat)
  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("https://backend.mejatika.com/api/admin/submissions", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      })
      
      const result = await res.json()
      console.log("Debug Data:", result) // Cek di F12 Console

      if (res.ok) {
        // Ambil array dari result.data atau result itu sendiri
        const finalData = result.data || result
        setSubmissions(Array.isArray(finalData) ? finalData : [])
      } else {
        throw new Error(result.message || "Gagal mengambil data")
      }
    } catch (err: any) {
      console.error("Fetch Error:", err)
      // Hanya tampilkan error jika bukan karena data kosong
      if (err.message !== "Unauthorized") {
         Swal.fire('Error', err.message || 'Gagal menyambung ke server', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Auto Scroll Chat ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedSub?.discussions])

  // 2. Filter Pencarian (Aman dari null/undefined)
  const filteredSubmissions = submissions.filter(sub => {
    if (!sub) return false
    const q = search.toLowerCase()
    const studentName = sub.user?.name?.toLowerCase() || ""
    const materialTitle = sub.material?.title?.toLowerCase() || ""
    const courseTitle = sub.material?.course?.title?.toLowerCase() || ""
    
    return studentName.includes(q) || materialTitle.includes(q) || courseTitle.includes(q)
  })

  // 3. Update Skor & Feedback
  const submitScoreAndFeedback = async () => {
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Oops!', 'Skor harus di antara 0 - 100', 'warning')
    }
    
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(feedbackData)
      })
      
      if (res.ok) {
        Swal.fire({ title: 'Tersimpan!', icon: 'success', timer: 1000, showConfirmButton: false })
        fetchData() // Refresh list
        
        // Update data di modal yang sedang dibuka
        setSelectedSub({
            ...selectedSub,
            score: feedbackData.score,
            mentor_feedback: feedbackData.mentor_feedback
        })
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal update data', 'error')
    }
  }

  // 4. Kirim Chat Diskusi
  const sendNewMessage = async () => {
    if (!newMessage.trim()) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/${selectedSub.id}/discussion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: newMessage })
      })
      
      const result = await res.json()
      if (res.ok) {
        // Data sukses dikirim, tambahkan ke UI secara instan
        const chatBaru = result.data || result
        setSelectedSub({
          ...selectedSub,
          discussions: [...(selectedSub.discussions || []), chatBaru]
        })
        setNewMessage("")
      }
    } catch (err) { 
      console.error(err) 
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium text-sm">Dashboard Penilaian Tugas Siswa</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Cari nama siswa atau materi..." 
              className="pl-10 rounded-2xl bg-white border-zinc-200 h-12 shadow-sm" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white border-zinc-200 shadow-sm hover:bg-zinc-100">
            <RefreshCcw size={18} className={loading ? "animate-spin text-amber-500" : "text-zinc-600"} />
          </Button>
        </div>
      </div>

      <hr className="border-zinc-200" />

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12 mb-4" />
          <p className="text-zinc-400 font-black uppercase italic tracking-widest text-xs">Memuat Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <motion.div 
                    key={sub.id} 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-all border border-zinc-100 group">
                    <CardHeader className="bg-zinc-900 text-white p-6 group-hover:bg-zinc-800 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase px-2 py-1">
                          {sub.material?.course?.title || "MODULE"}
                        </Badge>
                        {sub.discussions?.length > 0 && (
                           <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black">
                              <MessageCircle size={8} /> {sub.discussions.length} CHAT
                           </div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-black italic uppercase leading-tight line-clamp-2 min-h-[3rem]">
                        {sub.material?.title || "Materi Tidak Ada"}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase italic">
                          <User size={12} className="text-amber-500" /> {sub.user?.name || "Unknown User"}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 min-h-[80px]">
                        <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Jawaban Siswa:</span>
                        <p className="text-xs text-zinc-600 line-clamp-3 font-medium italic">
                          {sub.student_answer ? `"${sub.student_answer}"` : "Tidak ada jawaban teks."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black text-zinc-400 uppercase">Status Nilai</span>
                           <span className={`text-sm font-black ${sub.score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {sub.score > 0 ? `${sub.score} / 100` : "BELUM DINILAI"}
                           </span>
                         </div>
                         <Button onClick={() => {
                            setSelectedSub(sub);
                            setFeedbackData({ 
                                mentor_feedback: sub.mentor_feedback || "", 
                                score: sub.score || 0 
                            });
                         }} className="rounded-xl bg-zinc-900 hover:bg-amber-500 font-black text-[10px] uppercase text-white h-9 px-6 transition-colors shadow-lg shadow-zinc-200 hover:shadow-amber-200">
                            Review
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-200 flex flex-col items-center">
                <Inbox className="h-12 w-12 text-zinc-200 mb-3" />
                <p className="text-zinc-400 font-black uppercase italic tracking-tighter">Tidak Ada Submission Yang Ditemukan</p>
                <Button variant="link" onClick={fetchData} className="text-amber-500 font-bold uppercase text-xs mt-2">Refresh Data</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL DETAIL REVIEW & CHAT DISKUSI */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Review Panel</span>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase text-white">{selectedSub?.user?.name}</DialogTitle>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-[8px] font-black text-zinc-500 uppercase">Modul / Materi</p>
                <p className="text-xs font-bold italic text-zinc-300">{selectedSub?.material?.title}</p>
            </div>
          </div>
          
          {/* AREA CHAT & SUBMISSION */}
          <div ref={scrollRef} className="p-8 space-y-6 h-[380px] overflow-y-auto bg-zinc-50/50 flex flex-col">
            {/* BOX SUBMISSION UTAMA */}
            <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-zinc-200 shadow-sm max-w-[90%]">
              <span className="text-[9px] font-black text-amber-600 uppercase block mb-1">Lampiran Tugas</span>
              <p className="text-sm text-zinc-700 font-medium italic mb-3">"{selectedSub?.student_answer || 'Tidak ada keterangan tambahan.'}"</p>
              
              {selectedSub?.project_link && (
                <a 
                  href={selectedSub.project_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                >
                  <ExternalLink size={12} /> BUKA LINK PROJECT
                </a>
              )}
            </div>

            {/* DAFTAR CHAT DISKUSI */}
            {selectedSub?.discussions?.map((chat: any) => (
              <div key={chat.id} className={`flex flex-col ${chat.user?.role === 'admin' ? 'items-end' : 'items-start'} space-y-1`}>
                <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
                    chat.user?.role === 'admin' 
                    ? 'bg-zinc-900 text-white rounded-tr-none' 
                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium">{chat.message}</p>
                </div>
                <div className="flex items-center gap-2 px-2">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
                        {chat.user?.name} • {chat.formatted_date || 'Baru saja'}
                    </span>
                </div>
              </div>
            ))}
          </div>

          {/* PANEL KONTROL MENTOR */}
          <div className="p-8 bg-white border-t border-zinc-100 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* INPUT NILAI */}
               <div className="space-y-3">
                  <Label className="font-black text-zinc-900 uppercase italic text-[10px] flex items-center gap-2">
                      <Star size={12} className="text-amber-500 fill-amber-500" /> Penilaian Mentor
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder="0-100"
                        value={feedbackData.score} 
                        onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})} 
                        className="h-12 rounded-xl font-black text-xl w-28 text-center border-2 border-zinc-100 focus:border-amber-500" 
                    />
                    <Button 
                        onClick={submitScoreAndFeedback} 
                        className="bg-emerald-500 hover:bg-emerald-600 h-12 flex-1 rounded-xl text-white font-black uppercase text-[10px] shadow-lg shadow-emerald-100"
                    >
                        Update Skor
                    </Button>
                  </div>
               </div>

               {/* INPUT PESERTA / CHAT */}
               <div className="space-y-3">
                  <Label className="font-black text-zinc-900 uppercase italic text-[10px] flex items-center gap-2">
                      <MessageCircle size={12} className="text-amber-500" /> Komentar / Diskusi
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                        placeholder="Tulis instruksi revisi..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && sendNewMessage()}
                        className="h-12 rounded-xl bg-zinc-50 text-sm border-none" 
                    />
                    <Button 
                        onClick={sendNewMessage} 
                        className="bg-zinc-900 hover:bg-amber-500 h-12 w-12 rounded-xl text-white transition-all shadow-lg"
                    >
                        <Send size={18} />
                    </Button>
                  </div>
               </div>
            </div>
            
            <button 
                onClick={() => setSelectedSub(null)} 
                className="w-full text-[10px] font-black uppercase text-zinc-300 hover:text-rose-500 transition-colors py-2"
            >
                Keluar dari mode review
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
