"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Paperclip, Send, Eye, X, Download, Trash2, Award, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from "lucide-react"
import Swal from 'sweetalert2'

export default function MentorTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  // Combined State untuk Preview File sekaligus Penilaian
  const [activeTask, setActiveTask] = useState<any | null>(null)
  const [score, setScore] = useState<number | string>("")
  const [feedback, setFeedback] = useState("")
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false)

  // State Kontrol Zoom Preview
  const [zoomScale, setZoomScale] = useState<number>(1)

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

  // FUNGSI UNTUK MENGHAPUS TUGAS DUPLIKAT
  const handleDeleteTask = async (taskId: number) => {
    const confirm = await Swal.fire({
      title: "Hapus Tugas?",
      text: "Apakah Anda yakin ingin menghapus tugas ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    })

    if (!confirm.isConfirmed) return

    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire("Terhapus!", "Tugas berhasil dihapus.", "success")
        fetchMentorTasks()
      } else {
        throw new Error(data.message || "Gagal menghapus tugas.")
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menghapus.", "error")
    }
  }

  // FUNGSI MEMBUKA PREVIEW + FORM NILAI
  const handleOpenPreviewAndGrade = (task: any) => {
    setActiveTask(task)
    setScore(task.nilai ?? task.score ?? "")
    setFeedback(task.feedback ?? "")
    setZoomScale(1) // Reset zoom saat membuka file baru
  }

  // CONTROLLER ZOOM
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5))
  const handleZoomReset = () => setZoomScale(1)

  // SUBMIT PENILAIAN LANGSUNG DARI HALAMAN PREVIEW
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask) return

    setIsSubmittingGrade(true)
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_URL}/mentor/tasks/${activeTask.id}/grade`, {
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
        setActiveTask(null)
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

  const getFileType = (url: string) => {
    if (!url) return 'none'
    const ext = url.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
    if (ext === 'pdf') return 'pdf'
    return 'other'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Daftar Tugas Siswa</h2>
        <p className="text-slate-500 font-medium">Periksa berkas tugas, berikan nilai, dan kelola tugas masuk.</p>
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
            const currentScore = task.nilai ?? task.score
            const isGraded = currentScore !== null && currentScore !== undefined && currentScore !== ""

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
                  {task.description && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mt-2 line-clamp-2">{task.description}</p>}
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[180px]">
                  {isGraded && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Nilai</span>
                      <span className="text-3xl font-black text-emerald-600">{currentScore}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 w-full">
                    <Button 
                      onClick={() => handleOpenPreviewAndGrade(task)} 
                      className={`flex-1 rounded-2xl font-bold text-xs h-12 flex items-center justify-center gap-2 ${isGraded ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      <Eye size={16} /> {isGraded ? "Edit Nilai / Berkas" : "Periksa & Dinilai"}
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition flex items-center justify-center"
                      title="Hapus Tugas Duplikat"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODAL PREVIEW FILE RINGKAS DENGAN FITUR ZOOM & FORM PENILAIAN */}
      {activeTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl my-auto flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* HEADER MODAL */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-base lg:text-lg">Periksa & Nilai Tugas</h3>
                <p className="text-xs text-slate-500">
                  Judul: <span className="font-bold text-slate-700">{activeTask.title || activeTask.name}</span> | Siswa: <span className="font-bold text-slate-700">{activeTask.user?.name || activeTask.student?.name || activeTask.student_name || "Siswa"}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(activeTask.file_path || activeTask.file_url) && (
                  <a 
                    href={activeTask.file_path || activeTask.file_url} 
                    download 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition"
                    title="Unduh Berkas"
                  >
                    <Download size={16} />
                  </a>
                )}
                <button 
                  onClick={() => setActiveTask(null)}
                  className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* BODY MODAL: GRID 2 KOLOM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* KOLOM KIRI: PREVIEW BERKAS DENGAN KONTROL ZOOM */}
              <div className="lg:col-span-7 bg-slate-100 p-4 flex flex-col items-center justify-center h-[320px] lg:h-[420px] border-b lg:border-b-0 lg:border-r border-slate-200 relative overflow-hidden group">
                
                {/* TOOLBAR KONTROL ZOOM (HANYA MUNCUL DILAYAR YANG PUNYA FILE) */}
                {(activeTask.file_path || activeTask.file_url) && (
                  <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1 opacity-90 hover:opacity-100 transition">
                    <button 
                      type="button" 
                      onClick={handleZoomOut} 
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" 
                      title="Perkecil"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 px-1 min-w-[36px] text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button 
                      type="button" 
                      onClick={handleZoomIn} 
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" 
                      title="Perbesar"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleZoomReset} 
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" 
                      title="Reset Ukuran"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <a 
                      href={activeTask.file_path || activeTask.file_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-1 hover:bg-slate-100 rounded-lg text-amber-600 border-l border-slate-200 ml-1 pl-1.5"
                      title="Buka File di Tab Baru (Layar Penuh)"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                )}

                {/* KONTEN PREVIEW */}
                {!(activeTask.file_path || activeTask.file_url) ? (
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
                    <FileText className="mx-auto text-slate-300" size={40} />
                    <p className="font-bold text-slate-700 text-sm">Siswa Tidak Mengunggah File</p>
                    <p className="text-xs text-slate-400">Penilaian dilakukan berdasarkan deskripsi atau catatan.</p>
                  </div>
                ) : getFileType(activeTask.file_path || activeTask.file_url) === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                    <img 
                      src={activeTask.file_path || activeTask.file_url} 
                      alt="Preview Berkas" 
                      style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.2s ease-in-out' }}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-sm origin-center"
                    />
                  </div>
                ) : getFileType(activeTask.file_path || activeTask.file_url) === 'pdf' ? (
                  <div className="w-full h-full overflow-hidden rounded-xl shadow-sm bg-white">
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeTask.file_path || activeTask.file_url)}&embedded=true`}
                      style={{ 
                        transform: `scale(${zoomScale})`, 
                        transformOrigin: 'top center',
                        width: zoomScale !== 1 ? `${100 / zoomScale}%` : '100%',
                        height: zoomScale !== 1 ? `${100 / zoomScale}%` : '100%',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      className="border-none bg-white"
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-3">
                    <Paperclip className="mx-auto text-amber-500" size={40} />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Preview Langsung Tidak Tersedia</p>
                      <p className="text-xs text-slate-500 mt-0.5">Silakan unduh berkas di bawah ini untuk melihat isinya.</p>
                    </div>
                    <a 
                      href={activeTask.file_path || activeTask.file_url} 
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
                    >
                      <Download size={14} /> Unduh Berkas Tugas
                    </a>
                  </div>
                )}
              </div>

              {/* KOLOM KANAN: FORM PENILAIAN */}
              <div className="lg:col-span-5 p-5 lg:p-6 bg-white flex flex-col justify-between space-y-4 h-[420px] overflow-y-auto">
                <form onSubmit={handleGradeSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-amber-600 font-bold">
                      <Award size={18} />
                      <h4 className="text-base">Input Nilai & Feedback</h4>
                    </div>

                    {activeTask.description && (
                      <div className="mb-3 bg-slate-50 border border-slate-100 p-3 rounded-xl max-h-24 overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Catatan Siswa:</span>
                        <p className="text-xs text-slate-700 italic">"{activeTask.description}"</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                          Nilai (0 - 100) <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={score} 
                          onChange={(e) => setScore(e.target.value)} 
                          placeholder="Nilai angka (misal: 85)"
                          required
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base font-black text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                          Feedback / Catatan Mentor
                        </label>
                        <textarea 
                          value={feedback} 
                          onChange={(e) => setFeedback(e.target.value)} 
                          placeholder="Tuliskan umpan balik atau arahan perbaikan untuk siswa..."
                          className="w-full h-24 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTask(null)}
                      className="flex-1 h-10 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingGrade}
                      className="flex-1 h-10 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center justify-center gap-1.5 shadow-md shadow-amber-100"
                    >
                      {isSubmittingGrade ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Simpan Nilai</>}
                    </Button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}
