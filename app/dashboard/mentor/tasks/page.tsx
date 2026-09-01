"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Paperclip, Send } from "lucide-react"
import Swal from 'sweetalert2'

export default function MentorTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const [score, setScore] = useState<number | string>("")
  const [feedback, setFeedback] = useState("")
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false)

  const API_URL = "https://backend.mejatika.com/api"

  const fetchMentorTasks = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    setLoadingTasks(true)
    try {
      const res = await fetch(`${API_URL}/mentor/tasks`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      const data = await res.json()
      
      // Debugging: Cek isi respons di inspect console browser
      console.log("Response /mentor/tasks:", data)

      // Penanganan berbagai format JSON dari Laravel (paginated / plain array)
      if (Array.isArray(data)) {
        setTasks(data)
      } else if (data && Array.isArray(data.data)) {
        setTasks(data.data)
      } else if (data && Array.isArray(data.tasks)) {
        setTasks(data.tasks)
      } else {
        setTasks([])
      }
    } catch (err) {
      console.error("Error fetching mentor tasks:", err)
    } finally {
      setLoadingTasks(false)
    }
  }, [router])

  useEffect(() => {
    fetchMentorTasks()
  }, [fetchMentorTasks])

  const handleOpenGradeModal = (task: any) => {
    setSelectedTask(task)
    setScore(task.score ?? "")
    setFeedback(task.feedback ?? "")
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    setIsSubmittingGrade(true)
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_URL}/tasks/${selectedTask.id}/grade`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          score: Number(score),
          feedback: feedback
        })
      })

      if (res.ok) {
        Swal.fire("Berhasil!", "Nilai dan feedback berhasil disimpan.", "success")
        setSelectedTask(null)
        fetchMentorTasks()
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Gagal menyimpan penilaian.")
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan nilai.", "error")
    } finally {
      setIsSubmittingGrade(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Daftar Tugas Siswa</h2>
        <p className="text-slate-500 font-medium">Periksa berkas tugas, berikan nilai, dan tulis feedback.</p>
      </div>

      {loadingTasks ? (
        <div className="p-12 text-center text-amber-500 font-bold flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={24} /> Memuat daftar tugas...
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
          <FileText className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Belum ada tugas siswa yang masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => {
            const isGraded = task.score !== null && task.score !== undefined
            return (
              <Card key={task.id} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                      {task.course?.title || task.mapel || "Kursus"}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                      {isGraded ? 'Sudah Dinilai' : 'Perlu Dinilai'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{task.title || task.name}</h3>
                  <p className="text-xs text-slate-500">
                    Siswa: <span className="font-bold text-slate-700">{task.user?.name || task.student?.name || task.student_name || "Siswa"}</span>
                  </p>
                  {task.description && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mt-2">{task.description}</p>}
                  
                  {(task.file_path || task.file_url) && (
                    <a href={task.file_path || task.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-amber-600 text-xs font-bold hover:underline mt-2">
                      <Paperclip size={14} /> Lihat Berkas Tugas
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[160px]">
                  {isGraded && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Nilai</span>
                      <span className="text-3xl font-black text-emerald-600">{task.score}</span>
                    </div>
                  )}
                  <Button 
                    onClick={() => handleOpenGradeModal(task)} 
                    className={`w-full rounded-2xl font-bold text-xs h-12 ${isGraded ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                  >
                    {isGraded ? "Edit Penilaian" : "Beri Nilai"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODAL PENILAIAN */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">Penilaian Tugas</h3>
              <p className="text-xs text-slate-500 mt-1">Judul: <span className="font-bold text-slate-700">{selectedTask.title || selectedTask.name}</span></p>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Nilai (0 - 100) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={score} 
                  onChange={(e) => setScore(e.target.value)} 
                  placeholder="Masukkan angka nilai (misal: 85)"
                  required
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Feedback / Catatan Mentor
                </label>
                <textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)} 
                  placeholder="Tuliskan umpan balik atau arahan perbaikan untuk siswa..."
                  className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingGrade}
                  className="flex-1 h-12 bg-amber-500 text-white rounded-2xl font-bold text-xs hover:bg-amber-600 flex items-center justify-center gap-2"
                >
                  {isSubmittingGrade ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Simpan Nilai</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
