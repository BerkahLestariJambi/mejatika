"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Loader2, FileText, Paperclip, Send, Eye, Trash2, 
  Award, ZoomIn, ZoomOut, RotateCcw, ExternalLink, ArrowLeft, ChevronDown, Printer 
} from "lucide-react"
import Swal from 'sweetalert2'

// KOMPONEN RENDER PDF KE CANVAS GAMBAR (UNTUK PREVIEW DI APLIKASI)
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
  const [isPrinting, setIsPrinting] = useState(false)
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

  // FUNGSI CETAK LAPORAN MENGGUNAKAN JENDELA CETAK KHUSUS (MENGATASI GAMBAR PECAH/CORS)
  const handlePrint = () => {
    setIsPrinting(true)

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) {
      setIsPrinting(false)
      Swal.fire("Gagal", "Gagal membuka jendela cetak. Izinkan pop-up browser Anda.", "error")
      return
    }

    const tableRows = filteredTasks.map((task, index) => {
      const studentName = task.user?.name || task.student?.name || task.student_name || "-"
      const fileUrl = task.file_path || task.file_url
      const fileType = getFileType(fileUrl)
      const currentFeedback = task.feedback ?? task.catatan ?? "-"
      const currentScore = task.nilai ?? task.score ?? "-"

      let mediaContent = '<span style="color:#94a3b8; font-style:italic;">Tidak ada berkas</span>'

      if (fileUrl) {
        if (fileType === 'image') {
          mediaContent = `<img src="${fileUrl}" alt="Jawaban Siswa" style="max-height:180px; max-width:180px; object-fit:contain; border:1px solid #cbd5e1; border-radius:4px; display:block; margin:auto;" />`
        } else {
          mediaContent = `<a href="${fileUrl}" target="_blank" style="color:#2563eb; text-decoration:underline; font-size:10px; word-break:break-all;">${fileUrl}</a>`
        }
      }

      return `
        <tr>
          <td style="border:1px solid #000; padding:8px; text-align:center; vertical-align:top;">${index + 1}</td>
          <td style="border:1px solid #000; padding:8px; vertical-align:top; font-weight:600;">${studentName}</td>
          <td style="border:1px solid #000; padding:8px; vertical-align:top;">
            ${task.description ? `<p style="margin-bottom:6px; font-style:italic; font-size:11px; color:#334155;">"${task.description}"</p>` : ''}
            ${mediaContent}
          </td>
          <td style="border:1px solid #000; padding:8px; vertical-align:top; white-space:pre-line;">${currentFeedback}</td>
          <td style="border:1px solid #000; padding:8px; text-align:center; vertical-align:top; font-weight:bold;">${currentScore}</td>
        </tr>
      `
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Penilaian Tugas Siswa - Kelas ${filterKelas}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 20px; }
            h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 4px; }
            p.subtitle { text-align: center; font-weight: bold; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { border: 1px solid #000; background-color: #f1f5f9; padding: 8px; text-align: left; }
            @media print {
              tr { page-break-inside: avoid; }
              img { max-width: 100% !important; }
            }
          </style>
        </head>
        <body>
          <h1>Laporan Penilaian Tugas Siswa</h1>
          <p class="subtitle">Kelas: ${filterKelas}</p>
          
          <table>
            <thead>
              <tr>
                <th style="text-align:center; width:40px;">No</th>
                <th style="width:180px;">Nama Lengkap</th>
                <th>Jawaban (Berkas / Catatan)</th>
                <th>Feedback</th>
                <th style="text-align:center; width:60px;">Nilai</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" style="text-align:center; padding:16px;">Tidak ada data tugas.</td></tr>'}
            </tbody>
          </table>

          <div style="margin-top:40px; float:right; text-align:center;">
            <p style="margin-bottom:60px;">Guru Mata Pelajaran</p>
            <p style="font-weight:bold; text-decoration:underline;">( ....................................... )</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
    setIsPrinting(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
                disabled={isPrinting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
              >
                {isPrinting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} 
                Cetak Laporan
              </Button>
            </div>
          </div>

          {loadingTasks ? (
            <div className="p-12 text-center text-amber-500 font-bold flex items-center justify-center gap-2 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin" size={24} /> Memuat daftar tugas...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Belum ada tugas siswa untuk kelas ini.</p>
            </div>
          ) : (
            /* TABEL TAMPILAN SISWA */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="p-4 text-center w-12">No</th>
                      <th className="p-4">Nama Siswa</th>
                      <th className="p-4">Judul / Mapel</th>
                      <th className="p-4 text-center">Kelas</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Nilai</th>
                      <th className="p-4 text-center w-40">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((task, index) => {
                      const studentName = task.user?.name || task.student?.name || task.student_name || "Siswa"
                      const currentScore = task.nilai ?? task.score
                      const isGraded = currentScore !== null && currentScore !== undefined && currentScore !== ""

                      return (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                          <td className="p-4 font-bold text-slate-800">{studentName}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-700 text-sm">{task.title || task.name}</p>
                            <span className="text-[10px] text-amber-600 font-semibold">{task.course?.title || task.mapel || "Kursus"}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">
                              {task.kelas || "X A"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full inline-block ${isGraded ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                              {isGraded ? 'Sudah Dinilai' : 'Perlu Dinilai'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {isGraded ? (
                              <span className="text-base font-black text-emerald-600">{currentScore}</span>
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button 
                                onClick={() => handleOpenPreviewAndGrade(task)} 
                                className={`h-8 px-3 rounded-xl font-bold text-[11px] flex items-center gap-1 ${isGraded ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                              >
                                <Eye size={14} /> {isGraded ? "Edit" : "Periksa"}
                              </Button>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                                title="Hapus Tugas"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
