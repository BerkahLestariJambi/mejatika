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
  ExternalLink,
  Star
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Swal from 'sweetalert2'

// FIX: Memaksa Next.js agar tidak merender ini secara statis saat build
export const dynamic = "force-dynamic"

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [feedbackData, setFeedbackData] = useState({ mentor_feedback: "", score: 0 })

  // 1. Ambil Data dari API
  const fetchData = async () => {
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
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      })
      
      const result = await res.json()
      
      if (res.ok) {
        const finalData = result.data || result
        setSubmissions(Array.isArray(finalData) ? finalData : [])
      }
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Lifecycle
  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  // Auto Scroll Chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedSub?.discussions])

  // 2. Filter Pencarian
  const filteredSubmissions = submissions.filter(sub => {
    if (!sub) return false
    const q = search.toLowerCase()
    const studentName = sub.user?.name?.toLowerCase() || ""
    const materialTitle = sub.material?.title?.toLowerCase() || ""
    return studentName.includes(q) || materialTitle.includes(q)
  })

  // 3. Update Skor
  const submitScoreAndFeedback = async () => {
    if (feedbackData.score < 0 || feedbackData.score > 100) {
      return Swal.fire('Error', 'Skor 0-100!', 'warning')
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
        Swal.fire({ title: 'Berhasil!', icon: 'success', timer: 1000, showConfirmButton: false })
        fetchData()
        setSelectedSub(null)
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal update skor', 'error')
    }
  }

  // 4. Kirim Chat
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
        const chatBaru = result.data || result
        setSelectedSub({
          ...selectedSub,
          discussions: [...(selectedSub.discussions || []), chatBaru]
        })
        setNewMessage("")
      }
    } catch (err) { console.error(err) }
  }

  // FIX: Jangan render apapun sebelum mounted (Client-Side) agar Build Vercel sukses
  if (!mounted) return null

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500 font-medium">Panel Penilaian Mentor</p>
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
          <Button onClick={fetchData} variant="outline" className="h-12 w-12 rounded-2xl bg-white border-zinc-200 shadow-sm">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-2" />
          <p className="text-zinc-400 font-bold text-xs uppercase italic tracking-widest">Syncing Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <motion.div key={sub.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all border border-zinc-100">
                    <CardHeader className="bg-zinc-900 text-white p-6">
                      <div className="flex justify-between items-center mb-3">
                        <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase">
                          {sub.material?.course?.title || "MODULE"}
                        </Badge>
                        {sub.discussions?.length > 0 && (
                           <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black">
                              <MessageCircle size={8} /> {sub.discussions.length} CHAT
                           </div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-black italic uppercase leading-tight line-clamp-2 min-h-[3rem]">
                        {sub.material?.title || "Untitled"}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase italic">
                          <User size={12} className="text-amber-500" /> {sub.user?.name}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 min-h-[80px]">
                        <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Jawaban:</span>
                        <p className="text-xs text-zinc-600 line-clamp-3 font-medium italic">
                          {sub.student_answer ? `"${sub.student_answer}"` : "Kosong."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black text-zinc-400 uppercase">Skor</span>
                           <span className={`text-sm font-black ${sub.score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {sub.score > 0 ? `${sub.score}/100` : "PENDING"}
                           </span>
                         </div>
                         <Button onClick={() => {
                            setSelectedSub(sub);
                            setFeedbackData({ mentor_feedback: sub.mentor_feedback || "", score: sub.score || 0 });
                         }} className="rounded-xl bg-zinc-900 hover:bg-amber-500 font-black text-[10px] uppercase text-white h-9 px-4 shadow-lg shadow-zinc-200">
                            Review
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
                <Inbox className="mx-auto h-10 w-10 text-zinc-200 mb-2" />
                <p className="text-zinc-400 font-black uppercase italic tracking-tighter">Belum ada data masuk</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Review */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Live Review</span>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase text-white">{selectedSub?.user?.name}</DialogTitle>
            </div>
          </div>
          
          <div ref={scrollRef} className="p-8 space-y-6 h-[350px] overflow-y-auto bg-zinc-50/50 flex flex-col">
            <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-zinc-200 shadow-sm max-w-[90%]">
              <span className="text-[9px] font-black text-amber-600 uppercase block mb-1">Submission Siswa</span>
              <p className="text-sm text-zinc-700 font-medium italic mb-2">"{selectedSub?.student_answer}"</p>
              {selectedSub?.project_link && (
                <a href={selectedSub.project_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-black underline">
                  <ExternalLink size={10} /> LINK PROJECT
                </a>
              )}
            </div>

            {selectedSub?.discussions?.map((chat: any) => (
              <div key={chat.id} className={`flex flex-col ${chat.user?.role === 'admin' ? 'items-end' : 'items-start'} space-y-1`}>
                <div className={`p-4 rounded-2xl max-w-[80%] ${chat.user?.role === 'admin' ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none shadow-sm'}`}>
                  <p className="text-sm font-medium">{chat.message}</p>
                </div>
                <span className="text-[8px] font-bold text-zinc-400 uppercase px-1">{chat.formatted_date || 'Just now'}</span>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-zinc-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="font-black text-zinc-900 uppercase italic text-[9px]">Input Nilai</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={feedbackData.score} onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value) || 0})} className="h-10 rounded-xl font-black text-lg w-24 text-center border-2 border-zinc-100" />
                    <Button onClick={submitScoreAndFeedback} className="bg-emerald-500 hover:bg-emerald-600 h-10 flex-1 rounded-xl text-white font-black uppercase text-[10px]">Simpan Skor</Button>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="font-black text-zinc-900 uppercase italic text-[9px]">Kirim Pesan</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Tulis masukan..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendNewMessage()} className="h-10 rounded-xl bg-zinc-50 text-sm border-none" />
                    <Button onClick={sendNewMessage} className="bg-amber-500 hover:bg-zinc-900 h-10 w-12 rounded-xl text-white transition-all"><Send size={16} /></Button>
                  </div>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
