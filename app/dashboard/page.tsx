"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, ChevronDown, Clock, 
  FileText, Loader2, Flame, MessageSquare, 
  MonitorPlay, Zap, Lock, UploadCloud,
  Send, UserCircle2, Menu, X, ClipboardList, Paperclip
} from "lucide-react"
import Swal from 'sweetalert2'

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [myCertificates, setMyCertificates] = useState<any[]>([]) 
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<string>("live") 
  
  // State khusus disesuaikan dengan skema tabel 'tasks' (title, description, file_path)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskFile, setTaskFile] = useState<File | null>(null)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  
  const [courseProgress, setCourseProgress] = useState<Record<number, any>>({})
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null)
  const [replyText, setReplyText] = useState("")

  const API_URL = "https://backend.mejatika.com/api"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedProof(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setTaskFile(file)
  }

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const [resReg, resUser, resAll, resCert] = await Promise.all([
        fetch(`${API_URL}/registrations`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/me`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/my-certificates`, { headers: { "Authorization": `Bearer ${token}` } })
      ])
      
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()
      const dataCert = await resCert.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
      setMyCertificates(Array.isArray(dataCert) ? dataCert : dataCert.data || [])
    } catch (err) { 
      console.error("Fetch Error:", err) 
    } finally { 
      setLoading(false) 
    }
  }, [router])

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("mejatika_progress")
    if (saved) setCourseProgress(JSON.parse(saved))
  }, [fetchData])

  // Submit Tugas sesuai struktur tabel 'tasks'
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      return Swal.fire("Peringatan", "Judul tugas wajib diisi.", "warning")
    }

    if (!taskFile && !taskDescription.trim()) {
      return Swal.fire("Peringatan", "Mohon sertakan file tugas atau isi deskripsi tugas.", "warning")
    }

    setIsSubmittingTask(true)
    const token = localStorage.getItem("token")

    try {
      const formData = new FormData()
      formData.append("title", taskTitle)
      if (taskDescription) formData.append("description", taskDescription)
      if (taskFile) formData.append("file_path", taskFile) // disesuaikan kolom file_path

      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData
      })

      if (res.ok) {
        Swal.fire("Berhasil!", "Tugas berhasil dikirim ke database.", "success")
        setTaskTitle("")
        setTaskDescription("")
        setTaskFile(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Gagal menyimpan tugas.")
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat mengunggah tugas.", "error")
    } finally {
      setIsSubmittingTask(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-400 animate-pulse font-bold">MEJATIKA LOADING...</div>

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      
      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">M</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Mejatika<span className="text-indigo-600">.</span></h1>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <button onClick={() => { setActiveMenu("dashboard"); setSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === "dashboard" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button onClick={() => { setActiveMenu("courses"); setSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === "courses" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookOpen size={20} /> Katalog Kursus
          </button>

          <button onClick={() => { setActiveMenu("materials"); setSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === "materials" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileCheck size={20} /> Ruang Belajar
          </button>

          <button onClick={() => { setActiveMenu("assignments"); setSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === "assignments" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Flame size={20} /> Tugas
          </button>

          <button onClick={() => { setActiveMenu("certificates"); setSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === "certificates" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Award size={20} /> Sertifikat
          </button>
        </nav>
        <div className="p-6 border-t border-slate-100">
            <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className={`flex-1 lg:ml-64 p-6 lg:p-10 flex flex-col mt-16 lg:mt-0`}>
        {/* MOBILE HEADER */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-[60] flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">M</div>
            <span>Mejatika</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600"><Menu /></button>
        </div>

        {/* --- MENU DASHBOARD --- */}
        {activeMenu === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
              <div className="absolute top-0 right-0 p-10 opacity-10 hidden lg:block"><Zap size={200} /></div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">Hello, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-indigo-100 font-medium">Lanjutkan progress belajarmu hari ini.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 rounded-3xl bg-white border-none shadow-sm"><p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Katalog</p><h3 className="text-4xl font-bold">{availableCourses.length}</h3></Card>
              <Card className="p-8 rounded-3xl bg-white border-none shadow-sm"><p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Pendaftaran</p><h3 className="text-4xl font-bold text-indigo-600">{registrations.length}</h3></Card>
              <Card className="p-8 rounded-3xl bg-white border-none shadow-sm border-b-4 border-emerald-500"><p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Aktif</p><h3 className="text-4xl font-bold text-emerald-600">{registrations.filter(r => r.status === 'success' || r.status === 'aktif').length}</h3></Card>
            </div>
          </div>
        )}

        {/* --- MENU KATALOG --- */}
        {activeMenu === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-800">Katalog Kursus</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {availableCourses.map((course) => {
                const reg = registrations.find(r => Number(r.course_id) === Number(course.id));
                const status = reg?.status;
                return (
                  <Card key={course.id} className="rounded-[2.5rem] overflow-hidden bg-white border-none shadow-sm flex flex-col hover:shadow-xl transition-all relative">
                    <div className="h-48 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <BookOpen className="text-slate-200" size={60} />
                      {(status === 'success' || status === 'aktif') && <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-full shadow-lg"><CheckCircle2 size={20}/></div>}
                    </div>
                    <CardContent className="p-10 flex-1 flex flex-col">
                      <h4 className="text-2xl font-bold text-slate-800 mb-6">{course.title}</h4>
                      {(status === 'success' || status === 'aktif') ? (
                        <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-bold">Buka Modul</Button>
                      ) : (
                        <Button onClick={() => {}} className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold">Daftar Sekarang</Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* --- MENU RUANG BELAJAR --- */}
        {activeMenu === "materials" && (
          <div className="p-8 text-center text-slate-500">
            Pilih kursus aktif untuk memulai belajar.
          </div>
        )}

        {/* --- MENU TUGAS (SESUAI STRUKTUR TABEL tasks) --- */}
        {activeMenu === "assignments" && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Pengumpulan Tugas</h2>
              <p className="text-slate-500 font-medium">Form pengiriman tugas langsung ke basis data.</p>
            </div>

            <form onSubmit={handleTaskSubmit} className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              
              {/* Field: title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Judul Tugas <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={taskTitle} 
                  onChange={(e) => setTaskTitle(e.target.value)} 
                  placeholder="Masukkan judul tugas..." 
                  required
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium" 
                />
              </div>

              {/* Field: description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Deskripsi / Catatan Tugas
                </label>
                <textarea 
                  value={taskDescription} 
                  onChange={(e) => setTaskDescription(e.target.value)} 
                  placeholder="Tuliskan deskripsi atau ringkasan tugas kamu di sini..." 
                  className="w-full h-40 p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium" 
                />
              </div>

              {/* Field: file_path */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Unggah Berkas Tugas (file_path)
                </label>
                <label className="flex flex-col items-center justify-center w-full min-h-[140px] p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  {taskFile ? (
                    <div className="flex items-center gap-3 text-indigo-600 font-bold text-sm">
                      <Paperclip size={20} />
                      <span className="truncate max-w-xs">{taskFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-400">
                      <UploadCloud size={36} className="text-indigo-500" />
                      <span className="text-xs font-bold text-slate-600">Pilih file untuk diunggah</span>
                      <span className="text-[10px] text-slate-400">PDF, ZIP, DOCX, PNG, JPG</span>
                    </div>
                  )}
                  <input type="file" onChange={handleTaskFileChange} className="hidden" />
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmittingTask} 
                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 mt-4 transition-all"
              >
                {isSubmittingTask ? <Loader2 className="animate-spin" /> : "Kirim Tugas Sekarang"}
              </Button>
            </form>
          </div>
        )}

        {/* --- MENU SERTIFIKAT --- */}
        {activeMenu === "certificates" && (
          <div className="p-8 text-center text-slate-500">
            Daftar sertifikat kamu.
          </div>
        )}

        <footer className="py-12 border-t mt-auto text-center">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">© 2026 MEJATIKA LMS — PLATFORM BELAJAR MODERN</p>
        </footer>
      </main>
    </div>
  )
}
