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
  Send, UserCircle2, Menu, X, Star, RefreshCw
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [activeStep, setActiveStep] = useState<string>("live") 
  
  const [studentAnswer, setStudentAnswer] = useState("")
  const [taskLink, setTaskLink] = useState("")
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [courseProgress, setCourseProgress] = useState<Record<number, any>>({})
  
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)

  // 1. Fetch Data Utama
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const [resReg, resUser, resAll] = await Promise.all([
        fetch("https://backend.mejatika.com/api/registrations", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/me", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/courses", { headers: { "Authorization": `Bearer ${token}` } })
      ])
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err) { 
      console.error("Fetch Error:", err) 
    } finally { 
      setLoading(false) 
    }
  }, [router])

  // 2. Fetch Status Tugas & Feedback (SEKALIGUS UNTUK EDIT)
  const fetchSubmissionStatus = useCallback(async () => {
    if (!activeMaterial?.id) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/check/${activeMaterial.id}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      const data = await res.json()
      const submission = data.data || data
      setSubmissionFeedback(submission)
      
      // Auto-fill input jika sudah ada data sebelumnya (UNTUK FITUR UPDATE)
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

  // Menjalankan fetch submission saat pindah ke step tugas atau feedback
  useEffect(() => {
    if ((activeStep === "feedback" || activeStep === "tugas") && activeMaterial) {
      fetchSubmissionStatus()
    }
  }, [activeStep, activeMaterial, fetchSubmissionStatus])

  // Hitung Progress Kursus
  const calculateProgress = (courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId)
    if (!course || !course.materials) return 0
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

  const handleSendReply = async () => {
    if (!replyText.trim() || !submissionFeedback?.id) return
    setIsSendingReply(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/submissions/${submissionFeedback.id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: JSON.stringify({ message: replyText })
      })
      if (res.ok) { setReplyText(""); await fetchSubmissionStatus(); }
    } catch (err) { alert("Terjadi kesalahan koneksi") } finally { setIsSendingReply(false) }
  }

  // MODIFIKASI: Mendukung POST (Baru) dan PUT (Update)
  const handleSubmitTask = async () => {
    if (!studentAnswer && !taskLink) return alert("Isi jawaban atau link tugas!")
    
    const currentReg = registrations.find(r => Number(r.course_id) === Number(expandedCourse))
    if (!currentReg) return alert("Pendaftaran tidak ditemukan.")
    
    setIsSubmittingTask(true)
    const token = localStorage.getItem("token")
    
    // Jika sudah ada submissionFeedback.id, berarti kita melakukan UPDATE (PUT)
    const isUpdate = submissionFeedback && submissionFeedback.id
    const url = isUpdate 
      ? `https://backend.mejatika.com/api/submissions/${submissionFeedback.id}`
      : `https://backend.mejatika.com/api/submissions`
    
    try {
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: JSON.stringify({ 
          material_id: activeMaterial.id, 
          registration_id: currentReg.id, 
          student_answer: studentAnswer, 
          project_link: taskLink 
        })
      })
      
      if (res.ok) { 
        alert(isUpdate ? "Tugas berhasil diperbarui!" : "Tugas berhasil dikirim!")
        markStepComplete(activeMaterial.id, "tugas", "feedback")
      } else {
        const errData = await res.json()
        alert(errData.message || "Gagal mengirim tugas")
      }
    } catch (err) { 
      console.error(err)
      alert("Terjadi kesalahan sistem") 
    } finally { 
      setIsSubmittingTask(false) 
    }
  }

  const markStepComplete = (materialId: number, currentStep: string, nextStep: string | null) => {
    const newProgress = { ...courseProgress, [materialId]: { ...(courseProgress[materialId] || {}), [currentStep]: true } }
    setCourseProgress(newProgress)
    localStorage.setItem("mejatika_progress", JSON.stringify(newProgress))
    if (nextStep) setActiveStep(nextStep)
  }

  const isStepLocked = (materialId: number, step: string) => {
    const p = courseProgress[materialId] || {}
    if (step === "live") return false
    if (step === "materi") return !p.live
    if (step === "tugas") return !p.materi
    if (step === "feedback") return !p.tugas
    return true
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran?")) return
    setRegisteringId(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) await fetchData()
    } catch (err) { alert("Gagal mendaftar") } finally { setRegisteringId(null) }
  }

  const handleUploadProof = async (regId: number) => {
    if (!selectedProof) return alert("Pilih file bukti bayar!")
    setUploadingId(regId)
    const formData = new FormData()
    formData.append("proof", selectedProof)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`https://backend.mejatika.com/api/registrations/${regId}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData 
      })
      if (res.ok) { alert("Bukti terkirim!"); setSelectedProof(null); await fetchData(); }
    } catch (err) { alert("Gagal upload") } finally { setUploadingId(null) }
  }

  const renderEmbed = (url: string) => {
    if (!url) return null;
    let embedUrl = url
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview")
    }
    return (
      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border-4 border-white mb-8">
        <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen />
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 animate-pulse text-xl tracking-tighter">MEJATIKA PROCESSING...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-zinc-950 p-4 z-[60] flex justify-between items-center">
        <div className="flex items-center gap-2 font-black italic text-white">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-zinc-950 text-xs">M</div>
          <span className="uppercase text-sm tracking-tighter">Mejatika</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 hidden lg:flex items-center gap-3 font-black italic">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]">M</div>
          <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
        </div>
        <nav className="flex-1 px-4 mt-20 lg:mt-0 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "courses", label: "Katalog Kursus", icon: BookOpen },
            { id: "materials", label: "Ruang Belajar", icon: FileCheck },
            { id: "certificates", label: "Sertifikat", icon: Award },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[10px] transition-all duration-300 ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-lg translate-x-2' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-zinc-900">
           <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 font-black italic uppercase text-[10px] hover:bg-rose-500/10 rounded-2xl transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'blur-sm' : ''} lg:ml-72 p-6 lg:p-10 flex flex-col mt-16 lg:mt-0`}>
        
        {/* DASHBOARD TAB */}
        {activeMenu === "dashboard" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-zinc-900 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-16 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 hidden lg:block"><Zap size={200} /></div>
              <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">Woi, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-amber-500 font-bold uppercase text-[11px] tracking-[0.3em]">Siap bantai codingan hari ini?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <Card className="p-8 lg:p-10 rounded-[2.5rem] bg-white border-none shadow-sm">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Katalog</p>
                <h3 className="text-4xl lg:text-5xl font-black italic">{availableCourses.length}</h3>
              </Card>
              <Card className="p-8 lg:p-10 rounded-[2.5rem] bg-white border-none shadow-sm">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Pendaftaran</p>
                <h3 className="text-4xl lg:text-5xl font-black italic text-amber-500">{registrations.length}</h3>
              </Card>
              <Card className="p-8 lg:p-10 rounded-[2.5rem] bg-white border-b-8 border-emerald-500 shadow-sm">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Kursus Aktif</p>
                <h3 className="text-4xl lg:text-5xl font-black italic text-emerald-600">{registrations.filter(r => r.status === 'success').length}</h3>
              </Card>
            </div>

            {/* QUICK RESUME */}
            {registrations.filter(r => r.status === 'success').length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-black italic uppercase tracking-tight">Lanjutkan Belajar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrations.filter(r => r.status === 'success').slice(0, 2).map(reg => (
                    <div key={reg.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group">
                      <div>
                        <p className="text-[9px] font-black text-amber-500 uppercase mb-1">{calculateProgress(reg.course_id)}% Selesai</p>
                        <h4 className="font-black italic uppercase text-sm truncate max-w-[150px]">{reg.course?.title}</h4>
                      </div>
                      <Button onClick={() => { setExpandedCourse(reg.course_id); setActiveMenu("materials"); }} size="icon" className="rounded-full bg-zinc-950 text-white group-hover:scale-110 transition-transform">
                        <PlayCircle size={20} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COURSES TAB */}
        {activeMenu === "courses" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Katalog Kursus</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {availableCourses.map((course) => {
                const reg = registrations.find(r => Number(r.course_id) === Number(course.id));
                const status = reg?.status;
                return (
                  <Card key={course.id} className="rounded-[3.5rem] overflow-hidden bg-white border-none shadow-sm flex flex-col hover:shadow-xl transition-all duration-500">
                    <div className="h-48 bg-zinc-100 flex items-center justify-center relative">
                      <BookOpen className="text-zinc-300" size={60} />
                      {status === 'success' && <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-full shadow-lg"><CheckCircle2 size={20}/></div>}
                    </div>
                    <CardContent className="p-10 flex-1 flex flex-col">
                      <h4 className="text-2xl font-black uppercase italic mb-6 leading-tight tracking-tighter">{course.title}</h4>
                      {status === 'success' ? (
                        <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white h-14 rounded-2xl font-black italic uppercase text-[11px]">Buka Modul <Zap size={14} className="ml-2"/></Button>
                      ) : status === 'pending' ? (
                        <div className="space-y-4 bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-100">
                           <div className="flex items-center gap-2 text-amber-700 font-black italic uppercase text-[10px] mb-2"><CreditCard size={16}/> BRI: 0021-01-234567-53-1</div>
                           <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-amber-300 rounded-2xl bg-white cursor-pointer hover:bg-amber-100 transition-colors">
                             {selectedProof ? <span className="text-[9px] font-black uppercase text-emerald-700 truncate px-4">{selectedProof.name}</span> : <UploadCloud className="text-amber-400" size={24} />}
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} />
                           </label>
                           <Button onClick={() => handleUploadProof(reg.id)} disabled={uploadingId === reg.id} className="w-full bg-zinc-950 text-amber-500 h-12 rounded-xl font-black italic uppercase text-[10px]">
                             {uploadingId === reg.id ? <Loader2 className="animate-spin" /> : "Konfirmasi Bayar"}
                           </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEnroll(course.id)} disabled={registeringId === course.id} className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic uppercase text-[11px]">
                          {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* MATERIALS TAB (Ruang Belajar) */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 animate-in fade-in duration-500">
            {/* Sidebar Modul */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Modul</h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {registrations.filter(r => r.status === 'success').map((reg) => (
                  <div key={reg.id} className="space-y-3">
                    <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.course_id ? 'bg-zinc-950 text-white' : 'bg-white shadow-sm'}`}>
                      <span className="text-[10px] font-black uppercase italic truncate pr-4">{reg.course?.title}</span>
                      <ChevronDown size={14} className={`${expandedCourse === reg.course_id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                      <div key={m.id} className="ml-4 pl-4 border-l-2 border-zinc-200 space-y-2">
                        <p className="text-[9px] font-black text-amber-600 uppercase italic mb-1">{m.title}</p>
                        {[
                          { id: "live", label: "Live Session", icon: Video },
                          { id: "materi", label: "Materi Pokok", icon: MonitorPlay },
                          { id: "tugas", label: "Tugas Praktik", icon: Flame },
                          { id: "feedback", label: "Feedback", icon: MessageSquare }
                        ].map((step) => {
                          const locked = isStepLocked(m.id, step.id)
                          const done = courseProgress[m.id]?.[step.id]
                          return (
                            <button key={step.id} disabled={locked} onClick={() => { setActiveMaterial(m); setActiveStep(step.id); }} className={`w-full flex items-center justify-between p-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-amber-100 text-amber-700' : 'bg-white'} ${locked ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-zinc-50'}`}>
                              <span className="flex items-center gap-2">{locked ? <Lock size={12} /> : <step.icon size={12} />} {step.label}</span>
                              {done && <CheckCircle2 size={12} className="text-emerald-500" />}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Area Belajar */}
            <div className="lg:col-span-8">
              {activeMaterial ? (
                <div className="bg-white p-6 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] shadow-sm space-y-8 animate-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                      <span className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-zinc-950 text-xs">0{activeStep === "live" ? "1" : activeStep === "materi" ? "2" : activeStep === "tugas" ? "3" : "4"}</span>
                      {activeStep === "live" ? "Live" : activeStep === "materi" ? "Materi" : activeStep === "tugas" ? "Tugas" : "Review"}
                    </h3>
                    <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[9px] font-black uppercase text-zinc-400 italic truncate max-w-[200px]">{activeMaterial.title}</div>
                  </div>

                  {/* STEP: LIVE */}
                  {activeStep === "live" && (
                    <div className="space-y-8">
                      {renderEmbed(activeMaterial.live_link)}
                      <Button onClick={() => markStepComplete(activeMaterial.id, "live", "materi")} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-[11px]">Selesai Nonton & Lanjut</Button>
                    </div>
                  )}

                  {/* STEP: MATERI */}
                  {activeStep === "materi" && (
                    <div className="space-y-8">
                      {activeMaterial.content && !activeMaterial.content.includes('<iframe') && renderEmbed(activeMaterial.file)}
                      <div className="bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-100 prose prose-zinc max-w-full italic font-medium">
                        <div dangerouslySetInnerHTML={{ __html: activeMaterial.content }} style={{ wordBreak: 'break-word' }} />
                      </div>
                      <Button onClick={() => markStepComplete(activeMaterial.id, "materi", "tugas")} className="w-full bg-emerald-500 text-white h-16 rounded-[2rem] font-black italic uppercase text-[11px]">Sudah Paham, Ke Tugas</Button>
                    </div>
                  )}

                  {/* STEP: TUGAS */}
                  {activeStep === "tugas" && (
                    <div className="space-y-6">
                       <div className="p-8 bg-amber-50 rounded-[2.5rem] border-2 border-amber-100">
                          <h4 className="text-[10px] font-black uppercase text-amber-700 mb-3 tracking-widest flex items-center gap-2"><Flame size={14}/> Instruksi:</h4>
                          <div className="text-sm italic font-medium text-zinc-800">{activeMaterial.quiz_task || "Silahkan kerjakan tugas sesuai arahan di video materi."}</div>
                       </div>
                       
                       {/* Label Informasi jika sedang Edit */}
                       {submissionFeedback && (
                         <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black italic uppercase w-fit">
                           <RefreshCw size={12} className="animate-spin-slow" /> Anda sedang mengedit tugas yang sudah dikirim
                         </div>
                       )}

                       <textarea 
                        value={studentAnswer} 
                        onChange={(e) => setStudentAnswer(e.target.value)} 
                        placeholder="Tulis jawaban atau catatan di sini..." 
                        className="w-full h-32 p-6 rounded-3xl bg-zinc-50 outline-none text-sm border-2 border-zinc-100 focus:border-amber-500" 
                       />
                       
                       <input 
                        type="text" 
                        value={taskLink} 
                        onChange={(e) => setTaskLink(e.target.value)} 
                        placeholder="URL Project (GitHub/Drive)" 
                        className="w-full p-5 rounded-full bg-zinc-50 outline-none text-sm border-2 border-zinc-100 focus:border-amber-500" 
                       />

                       <Button onClick={handleSubmitTask} disabled={isSubmittingTask} className={`w-full h-16 rounded-[2rem] font-black italic uppercase text-[11px] ${submissionFeedback ? 'bg-emerald-600 text-white' : 'bg-zinc-950 text-amber-500'}`}>
                         {isSubmittingTask ? <Loader2 className="animate-spin" /> : (submissionFeedback ? "Update Tugas Anda" : "Submit Tugas Anda")}
                       </Button>
                    </div>
                  )}

                  {/* STEP: FEEDBACK */}
                  {activeStep === "feedback" && (
                    <div className="space-y-6 animate-in fade-in">
                       {submissionFeedback ? (
                         <div className="space-y-6">
                            <div className="bg-zinc-900 p-8 rounded-[3rem] text-white">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950"><UserCircle2 size={24}/></div>
                                     <div>
                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Mentor Review</p>
                                        <h4 className="text-xl font-black italic uppercase">Feedback</h4>
                                     </div>
                                  </div>
                                  <div className="text-center bg-zinc-800 px-4 py-2 rounded-2xl">
                                     <p className="text-[8px] font-black text-zinc-500 uppercase">Nilai</p>
                                     <div className="text-3xl font-black italic text-amber-500">{submissionFeedback.score || "—"}</div>
                                  </div>
                               </div>
                               <div className="p-6 bg-zinc-800/50 rounded-2xl italic text-zinc-300 text-sm">
                                  "{submissionFeedback.mentor_feedback || "Menunggu review mentor..."}"
                               </div>
                            </div>

                            {/* Tombol Revisi: Membawa balik ke tab tugas */}
                            <Button 
                              variant="outline"
                              onClick={() => setActiveStep("tugas")}
                              className="w-full border-2 border-zinc-200 rounded-2xl font-black italic uppercase text-[10px] h-12 hover:bg-zinc-50"
                            >
                              <RefreshCw size={14} className="mr-2" /> Perbaiki / Update Tugas
                            </Button>

                            {/* Chat Reply Area */}
                            <div className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100 space-y-4">
                               {submissionFeedback.student_reply && (
                                 <div className="flex flex-col items-end">
                                    <div className="bg-amber-100 p-4 rounded-2xl text-sm italic font-medium max-w-[90%]">{submissionFeedback.student_reply}</div>
                                    <span className="text-[8px] font-black uppercase text-zinc-400 mt-1">Balasan Anda</span>
                                 </div>
                               )}
                               {!submissionFeedback.student_reply && (
                                 <div className="relative">
                                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Balas atau tanya mentor..." className="w-full p-5 pr-14 bg-white border-2 border-zinc-100 rounded-3xl outline-none text-sm italic" />
                                    <button onClick={handleSendReply} className="absolute bottom-4 right-4 h-10 w-10 bg-zinc-950 text-amber-500 rounded-full flex items-center justify-center"><Send size={16}/></button>
                                 </div>
                               )}
                            </div>
                         </div>
                       ) : (
                         <div className="bg-emerald-50 p-12 rounded-[3rem] text-center border-2 border-emerald-100">
                            <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={40} />
                            <h4 className="text-lg font-black italic uppercase">Tugas Terkirim!</h4>
                            <p className="text-xs text-zinc-500 italic">Silahkan tunggu mentor memberikan feedback dan nilai.</p>
                         </div>
                       )}
                       <Button onClick={() => markStepComplete(activeMaterial.id, "feedback", null)} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-[11px]">Selesaikan Modul Ini</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[3rem] lg:rounded-[5rem] bg-white/20">
                  <PlayCircle size={80} className="opacity-10 mb-4" />
                  <p className="font-black italic uppercase text-[10px] tracking-[0.3em] opacity-40">Pilih Modul Belajar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CERTIFICATES TAB */}
        {activeMenu === "certificates" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Sertifikat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {registrations.filter(r => r.status === 'success').map(reg => {
                const isFinished = calculateProgress(reg.course_id) === 100;
                return (
                  <Card key={reg.id} className={`rounded-[2.5rem] p-8 flex flex-col items-center text-center ${isFinished ? 'bg-white' : 'bg-zinc-50 opacity-50'}`}>
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 ${isFinished ? 'bg-amber-100 text-amber-500' : 'bg-zinc-200 text-zinc-400'}`}>
                      <Award size={40} />
                    </div>
                    <h4 className="font-black italic uppercase text-sm mb-2">{reg.course?.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-6">{isFinished ? "Verified Graduate" : "Kursus Belum Selesai"}</p>
                    <Button disabled={!isFinished} className={`w-full h-12 rounded-xl font-black italic uppercase text-[10px] ${isFinished ? 'bg-zinc-950 text-amber-500' : 'bg-zinc-200'}`}>
                      {isFinished ? "Download PDF" : "Progress: " + calculateProgress(reg.course_id) + "%"}
                    </Button>
                  </Card>
                )
              })}
              {registrations.filter(r => r.status === 'success').length === 0 && (
                 <div className="col-span-full py-20 text-center italic text-zinc-400 font-bold uppercase tracking-widest">Belum ada kursus yang diselesaikan.</div>
              )}
            </div>
          </div>
        )}

        <footer className="py-12 border-t border-zinc-100 mt-auto text-center">
          <p className="text-[9px] font-black uppercase italic text-zinc-400 tracking-[0.4em]">© 2026 MEJATIKA.COM — BUILD WITH SPEED AND STYLE</p>
        </footer>
      </main>
    </div>
  )
}
