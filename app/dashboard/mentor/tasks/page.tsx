"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, FileText, Paperclip, Send, Eye, Trash2, 
  Award, ZoomIn, ZoomOut, RotateCcw, ExternalLink, ArrowLeft, MessageSquare, ChevronDown, Printer 
} from "lucide-react"
import Swal from 'sweetalert2'

// KOMPONEN RENDER PDF KE CANVAS GAMBAR
function PdfToImageViewer({ pdfUrl, scale }: { pdfUrl: string; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(false)

    const loadAndRenderPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const loadingTask = pdfjsLib.getDocument(pdfUrl)
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)

        if (!isMounted) return

        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        if (isMounted) setLoading(false)
      } catch (err) {
        console.error("Gagal convert PDF ke Gambar:", err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    if (pdfUrl) {
      loadAndRenderPdf()
    }

    return () => {
      isMounted = false
    }
  }, [pdfUrl])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-amber-500 font-bold gap-2 h-full">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xs text-slate-500">Mengonversi PDF ke Gambar...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <Paperclip className="mx-auto text-amber-500" size={36} />
        <div>
          <p className="font-bold text-slate-800 text-sm">Pratinjau PDF Terhalang Keamanan Server</p>
          <p className="text-xs text-slate-500 mt-0.5">Buka berkas secara langsung di tab baru.</p>
        </div>
        <a 
          href={pdfUrl} 
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
        >
          <ExternalLink size={14} /> Buka PDF di Tab Baru
        </a>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
      <canvas 
        ref={canvasRef} 
        style={{ transform: `scale(${scale})`, transition: "transform 0.2s ease-in-out" }}
        className="max-w-full max-h-full object-contain rounded-xl shadow-md origin-center bg-white"
      />
    </div>
  )
}

export default function MentorTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  const [activeTask, setActiveTask] = useState<any | null>(null)
  
  // State Penilaian & Filter Laporan
  const [score, setScore] = useState<number | string>("")
  const [feedback, setFeedback] = useState("")
  const [kelas, setKelas] = useState("X A") 
  const [filterKelas, setFilterKelas] = useState("Semua")
  
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false)
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
        if (activeTask?.id === taskId) setActiveTask(null)
        fetchMentorTasks()
      } else {
        throw new Error(data.message || "Gagal menghapus tugas.")
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menghapus.", "error")
    }
  }

  const handleOpenPreviewAndGrade = (task: any) => {
    setActiveTask(task)
    setKelas(task.kelas || "X A")
    setScore(task.nilai ?? task.score ?? "")
    setFeedback(task.feedback ?? task.catatan ?? "")
    setZoomScale(1)
  }

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5))
  const handleZoomReset = () => setZoomScale(1)

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
          feedback: feedback,
          kelas: kelas
        })
      })

      if (res.ok) {
        Swal.fire("Berhasil!", "Nilai, kelas, dan feedback berhasil disimpan.", "success")
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

  const filteredTasks = tasks.filter(task => {
    if (filterKelas === "Semua") return true
    return (task.kelas || "X A") === filterKelas
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* CSS CETAK */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6 animate-in fade-in duration-500">
        {/* MODAL / HALAMAN PENILAIAN */}
        {activeTask ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 lg:px-6 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setActiveTask(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 font-bold text-xs bg-slate-100 hover:bg-amber-50 px-4 py-2 rounded-xl transition"
              >
                <ArrowLeft size={16} /> Kembali ke Daftar Tugas
              </button>
              <div className="text-right">
                <h3 className="font-bold text-slate-800 text-sm lg:text-base">{activeTask.title || activeTask.name}</h3>
                <p className="text-xs text-slate-500">Siswa: <span className="font-bold text-slate-700">{activeTask.user?.name || activeTask.student?.name || activeTask.student_name || "Siswa"}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] h-[calc(100vh-220px)]">
              <div className="lg:col-span-7 bg-slate-100 p-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 relative overflow-hidden h-full">
                {(activeTask.file_path || activeTask.file_url) && (
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1">
                    <button type="button" onClick={handleZoomOut} className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" title="Perkecil">
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 px-1 min-w-[36px] text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button type="button" onClick={handleZoomIn} className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" title="Perbesar">
                      <ZoomIn size={16} />
                    </button>
                    <button type="button" onClick={handleZoomReset} className="p-1 hover:bg-slate-100 rounded-lg text-slate-700" title="Reset Ukuran">
                      <RotateCcw size={14} />
                    </button>
                    <a 
                      href={activeTask.file_path || activeTask.file_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-1 hover:bg-slate-100 rounded-lg text-amber-600 border-l border-slate-200 ml-1 pl-1.5"
                      title="Buka File Asli"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                )}

                {!(activeTask.file_path || activeTask.file_url) ? (
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-2">
                    <FileText className="mx-auto text-slate-300" size={40} />
                    <p className="font-bold text-slate-700 text-sm">Siswa Tidak Mengunggah File</p>
                  </div>
                ) : getFileType(activeTask.file_path || activeTask.file_url) === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                    <img 
                      src={activeTask.file_path || activeTask.file_url} 
                      alt="Preview Berkas" 
                      style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.2s ease-in-out' }}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-md origin-center"
                    />
                  </div>
                ) : getFileType(activeTask.file_path || activeTask.file_url) === 'pdf' ? (
                  <PdfToImageViewer 
                    pdfUrl={activeTask.file_path || activeTask.file_url} 
                    scale={zoomScale} 
                  />
                ) : (
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-3">
                    <Paperclip className="mx-auto text-amber-500" size={40} />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Format Berkas Lain</p>
                      <p className="text-xs text-slate-500 mt-0.5">Unduh berkas untuk melihat isinya.</p>
                    </div>
                    <a 
                      href={activeTask.file_path || activeTask.file_url} 
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
                    >
                      <FileText size={14} /> Unduh Berkas
                    </a>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between overflow-y-auto h-full">
                <form onSubmit={handleGradeSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold border-b border-slate-100 pb-3">
                      <Award size={20} />
                      <h4 className="text-base">Penilaian & Catatan Mentor</h4>
                    </div>

                    {activeTask.description && (
                      <div className="mb-4 bg-slate-50 border border-slate-100 p-3 rounded-xl max-h-32 overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Catatan Siswa:</span>
                        <p className="text-xs text-slate-700 italic">"{activeTask.description}"</p>
                      </div>
                    )}

                    {/* SELECT KELAS */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Kelas <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={kelas}
                          onChange={(e) => setKelas(e.target.value)}
                          required
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-800 appearance-none cursor-pointer"
                        >
                          <option value="X A">X A</option>
                          <option value="X B">X B</option>
                          <option value="XI">XI</option>
                          <option value="XII">XII</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    {/* INPUT NILAI */}
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
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-black text-slate-800"
                      />
                    </div>

                    {/* TEXTAREA FEEDBACK */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                        Feedback / Catatan Mentor
                      </label>
                      <textarea 
                        value={feedback} 
                        onChange={(e) => setFeedback(e.target.value)} 
                        placeholder="Tuliskan umpan balik atau arahan perbaikan untuk siswa..."
                        className="w-full h-28 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTask(null)}
                      className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingGrade}
                      className="flex-1 h-11 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center justify-center gap-1.5 shadow-md shadow-amber-100"
                    >
                      {isSubmittingGrade ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Simpan Nilai</>}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* DAFTAR TUGAS */
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Daftar Tugas Siswa</h2>
                <p className="text-slate-500 font-medium">Periksa berkas tugas, berikan nilai, dan kelola tugas masuk.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="p-2.5 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                  >
                    <option value="Semua">Semua Kelas</option>
                    <option value="X A">Kelas X A</option>
                    <option value="X B">Kelas X B</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                <Button 
                  onClick={handlePrint}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <Printer size={16} /> Cetak Laporan
                </Button>
              </div>
            </div>

            {loadingTasks ? (
              <div className="p-12 text-center text-amber-500 font-bold flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={24} /> Memuat daftar tugas...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">Belum ada tugas siswa untuk kelas ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTasks.map((task) => {
                  const currentScore = task.nilai ?? task.score
                  const currentFeedback = task.feedback ?? task.catatan
                  const isGraded = currentScore !== null && currentScore !== undefined && currentScore !== ""

                  return (
                    <Card key={task.id} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                            {task.course?.title || task.mapel || "Kursus"}
                          </span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                            Kelas: {task.kelas || "X A"}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                            {isGraded ? 'Sudah Dinilai' : 'Perlu Dinilai'}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{task.title || task.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Siswa: <span className="font-bold text-slate-700">{task.user?.name || task.student?.name || task.student_name || "Siswa"}</span>
                          </p>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl line-clamp-2">
                            <span className="font-bold text-slate-500">Catatan Siswa: </span>"{task.description}"
                          </p>
                        )}

                        {isGraded && currentFeedback && (
                          <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                            <MessageSquare className="text-amber-600 shrink-0 mt-0.5" size={16} />
                            <div className="text-xs space-y-1 w-full overflow-hidden">
                              <span className="font-bold text-amber-900 block">Feedback dari Guru Mata Pelajaran:</span>
                              <p className="text-amber-800 whitespace-pre-line break-words leading-relaxed">
                                {currentFeedback}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        {isGraded && (
                          <div className="text-right bg-emerald-50/60 px-4 py-2 rounded-2xl border border-emerald-100 w-full lg:w-auto text-center lg:text-right">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Nilai Akhir</span>
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
                            title="Hapus Tugas"
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
          </>
        )}
      </div>

      {/* STRUKTUR TABEL PRINT OUT LENGKAP */}
      <div id="print-area" className="hidden print:block p-8 bg-white font-sans text-black">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">Laporan Penilaian Tugas Siswa</h1>
          <p className="text-sm font-semibold mt-1">Kelas: {filterKelas}</p>
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="border border-black p-2 text-center w-12">No</th>
              <th className="border border-black p-2 text-left w-48">Nama Lengkap</th>
              <th className="border border-black p-2 text-left">Jawaban (Berkas / Catatan)</th>
              <th className="border border-black p-2 text-left">Feedback</th>
              <th className="border border-black p-2 text-center w-20">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black p-4 text-center">
                  Tidak ada data tugas untuk kelas ini.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task, index) => {
                const studentName = task.user?.name || task.student?.name || task.student_name || "-"
                const fileUrl = task.file_path || task.file_url
                const fileType = getFileType(fileUrl)
                const currentFeedback = task.feedback ?? task.catatan ?? "-"
                const currentScore = task.nilai ?? task.score ?? "-"

                return (
                  <tr key={task.id || index}>
                    <td className="border border-black p-2 text-center align-top">{index + 1}</td>
                    <td className="border border-black p-2 font-medium align-top">{studentName}</td>
                    
                    {/* HASH/MAPPING BERKAS GAMBAR BARU */}
                    <td className="border border-black p-2 align-top">
                      {task.description && (
                        <p className="mb-2 italic text-[11px] text-gray-700">"{task.description}"</p>
                      )}

                      {fileUrl ? (
                        fileType === 'image' ? (
                          <div className="flex justify-center my-1">
                            <img 
                              src={fileUrl} 
                              alt="Jawaban Siswa" 
                              className="max-h-36 max-w-[180px] object-contain rounded border border-gray-300"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-blue-600 underline break-all block">
                            {fileUrl}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada berkas</span>
                      )}
                    </td>

                    <td className="border border-black p-2 whitespace-pre-line align-top">{currentFeedback}</td>
                    <td className="border border-black p-2 text-center font-bold align-top">{currentScore}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div className="mt-8 flex justify-end">
          <div className="text-center text-xs">
            <p className="mb-12">Guru Mata Pelajaran</p>
            <p className="font-bold underline">(.......................................)</p>
          </div>
        </div>
      </div>
    </>
  )
}
