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
  Star, 
  Search,
  RefreshCcw,
  User,
  MessageCircle,
  Clock
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
      
      // DISESUAIKAN: Menangani berbagai format response Laravel
      const finalData = result.data || result;
      setSubmissions(Array.isArray(finalData) ? finalData : [])
      
    } catch (err) {
      console.error("Fetch Error:", err)
      Swal.fire('Error', 'Gagal mengambil data dari server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedSub?.discussions])

  const handleOpenReview = (sub: any) => {
    setSelectedSub(sub)
    setFeedbackData({
      mentor_feedback: sub.mentor_feedback || "",
      score: sub.score || 0
    })
  }

  const submitScoreAndFeedback = async () => {
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Error', 'Skor harus di antara 0-100', 'warning')
    }

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
        Swal.fire({ title: 'Berhasil!', text: 'Skor disimpan.', icon: 'success', timer: 1500, showConfirmButton: false })
        fetchData()
        setSelectedSub(null)
      }
    } catch (err) {
      Swal.fire('Gagal', 'Koneksi terputus.', 'error')
    }
  }

  const sendNewMessage = async () => {
    if (!newMessage.trim()) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/${selectedSub.id}/discussion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      })
      const result = await res.json()
      if (res.ok) {
        // DISESUAIKAN: Pastikan format result sesuai dengan DiscussionController
        const newChat = result.data || result;
        setSelectedSub({
          ...selectedSub,
          discussions: [...(selectedSub.discussions || []), newChat]
        })
        setNewMessage("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredSubmissions = submissions.filter(sub => 
    sub.material?.title?.toLowerCase().includes(search.toLowerCase()) || 
    sub.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Manajemen penilaian & diskusi realtime.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Cari materi atau nama..." 
              className="pl-10 rounded-2xl bg-white border-zinc-200 h-12 shadow-sm focus:ring-amber-500 text-zinc-900" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white hover:bg-zinc-100">
            <RefreshCcw size={18} className={loading ? "animate-spin" : "text-zinc-900"} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-xs">Syncing Database...</p>
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
                      {(sub.discussions?.length || 0) > 0 && (
                         <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black">
                            <MessageCircle size={8} /> {sub.discussions.length} PESAN
                         </div>
                      )}
                    </div>
                    <CardTitle className="text-lg font-black italic uppercase leading-none tracking-tighter min-h-[2.5rem] line-clamp-2">
                      {sub.material?.title || "Untitled Assignment"}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase italic">
                        <User size={12} className="text-amber-500" /> {sub.user?.name || "Unknown Student"}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4 text-zinc-900">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Jawaban Siswa:</span>
                      <p className="text-xs text-zinc-600 line-clamp-2 font-medium italic">
                        {sub.student_answer ? `"${sub.student_answer}"` : "Tidak ada jawaban teks."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Status Penilaian</span>
                         <span className={`text-sm font-black ${sub.score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {sub.score > 0 ? `${sub.score}/100` : "PENDING"}
                         </span>
                       </div>
                       <Button 
                        onClick={() => handleOpenReview(sub)}
                        className="rounded-xl bg-zinc-900 hover:bg-amber-500 font-black text-[10px] uppercase italic h-9 px-4 transition-colors text-white"
                       >
                         Buka Diskusi
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL MULTIPLE DISCUSSION */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Mentoring</span>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                {selectedSub?.user?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="text-right">
                <p className="text-[8px] font-black text-zinc-500 uppercase">Materi</p>
                <p className="text-xs font-bold italic text-zinc-300">{selectedSub?.material?.title}</p>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="p-8 space-y-6 h-[400px] overflow-y-auto bg-zinc-50/50 custom-scrollbar flex flex-col"
          >
            <div className="flex flex-col items-start mb-4">
              <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-zinc-200 shadow-sm max-w-[85%]">
                <span className="text-[9px] font-black text-amber-600 uppercase block mb-2 tracking-widest">Submission Awal</span>
                <p className="text-sm text-zinc-700 font-medium leading-relaxed italic">"{selectedSub?.student_answer}"</p>
                {selectedSub?.project_link && (
                  <a href={selectedSub.project_link} target="_blank" className="text-[10px] text-blue-500 font-bold underline mt-2 block">
                    Lihat Link Project →
                  </a>
                )}
              </div>
            </div>

            {selectedSub?.discussions?.map((chat: any) => {
              const isAdmin = chat.user?.role === 'admin';
              return (
                <div key={chat.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${
                    isAdmin 
                    ? 'bg-zinc-900 text-white rounded-tr-none' 
                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{chat.message}</p>
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <Clock size={10} className="text-zinc-400" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">{chat.formatted_date || 'Baru saja'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-8 bg-white border-t border-zinc-100 space-y-4">
            <div className="flex gap-4">
               <div className="w-1/3 space-y-2 border-r border-zinc-100 pr-4">
                  <Label className="font-black text-zinc-900 uppercase italic text-[9px]">Set Skor (0-100)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={feedbackData.score}
                      onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})}
                      className="h-10 rounded-xl font-black text-center text-lg text-zinc-900"
                    />
                    <Button onClick={submitScoreAndFeedback} size="sm" className="bg-emerald-500 h-10 rounded-xl hover:bg-emerald-600">
                      <Star size={14} fill="white" />
                    </Button>
                  </div>
               </div>

               <div className="w-2/3 space-y-2">
                  <Label className="font-black text-zinc-900 uppercase italic text-[9px]">Balas Diskusi</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Tulis pesan ke siswa..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendNewMessage()}
                      className="h-10 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900"
                    />
                    <Button onClick={sendNewMessage} className="bg-amber-500 h-10 w-12 rounded-xl hover:bg-zinc-900 transition-all text-white">
                      <Send size={16} />
                    </Button>
                  </div>
               </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSub(null)}
              className="w-full text-[10px] font-black uppercase text-zinc-400 hover:text-rose-500"
            >
              Tutup Panel Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
