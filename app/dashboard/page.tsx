
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, ChevronDown, Clock, 
  FileText, Loader2, Flame, MessageSquare, 
  Video, MonitorPlay, Zap, Lock, CreditCard, UploadCloud,
  Send, UserCircle2, Menu, X, Star, RefreshCw, AlertCircle, Download
} from "lucide-react"
import Swal from 'sweetalert2' // Pastikan sudah install sweetalert2

// --- TYPES ---
interface Material {
  id: number;
  title: string;
  live_link?: string;
  file?: string;
  content: string;
  quiz_task?: string;
}

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State Operasional
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [activeStep, setActiveStep] = useState<string>("live") 
  
  // State Tugas
  const [studentAnswer, setStudentAnswer] = useState("")
  const [taskLink, setTaskLink] = useState("")
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [courseProgress, setCourseProgress] = useState<Record<number, any>>({})
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(null)

  const API_URL = "https://backend.mejatika.com/api"

  // 1. Fetch Data Utama
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    
    try {
      setError(null)
      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
      
      const [resReg, resUser, resAll] = await Promise.all([
        fetch(`${API_URL}/registrations`, { headers }),
        fetch(`${API_URL}/me`, { headers }),
        fetch(`${API_URL}/courses`, { headers })
      ])

      if (resReg.status === 401) throw new Error("Unauthorized")

      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err: any) { 
      console.error("Fetch Error:", err)
      if (err.message === "Unauthorized") {
        localStorage.clear()
        router.push("/login")
      }
      setError("Gagal memuat data. Silakan refresh halaman.")
    } finally { 
      setLoading(false) 
    }
  }, [router])

  // 2. Fetch Status Tugas & Feedback
  const fetchSubmissionStatus = useCallback(async () => {
    if (!activeMaterial?.id) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/submissions/check/${activeMaterial.id}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      const data = await res.json()
      const submission = data.data || data
      setSubmissionFeedback(submission)
      
      if (submission && activeStep === "tugas") {
        setStudentAnswer(submission.student_answer || "")
        setTaskLink(submission.project_link || "")
      }
    } catch (err) {
      console.error("Gagal mengambil status submission")
    }
  }, [activeMaterial, activeStep])

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("mejatika_progress")
    if (saved) setCourseProgress(JSON.parse(saved))
  }, [fetchData])

  useEffect(() => {
    if ((activeStep === "feedback" || activeStep === "tugas") && activeMaterial) {
      fetchSubmissionStatus()
    }
  }, [activeStep, activeMaterial, fetchSubmissionStatus])

  // --- LOGIKA PROGRESS FLOW ---
  const markStepComplete = (materialId: number, currentStep: string, nextStep: string | null) => {
    const newProgress = { 
      ...courseProgress, 
      [materialId]: { ...(courseProgress[materialId] || {}), [currentStep]: true } 
    }
    setCourseProgress(newProgress)
    localStorage.setItem("mejatika_progress", JSON.stringify(newProgress))
    if (nextStep) setActiveStep(nextStep)
    else alert("Selamat! Kamu telah menyelesaikan modul ini.")
  }

  const isStepLocked = (materialId: number, step: string) => {
    const p = courseProgress[materialId] || {}
    if (step === "live") return false
    if (step === "materi") return !p.live
    if (step === "tugas") return !p.materi
    if (step === "feedback") return !p.tugas
    return true
  }

  const calculateProgress = (courseId: number) => {
    const course = availableCourses.find(c => Number(c.id) === Number(courseId))
    if (!course || !course.materials || course.materials.length === 0) return 0
    const totalSteps = course.materials.length * 4
    let completedSteps = 0
    course.materials.forEach((m: any) => {
      const prog = courseProgress[m.id] || {}
      if (prog.live) completedSteps++
      if (prog.materi) completedSteps++
      if (prog.tugas) completedSteps++
      if (prog.feedback) completedSteps++
    })
    return Math.round((completedSteps / totalSteps) * 100)
  }

  // --- LOGIKA DOWNLOAD SERTIFIKAT TERBARU ---
  const handleDownloadCertificate = async (reg: any) => {
    const certData = reg.certificate;
    if (!certData?.id) return Swal.fire("Belum Tersedia", "Sertifikat belum diterbitkan oleh Admin.", "info");
    
    setDownloadingCertId(reg.id);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/certificates/${certData.id}/download`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/pdf"
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Gagal mengunduh file." }));
        throw new Error(errorData.message || "Akses ditolak atau file tidak ditemukan.");
      }

      const blob = await response.blob();
      
      // Validasi apakah benar PDF
      if (blob.type !== "application/pdf") {
        throw new Error("Format file yang diterima bukan PDF. Hubungi Admin.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sertifikat-${reg.course?.title || 'Mejatika'}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Sertifikat berhasil diunduh.',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error("Download Error:", err);
      Swal.fire("Gagal Unduh", err.message, "error");
    } finally {
      setDownloadingCertId(null);
    }
  };

  const handleSubmitTask = async () => {
    if (!studentAnswer && !taskLink) return alert("Isi jawaban atau link tugas!")
    const currentReg = registrations.find(r => Number(r.course_id) === Number(expandedCourse))
    if (!currentReg) return alert("Pendaftaran tidak ditemukan.")
    
    setIsSubmittingTask(true)
    const token = localStorage.getItem("token")
    const isUpdate = submissionFeedback && submissionFeedback.id
    const url = isUpdate ? `${API_URL}/submissions/${submissionFeedback.id}` : `${API_URL}/submissions`
    
    try {
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: JSON.stringify({ 
          material_id: activeMaterial?.id, 
          registration_id: currentReg.id, 
          student_answer: studentAnswer, 
          project_link: taskLink 
        })
      })
      if (res.ok) { 
        alert(isUpdate ? "Tugas diperbarui!" : "Tugas berhasil dikirim!");
        markStepComplete(activeMaterial!.id, "tugas", "feedback");
      }
    } catch (err) { alert("Gagal mengirim tugas") } finally { setIsSubmittingTask(false) }
  }

  const renderEmbed = (url: string | undefined) => {
    if (!url) return null;
    let embedUrl = url;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview")
    }
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 mb-6">
        <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen />
      </div>
    )
  }

  // --- UI RENDER ---
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 font-bold animate-pulse tracking-widest">MEJATIKA LOADING...</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">M</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Mejatika<span className="text-indigo-600">.</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "courses", label: "Katalog Kursus", icon: BookOpen },
            { id: "materials", label: "Ruang Belajar", icon: FileCheck },
            { id: "certificates", label: "Sertifikat", icon: Award },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${activeMenu === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 lg:ml-64 p-4 lg:p-10 flex flex-col min-h-screen transition-all duration-300`}>
        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 z-[60] flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">M</div>
            <span>Mejatika</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </header>

        <div className="mt-16 lg:mt-0 flex-1 flex flex-col">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle size={18} /> {error}
              <button onClick={fetchData} className="ml-auto underline underline-offset-4">Coba Lagi</button>
            </div>
          )}

          {/* DASHBOARD SECTION */}
          {activeMenu === "dashboard" && (
            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-[2.5rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute -top-10 -right-10 p-10 opacity-10 hidden lg:block rotate-12"><Zap size={300} /></div>
                <div className="relative z-10">
                  <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">Halo, {user?.name?.split(' ')[0]}! 👋</h2>
                  <p className="text-indigo-100 text-lg font-medium max-w-md">Senang melihatmu kembali. Mari tuntaskan target belajarmu hari ini!</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Katalog Tersedia", val: availableCourses.length, color: "text-slate-800", sub: "Kursus Baru" },
                  { label: "Total Pendaftaran", val: registrations.length, color: "text-indigo-600", sub: "Kursus Saya" },
                  { label: "Kursus Aktif", val: registrations.filter(r => r.status === 'success' || r.status === 'aktif').length, color: "text-emerald-600", sub: "Siap Belajar" },
                ].map((stat, i) => (
                  <Card key={i} className="p-8 rounded-[2rem] bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{stat.label}</p>
                    <h3 className={`text-4xl font-black ${stat.color}`}>{stat.val}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{stat.sub}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* RUANG BELAJAR */}
          {activeMenu === "materials" && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Sidebar Materi */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   <MonitorPlay className="text-indigo-600" /> Ruang Belajar
                </h2>
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                  {registrations.filter(r => r.status === 'success' || r.status === 'aktif').map((reg) => (
                    <div key={reg.id} className="group">
                      <button 
                        onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} 
                        className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-300 ${expandedCourse === reg.course_id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'bg-white border border-slate-100 hover:border-indigo-200'}`}>
                        <span className="text-sm font-bold truncate pr-4">{reg.course?.title}</span>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${expandedCourse === reg.course_id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedCourse === reg.course_id && (
                        <div className="mt-3 ml-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {reg.course?.materials?.map((m: any) => (
                            <div key={m.id} className="pl-4 border-l-2 border-slate-200 space-y-1">
                              <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 tracking-tighter">{m.title}</p>
                              <div className="grid grid-cols-1 gap-1">
                                {[
                                  { id: "live", label: "Live Session", icon: Video },
                                  { id: "materi", label: "Materi Pokok", icon: MonitorPlay },
                                  { id: "tugas", label: "Tugas Praktik", icon: Flame },
                                  { id: "feedback", label: "Feedback", icon: MessageSquare }
                                ].map((step) => {
                                  const locked = isStepLocked(m.id, step.id);
                                  const done = courseProgress[m.id]?.[step.id];
                                  return (
                                    <button 
                                      key={step.id} 
                                      disabled={locked} 
                                      onClick={() => { setActiveMaterial(m); setActiveStep(step.id); }} 
                                      className={`w-full flex items-center justify-between p-3 rounded-xl text-[11px] font-bold transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-white'} ${locked ? 'opacity-30 cursor-not-allowed' : 'hover:translate-x-1'}`}>
                                      <span className="flex items-center gap-2">{locked ? <Lock size={12} /> : <step.icon size={12} />} {step.label}</span>
                                      {done && <CheckCircle2 size={12} className="text-emerald-500" />}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Konten */}
              <div className="lg:col-span-8">
                {activeMaterial ? (
                  <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">
                          {activeStep === "live" ? "01" : activeStep === "materi" ? "02" : activeStep === "tugas" ? "03" : "04"}
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{activeStep}</h3>
                          <p className="text-xs text-slate-400 font-bold">{activeMaterial.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step: Live */}
                    {activeStep === "live" && (
                      <div className="space-y-6">
                        {renderEmbed(activeMaterial.live_link)}
                        <Button onClick={() => markStepComplete(activeMaterial.id, "live", "materi")} className="w-full bg-slate-900 hover:bg-black text-white h-16 rounded-[1.5rem] font-bold shadow-lg transition-transform active:scale-[0.98]">
                          Saya Sudah Menonton <CheckCircle2 className="ml-2" size={20}/>
                        </Button>
                      </div>
                    )}

                    {/* Step: Materi */}
                    {activeStep === "materi" && (
                      <div className="space-y-6">
                        {activeMaterial.file && renderEmbed(activeMaterial.file)}
                        <article className="prose prose-slate max-w-none bg-slate-50 p-8 rounded-3xl border border-slate-100 overflow-hidden">
                          <div dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                        </article>
                        <Button onClick={() => markStepComplete(activeMaterial.id, "materi", "tugas")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-[1.5rem] font-bold shadow-lg">
                          Lanjut ke Tugas Praktik
                        </Button>
                      </div>
                    )}

                    {/* Step: Tugas */}
                    {activeStep === "tugas" && (
                      <div className="space-y-6">
                        <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                          <h4 className="text-xs font-black text-amber-700 mb-3 uppercase tracking-widest flex items-center gap-2"><Flame size={16}/> Instruksi Tugas</h4>
                          <p className="text-sm text-amber-900 leading-relaxed font-medium">{activeMaterial.quiz_task || "Silakan buat ringkasan atau praktikkan modul ini."}</p>
                        </div>
                        <textarea 
                          value={studentAnswer} 
                          onChange={(e) => setStudentAnswer(e.target.value)} 
                          placeholder="Tuliskan jawaban atau laporan hasil praktikmu di sini..." 
                          className="w-full h-48 p-6 rounded-3xl bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none text-sm transition-all" 
                        />
                        <div className="relative">
                           <MonitorPlay className="absolute left-5 top-5 text-slate-400" size={18} />
                           <input 
                            type="text" 
                            value={taskLink} 
                            onChange={(e) => setTaskLink(e.target.value)} 
                            placeholder="Link Project (Google Drive / GitHub / Figma)" 
                            className="w-full p-5 pl-14 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-sm" 
                           />
                        </div>
                        <Button onClick={handleSubmitTask} disabled={isSubmittingTask} className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-xl">
                          {isSubmittingTask ? <Loader2 className="animate-spin" /> : (submissionFeedback ? "Simpan Perubahan" : "Kirim Tugas Sekarang")}
                        </Button>
                      </div>
                    )}

                    {/* Step: Feedback */}
                    {activeStep === "feedback" && (
                      <div className="space-y-6">
                        {submissionFeedback ? (
                          <div className="space-y-6">
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3"><UserCircle2 size={32} className="text-indigo-400"/><h4 className="text-lg font-bold">Review Mentor</h4></div>
                                <div className="bg-indigo-600 px-6 py-2 rounded-xl text-2xl font-black">{submissionFeedback.score || "—"}</div>
                              </div>
                              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-slate-300 text-sm">
                                "{submissionFeedback.mentor_feedback || "Mentor sedang memeriksa tugasmu. Mohon tunggu sejenak."}"
                              </div>
                            </div>
                            <Button onClick={() => markStepComplete(activeMaterial.id, "feedback", null)} className="w-full bg-indigo-600 text-white h-16 rounded-[1.5rem] font-bold">
                              Tandai Modul Selesai
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-20 bg-emerald-50 rounded-[2rem] border-2 border-dashed border-emerald-200">
                             <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
                             <p className="text-emerald-800 font-bold">Tugas berhasil dikirim!</p>
                             <p className="text-emerald-600 text-xs mt-1">Kami akan memberitahumu setelah mentor memberikan feedback.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-200 border-4 border-dashed rounded-[3rem] bg-white group hover:border-indigo-100 transition-colors">
                    <div className="relative">
                      <PlayCircle size={100} className="opacity-10 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                    </div>
                    <p className="font-black uppercase text-xs tracking-[0.3em] opacity-40 mt-6">Pilih Modul Untuk Memulai</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SERTIFIKAT SECTION (UPGRADED) */}
          {activeMenu === "certificates" && (
            <section className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-800">E-Sertifikat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registrations
                  .filter(r => r.status === 'success' || r.status === 'aktif')
                  .map(reg => {
                    const progress = calculateProgress(reg.course_id);
                    const hasCertificate = reg.certificate !== null;
                    const isDownloading = downloadingCertId === reg.id;

                    return (
                      <Card key={reg.id} className="rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-sm border-none bg-white hover:shadow-xl transition-all duration-300 group">
                        <div className={`h-24 w-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:rotate-6 ${hasCertificate ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                          <Award size={48} />
                        </div>
                        <h4 className="font-black text-slate-800 mb-2">{reg.course?.title}</h4>
                        
                        <div className="mb-8 w-full">
                          {hasCertificate ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Tersedia</span>
                              <p className="text-[10px] text-slate-400 font-bold">ID: {reg.certificate.certificate_number}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${progress}%` }} />
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress: {progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          disabled={!hasCertificate || isDownloading} 
                          onClick={() => handleDownloadCertificate(reg)}
                          className={`w-full h-14 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${hasCertificate ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-slate-200 text-slate-400'}`}
                        >
                          {isDownloading ? (
                            <><RefreshCw className="h-4 w-4 animate-spin" /> Menyiapkan...</>
                          ) : hasCertificate ? (
                            <><Download className="h-4 w-4" /> Download PDF</>
                          ) : (
                            "Selesaikan Kursus"
                          )}
                        </Button>
                      </Card>
                    );
                  })}
                
                {registrations.filter(r => r.status === 'success' || r.status === 'aktif').length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed">
                    <Award className="mx-auto text-slate-200 mb-4" size={60} />
                    <p className="text-slate-400 font-bold">Belum ada kursus aktif.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
        <footer className="py-12 border-t mt-12 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
            © 2026 MEJATIKA LMS — Built with Precision
          </p>
        </footer>
      </main>

      {/* Overlay sidebar mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
