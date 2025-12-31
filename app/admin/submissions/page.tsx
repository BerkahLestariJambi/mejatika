"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
  BookOpen
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Swal from 'sweetalert2'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [search, setSearch] = useState("")

  // State untuk form penilaian
  const [feedbackData, setFeedbackData] = useState({
    mentor_feedback: "",
    material_score: 0
  })

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      // Mengambil data materials yang memiliki student_answer
      const res = await fetch("https://backend.mejatika.com/api/materials", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      // Filter hanya yang sudah ada jawaban dari siswa
      const onlySubmissions = data.filter((m: any) => m.student_answer !== null)
      setSubmissions(onlySubmissions)
    } catch (err) {
      console.error(err)
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

  const submitFeedback = async () => {
    setIsUpdating(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/materials/${selectedSub.id}`, {
        method: "POST", // Menggunakan POST + _method PUT untuk Laravel
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...feedbackData,
          _method: "PUT"
        })
      })

      if (res.ok) {
        Swal.fire('Berhasil!', 'Nilai dan feedback telah dikirim.', 'success')
        setSelectedSub(null)
        fetchData()
      }
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan server', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-zinc-900 tracking-tighter">
            Submission <span className="text-amber-500">Review</span>
          </h1>
          <p className="text-zinc-500">Berikan feedback dan nilai untuk tugas siswa.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Cari materi..." 
            className="pl-10 rounded-2xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline text-amber-500" /></div>
        ) : submissions.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-400">Belum ada tugas yang dikumpulkan.</div>
        ) : (
          submissions.map((sub) => (
            <Card key={sub.id} className="border-none shadow-xl rounded-3xl overflow-hidden bg-white hover:scale-[1.02] transition-transform">
              <CardHeader className="bg-zinc-900 text-white p-6">
                <div className="flex justify-between items-start">
                  <Badge className="bg-amber-500 text-white border-none text-[10px] uppercase font-black">
                    {sub.course?.title}
                  </Badge>
                  {sub.material_score > 0 && (
                    <div className="flex items-center text-amber-400 gap-1 text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {sub.material_score}
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg font-bold italic uppercase leading-tight">
                  {sub.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Jawaban Siswa:</span>
                  <p className="text-sm text-zinc-600 line-clamp-3 bg-zinc-50 p-3 rounded-xl border border-dashed border-zinc-200">
                    {sub.student_answer}
                  </p>
                </div>
                <Button 
                  onClick={() => handleOpenReview(sub)}
                  className="w-full bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900 rounded-2xl font-bold uppercase italic text-xs h-12"
                >
                  <MessageSquare size={16} className="mr-2" /> Beri Feedback
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* MODAL REVIEW */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              Review <span className="text-amber-500">Submission</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSub && (
            <div className="space-y-6 mt-4">
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Isi Jawaban Siswa</Label>
                <div className="text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedSub.student_answer}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-zinc-800">Skor (0 - 100)</Label>
                  <Input 
                    type="number" 
                    max="100"
                    value={feedbackData.material_score}
                    onChange={(e) => setFeedbackData({...feedbackData, material_score: parseInt(e.target.value)})}
                    className="h-12 rounded-xl border-zinc-200 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-zinc-800">Feedback Mentor</Label>
                  <textarea 
                    className="w-full h-32 p-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    placeholder="Berikan saran atau apresiasi..."
                    value={feedbackData.mentor_feedback}
                    onChange={(e) => setFeedbackData({...feedbackData, mentor_feedback: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={submitFeedback}
                disabled={isUpdating}
                className="w-full h-14 bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-amber-100"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : (
                  <>Kirim Penilaian <Send size={18} className="ml-2" /></>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
