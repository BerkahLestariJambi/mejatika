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
  Send, UserCircle2, Menu, X, Star, RefreshCw, Download
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
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(null)

  const API_URL = "https://backend.mejatika.com/api"

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      const [resReg, resUser, resAll] = await Promise.all([
        fetch(`${API_URL}/registrations`, { headers }),
        fetch(`${API_URL}/me`, { headers }),
        fetch(`${API_URL}/courses`, { headers })
      ])
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()
      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [router])

  // --- FUNGSI DOWNLOAD SERTIFIKAT FIX ---
  const handleDownloadCertificate = async (reg: any) => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    setDownloadingCertId(reg.id)
    try {
      const response = await fetch(`${API_URL}/registrations/${reg.id}/certificate`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/pdf" },
      })
      if (!response.ok) throw new Error("Gagal")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Sertifikat-${reg.course?.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) { alert("Sertifikat belum tersedia atau gagal diunduh.") }
    finally { setDownloadingCertId(null) }
  }

  // --- LOGIKA METERIAL & TUGAS (DARI FILE ASLI SISWA.TXT) ---
  const fetchSubmissionStatus = useCallback(async () => {
    if (!activeMaterial?.id) return
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/submissions/check/${activeMaterial.id}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      const data = await res.json()
      setSubmissionFeedback(data.data || data)
    } catch (err) { console.error(err) }
  }, [activeMaterial])

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("mejatika_progress")
    if (saved) setCourseProgress(JSON.parse(saved))
  }, [fetchData])

  useEffect(() => {
    if ((activeStep === "feedback" || activeStep === "tugas") && activeMaterial) fetchSubmissionStatus()
  }, [activeStep, activeMaterial, fetchSubmissionStatus])

  const calculateProgress = (courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId)
    if (!course || !course.materials) return 0
    const totalSteps = course.materials.length * 4
    let completed = 0
    course.materials.forEach((m: any) => {
      const p = courseProgress[m.id] || {}
      if (p.live) completed++; if (p.materi) completed++; if (p.tugas) completed++; if (p.feedback) completed++;
    })
    return Math.round((completed / totalSteps) * 100)
  }

  const handleEnroll = async (courseId: number) => {
    setRegisteringId(courseId)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) fetchData()
    } catch (err) { alert("Gagal") } finally { setRegisteringId(null) }
  }

  const handleSubmitTask = async () => {
    setIsSubmittingTask(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ material_id: activeMaterial.id, student_answer: studentAnswer, project_link: taskLink })
      })
      if (res.ok) { alert("Berhasil!"); markStepComplete(activeMaterial.id, "tugas", "feedback"); }
    } catch (err) { alert("Gagal") } finally { setIsSubmittingTask(false) }
  }

  const markStepComplete = (materialId: number, current: string, next: string | null) => {
    const newProg = { ...courseProgress, [materialId]: { ...(courseProgress[materialId] || {}), [current]: true } }
    setCourseProgress(newProg)
    localStorage.setItem("mejatika_progress", JSON.stringify(newProg))
    if (next) setActiveStep(next)
  }

  const isStepLocked = (materialId: number, step: string) => {
    const p = courseProgress[materialId] || {}
    if (step === "live") return false
    if (step === "materi") return !p.live
    if (step === "tugas") return !p.materi
    if (step === "feedback") return !p.tugas
    return true
  }

  const renderEmbed = (url: string) => {
    if (!url) return null;
    let eUrl = url.includes("youtube.com") ? url.replace("watch?v=", "embed/") : url
    return (
      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black mb-8 border-4 border-white">
        <iframe src={eUrl} className="w-full h-full" allowFullScreen />
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400">LOADING...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900">
      {/* SIDEBAR ASLI */}
      <aside className={`w-72 bg-zinc-950 text-white fixed h-full z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center gap-3 font-black italic">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950">M</div>
          <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "courses", label: "Katalog Kursus", icon: BookOpen }, { id: "materials", label: "Ruang Belajar", icon: FileCheck }, { id: "certificates", label: "Sertifikat", icon: Award }].map((item) => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[10px] ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 lg:p-10 flex flex-col">
        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="space-y-10">
            <div className="bg-zinc-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden">
              <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Woi, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-amber-500 font-bold uppercase text-[11px] tracking-[0.3em] mt-4">Siap bantai codingan hari ini?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Katalog</p><h3 className="text-5xl font-black italic">{availableCourses.length}</h3></Card>
              <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Pendaftaran</p><h3 className="text-5xl font-black italic text-amber-500">{registrations.length}</h3></Card>
              <Card className="p-10 rounded-[2.5rem] bg-white border-b-8 border-emerald-500 shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Kursus Aktif</p><h3 className="text-5xl font-black italic text-emerald-600">{registrations.filter(r => r.status === 'success').length}</h3></Card>
            </div>
          </div>
        )}

        {/* KATALOG KURSUS */}
        {activeMenu === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {availableCourses.map((course) => {
              const reg = registrations.find(r => r.course_id === course.id)
              return (
                <Card key={course.id} className="rounded-[3.5rem] overflow-hidden bg-white border-none shadow-sm">
                  <div className="h-48 bg-zinc-100 flex items-center justify-center"><BookOpen className="text-zinc-300" size={60} /></div>
                  <CardContent className="p-10">
                    <h4 className="text-2xl font-black uppercase italic mb-6 leading-tight tracking-tighter">{course.title}</h4>
                    {reg?.status === 'success' ? (
                      <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white h-14 rounded-2xl font-black italic text-[11px]">BUKA MODUL</Button>
                    ) : reg?.status === 'pending' ? (
                      <div className="p-4 bg-amber-50 rounded-2xl text-[10px] font-black italic text-amber-700">MENUNGGU VERIFIKASI PEMBAYARAN</div>
                    ) : (
                      <Button onClick={() => handleEnroll(course.id)} disabled={registeringId === course.id} className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic text-[11px]">DAFTAR SEKARANG</Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* RUANG BELAJAR (MODUL & TUGAS) */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
              {registrations.filter(r => r.status === 'success').map((reg) => (
                <div key={reg.id} className="space-y-2">
                  <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className="w-full p-5 bg-zinc-950 text-white rounded-2xl flex justify-between items-center text-[10px] font-black italic uppercase">
                    {reg.course?.title} <ChevronDown size={14}/>
                  </button>
                  {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                    <div key={m.id} className="ml-4 border-l-2 border-zinc-200 pl-4 space-y-1">
                      {['live', 'materi', 'tugas', 'feedback'].map(step => (
                        <button key={step} disabled={isStepLocked(m.id, step)} onClick={() => { setActiveMaterial(m); setActiveStep(step); }} className={`w-full text-left p-3 rounded-xl text-[9px] font-black italic uppercase ${activeMaterial?.id === m.id && activeStep === step ? 'bg-amber-100 text-amber-700' : 'bg-white opacity-60 disabled:opacity-20'}`}>
                          {step} {courseProgress[m.id]?.[step] && '✓'}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] shadow-sm">
               {activeMaterial ? (
                 <>
                   <h3 className="text-2xl font-black italic uppercase mb-8">{activeStep} - {activeMaterial.title}</h3>
                   {activeStep === 'live' && (
                     <div className="space-y-6">
                       {renderEmbed(activeMaterial.live_link)}
                       <Button onClick={() => markStepComplete(activeMaterial.id, 'live', 'materi')} className="w-full h-16 bg-zinc-950 text-amber-500 rounded-3xl font-black italic">LANJUT KE MATERI</Button>
                     </div>
                   )}
                   {activeStep === 'materi' && (
                     <div className="space-y-6">
                        <div dangerouslySetInnerHTML={{ __html: activeMaterial.content }} className="prose italic font-medium" />
                        <Button onClick={() => markStepComplete(activeMaterial.id, 'materi', 'tugas')} className="w-full h-16 bg-emerald-500 text-white rounded-3xl font-black italic">LANJUT KE TUGAS</Button>
                     </div>
                   )}
                   {activeStep === 'tugas' && (
                     <div className="space-y-4">
                        <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Jawaban tugas..." className="w-full h-32 p-6 bg-zinc-50 rounded-3xl outline-none" />
                        <input value={taskLink} onChange={(e) => setTaskLink(e.target.value)} placeholder="Link Project" className="w-full p-5 bg-zinc-50 rounded-full" />
                        <Button onClick={handleSubmitTask} disabled={isSubmittingTask} className="w-full h-16 bg-zinc-950 text-amber-500 rounded-3xl font-black italic">KIRIM TUGAS</Button>
                     </div>
                   )}
                   {activeStep === 'feedback' && <div className="p-10 bg-zinc-50 rounded-[3rem] italic text-center">Menunggu Feedback Mentor...</div>}
                 </>
               ) : <div className="text-center py-20 italic font-black text-zinc-300 uppercase">Pilih Modul di Samping</div>}
            </div>
          </div>
        )}

        {/* SERTIFIKAT */}
        {activeMenu === "certificates" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {registrations.filter(r => r.status === 'success').map(reg => {
              const isFinished = calculateProgress(reg.course_id) === 100;
              return (
                <Card key={reg.id} className={`rounded-[2.5rem] p-10 flex flex-col items-center text-center ${isFinished ? 'bg-white' : 'opacity-40'}`}>
                  <div className="h-20 w-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6"><Award size={40}/></div>
                  <h4 className="font-black italic uppercase text-sm mb-6">{reg.course?.title}</h4>
                  <Button disabled={!isFinished || downloadingCertId === reg.id} onClick={() => handleDownloadCertificate(reg)} className="w-full h-12 bg-zinc-950 text-amber-500 rounded-xl font-black italic text-[10px]">
                    {downloadingCertId === reg.id ? <RefreshCw className="animate-spin"/> : (isFinished ? "DOWNLOAD PDF" : `PROGRESS ${calculateProgress(reg.course_id)}%`)}
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
