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

  // STATE UNTUK DOWNLOAD
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(null)

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

  // 2. Fetch Status Tugas & Feedback
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

  // --- HANDLER DOWNLOAD SERTIFIKAT ---
  const handleDownloadCertificate = async (reg: any) => {
    // Ambil certificate_number dari data pendaftaran (pastikan API sudah menyertakan 'certificate')
    const certData = reg.certificate;
    
    if (!certData) {
      alert("Sertifikat belum diterbitkan oleh Admin.");
      return;
    }

    setDownloadingCertId(reg.id);
    const token = localStorage.getItem("token");

    try {
      // Endpoint ini harus sesuai dengan route di Laravel lo
      const response = await fetch(`https://backend.mejatika.com/api/certificates/${certData.id}/download`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Gagal mengambil file sertifikat.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sertifikat-${reg.course?.title || 'Mejatika'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDownloadingCertId(null);
    }
  };

  // --- HANDLERS LAINNYA ---
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
    } catch (err) { alert("Gagal membalas") } finally { setIsSendingReply(false) }
  }

  const handleSubmitTask = async () => {
    if (!studentAnswer && !taskLink) return alert("Isi jawaban atau link tugas!")
    const currentReg = registrations.find(r => Number(r.course_id) === Number(expandedCourse))
    if (!currentReg) return alert("Pendaftaran tidak ditemukan.")
    setIsSubmittingTask(true)
    const token = localStorage.getItem("token")
    const isUpdate = submissionFeedback && submissionFeedback.id
    const url = isUpdate ? `https://backend.mejatika.com/api/submissions/${submissionFeedback.id}` : `https://backend.mejatika.com/api/submissions`
    try {
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: JSON.stringify({ material_id: activeMaterial.id, registration_id: currentReg.id, student_answer: studentAnswer, project_link: taskLink })
      })
      if (res.ok) { 
        alert(isUpdate ? "Tugas diperbarui!" : "Tugas terkirim!");
        markStepComplete(activeMaterial.id, "tugas", "feedback");
      }
    } catch (err) { console.error(err) } finally { setIsSubmittingTask(false) }
  }

  const renderEmbed = (url: string) => {
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

  const handleEnroll = async (courseId: number) => {
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
    if (!selectedProof) return alert("Pilih file bukti!")
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
      if (res.ok) { alert("Bukti terkirim!"); await fetchData(); }
    } catch (err) { alert("Gagal upload") } finally { setUploadingId(null) }
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
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "courses", label: "Katalog Kursus", icon: BookOpen },
            { id: "materials", label: "Ruang Belajar", icon: FileCheck },
            { id: "certificates", label: "Sertifikat", icon: Award },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
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
      <main className={`flex-1 lg:ml-64 p-6 lg:p-10 flex flex-col mt-16 lg:mt-0`}>
        {/* MOBILE HEADER */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-[60] flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">M</div>
            <span>Mejatika</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600"><Menu /></button>
        </div>

        {/* DASHBOARD */}
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

        {/* KATALOG */}
        {activeMenu === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-800">Katalog Kursus</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {availableCourses.map((course) => {
                const reg = registrations.find(r => Number(r.course_id) === Number(course.id));
                const status = reg?.status;
                return (
                  <Card key={course.id} className="rounded-[2.5rem] overflow-hidden bg-white border-none shadow-sm flex flex-col hover:shadow-xl transition-all">
                    <div className="h-48 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <BookOpen className="text-slate-200" size={60} />
                      {(status === 'success' || status === 'aktif') && <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-full"><CheckCircle2 size={20}/></div>}
                    </div>
                    <CardContent className="p-10 flex-1 flex flex-col">
                      <h4 className="text-2xl font-bold text-slate-800 mb-6">{course.title}</h4>
                      {(status === 'success' || status === 'aktif') ? (
                        <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-bold">Buka Modul</Button>
                      ) : status === 'pending' ? (
                        <div className="space-y-4 bg-indigo-50 p-6 rounded-3xl">
                           <div className="text-indigo-700 font-bold text-sm mb-2">BRI: 0021-01-234567-53-1</div>
                           <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 rounded-2xl bg-white cursor-pointer hover:bg-indigo-100 transition-colors">
                             {selectedProof ? <span className="text-xs font-bold text-emerald-600">{selectedProof.name}</span> : <UploadCloud className="text-indigo-300" size={24} />}
                             <input type="file" className="hidden" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} />
                           </label>
                           <Button onClick={() => handleUploadProof(reg.id)} disabled={uploadingId === reg.id} className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold">Konfirmasi Bayar</Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleEnroll(course.id)} disabled={registeringId === course.id} className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold">Daftar Sekarang</Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* RUANG BELAJAR */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Ruang Belajar</h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {registrations.filter(r => r.status === 'success' || r.status === 'aktif').map((reg) => (
                  <div key={reg.id} className="space-y-3">
                    <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.course_id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100'}`}>
                      <span className="text-sm font-bold truncate pr-4">{reg.course?.title}</span>
                      <ChevronDown size={18} className={`${expandedCourse === reg.course_id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                      <div key={m.id} className="ml-4 pl-4 border-l-2 border-slate-200 space-y-2">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{m.title}</p>
                        {[{ id: "live", label: "Live Session", icon: Video }, { id: "materi", label: "Materi Pokok", icon: MonitorPlay }, { id: "tugas", label: "Tugas Praktik", icon: Flame }, { id: "feedback", label: "Feedback", icon: MessageSquare }].map((step) => {
                          const locked = isStepLocked(m.id, step.id); const done = courseProgress[m.id]?.[step.id];
                          return (
                            <button key={step.id} disabled={locked} onClick={() => { setActiveMaterial(m); setActiveStep(step.id); }} className={`w-full flex items-center justify-between p-3 rounded-xl text-[11px] font-bold transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-white'} ${locked ? 'opacity-30 cursor-not-allowed' : ''}`}>
                              <span className="flex items-center gap-2">{locked ? <Lock size={14} /> : <step.icon size={14} />} {step.label}</span>
                              {done && <CheckCircle2 size={14} className="text-emerald-500" />}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {activeMaterial ? (
                <div className="bg-white p-6 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center border-b pb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-4">
                      <span className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm">
                        {activeStep === "live" ? "01" : activeStep === "materi" ? "02" : activeStep === "tugas" ? "03" : "04"}
                      </span>
                      {activeStep.toUpperCase()}
                    </h3>
                  </div>

                  {activeStep === "live" && (
                    <div className="space-y-8">
                      {renderEmbed(activeMaterial.live_link)}
                      <Button onClick={() => markStepComplete(activeMaterial.id, "live", "materi")} className="w-full bg-slate-900 text-white h-16 rounded-3xl font-bold">Tandai Selesai Nonton</Button>
                    </div>
                  )}

                  {activeStep === "materi" && (
                    <div className="space-y-8">
                      {renderEmbed(activeMaterial.file)}
                      <div className="bg-slate-50 rounded-3xl p-6 lg:p-8 border border-slate-100 max-w-full overflow-hidden">
                        <div 
                          className="prose prose-indigo max-w-full prose-img:rounded-2xl prose-img:mx-auto break-words overflow-x-auto" 
                          dangerouslySetInnerHTML={{ __html: activeMaterial.content }} 
                        />
                      </div>
                      <Button onClick={() => markStepComplete(activeMaterial.id, "materi", "tugas")} className="w-full bg-indigo-600 text-white h-16 rounded-3xl font-bold">Lanjut Ke Tugas</Button>
                    </div>
                  )}

                  {activeStep === "tugas" && (
                    <div className="space-y-6">
                       <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                          <h4 className="text-xs font-bold text-indigo-700 mb-3 uppercase tracking-widest flex items-center gap-2"><Flame size={16}/> Instruksi Tugas:</h4>
                          <div className="text-sm text-slate-700 leading-relaxed font-medium">{activeMaterial.quiz_task || "Sesuai arahan mentor."}</div>
                       </div>
                       <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Tulis jawaban..." className="w-full h-40 p-6 rounded-3xl bg-slate-50 border outline-none text-sm" />
                       <input type="text" value={taskLink} onChange={(e) => setTaskLink(e.target.value)} placeholder="URL Project Link" className="w-full p-5 rounded-2xl bg-slate-50 border text-sm" />
                       <Button onClick={handleSubmitTask} disabled={isSubmittingTask} className="w-full h-16 bg-slate-900 text-white rounded-3xl font-bold">
                         {isSubmittingTask ? <Loader2 className="animate-spin" /> : (submissionFeedback ? "Update Jawaban" : "Kirim Jawaban")}
                       </Button>
                    </div>
                  )}

                  {activeStep === "feedback" && (
                    <div className="space-y-6">
                       {submissionFeedback ? (
                         <div className="space-y-6">
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4"><UserCircle2 size={30}/><h4 className="text-xl font-bold">Mentor Review</h4></div>
                                  <div className="bg-slate-800 px-6 py-3 rounded-2xl text-3xl font-bold text-indigo-400">{submissionFeedback.score || "—"}</div>
                               </div>
                               <div className="p-6 bg-slate-800/50 rounded-2xl italic text-slate-300 text-sm border border-slate-700">"{submissionFeedback.mentor_feedback || "Menunggu review..."}"</div>
                            </div>
                            <div className="bg-slate-100/50 p-6 rounded-3xl space-y-4">
                               {submissionFeedback.student_reply && <div className="bg-indigo-600 text-white p-4 rounded-2xl ml-auto w-fit text-sm">{submissionFeedback.student_reply}</div>}
                               {!submissionFeedback.student_reply && (
                                 <div className="relative">
                                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Tanya mentor..." className="w-full p-5 pr-14 bg-white border rounded-3xl text-sm" />
                                    <button onClick={handleSendReply} className="absolute bottom-4 right-4 h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center"><Send size={16}/></button>
                                 </div>
                               )}
                            </div>
                         </div>
                       ) : (
                         <div className="bg-emerald-50 p-12 rounded-[2.5rem] text-center border border-emerald-100 text-emerald-800 font-bold">Tugas Terkirim! Mohon tunggu review.</div>
                       )}
                       <Button onClick={() => markStepComplete(activeMaterial.id, "feedback", null)} className="w-full bg-slate-900 text-white h-16 rounded-3xl font-bold">Selesaikan Modul</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-200 border-4 border-dashed rounded-[3rem] bg-white"><PlayCircle size={80} className="opacity-10 mb-4" /><p className="font-bold uppercase text-xs tracking-widest opacity-40">Pilih Modul Belajar</p></div>
              )}
            </div>
          </div>
        )}

        {/* SERTIFIKAT */}
        {activeMenu === "certificates" && (
          <div className="space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-bold text-slate-800">E-Sertifikat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {registrations
                .filter(r => r.status === 'success' || r.status === 'aktif')
                .map(reg => {
                  const progress = calculateProgress(reg.course_id);
                  const isFinished = progress === 100;
                  // Logika Sertifikat: Muncul jika DATA SERTIFIKAT ada dari Backend
                  const hasCertificate = reg.certificate !== null;
                  const isDownloading = downloadingCertId === reg.id;

                  return (
                    <Card key={reg.id} className={`rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-sm border-none bg-white`}>
                      <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${hasCertificate ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-300'}`}>
                        <Award size={48} />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2">{reg.course?.title}</h4>
                      
                      {/* Status Badge */}
                      <div className="mb-8">
                        {hasCertificate ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Tersedia
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-wider">
                             Progress: {progress}%
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        disabled={!hasCertificate || isDownloading} 
                        onClick={() => handleDownloadCertificate(reg)}
                        className={`w-full h-12 rounded-2xl font-bold text-xs transition-all ${hasCertificate ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-slate-200 text-slate-500'}`}
                      >
                        {isDownloading ? (
                          <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : hasCertificate ? (
                          <><FileText className="mr-2 h-4 w-4" /> Download Sertifikat</>
                        ) : (
                          "Belum Terbit"
                        )}
                      </Button>
                    </Card>
                  );
                })}
              {registrations.filter(r => r.status === 'success' || r.status === 'aktif').length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white rounded-[2.5rem] border-2 border-dashed">
                   Anda belum memiliki kursus yang aktif.
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="py-12 border-t mt-auto text-center"><p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">© 2026 MEJATIKA LMS — PLATFORM BELAJAR MODERN</p></footer>
      </main>
    </div>
  )
}
