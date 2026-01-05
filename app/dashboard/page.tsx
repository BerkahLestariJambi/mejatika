"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, ChevronDown, Clock, 
  FileText, Loader2, Flame, MessageSquare, 
  Video, MonitorPlay, Zap, Lock, CreditCard, UploadCloud,
  FileImage, AlertCircle
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
  
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [activeStep, setActiveStep] = useState<string>("live") 
  const [taskLink, setTaskLink] = useState("")

  // State Progress Belajar (Linear)
  const [courseProgress, setCourseProgress] = useState<Record<number, any>>({})

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("mejatika_progress")
    if (saved) setCourseProgress(JSON.parse(saved))
  }, [])

  const fetchData = async () => {
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

      // Pastikan data adalah array
      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err) { 
      console.error("Fetch Error:", err) 
    } finally { 
      setLoading(false) 
    }
  }

  // --- LOGIKA PROGRESS LINEAR ---
  const markStepComplete = (materialId: number, currentStep: string, nextStep: string | null) => {
    const newProgress = {
      ...courseProgress,
      [materialId]: { ...(courseProgress[materialId] || {}), [currentStep]: true }
    }
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

  // --- LOGIKA DAFTAR & UPLOAD ---
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
      if (res.ok) await fetchData() // Refresh data setelah daftar
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
      if (res.ok) {
        alert("Bukti terkirim! Admin akan memverifikasi.");
        setSelectedProof(null);
        await fetchData();
      }
    } catch (err) { alert("Gagal upload") } finally { setUploadingId(null) }
  }

  const renderEmbed = (url: string) => {
    if (!url) return <div className="p-10 text-center text-zinc-400 italic font-black uppercase text-[10px]">Konten tidak tersedia</div>
    let embedUrl = url
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview")
    }
    return (
      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border-4 border-white">
        <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen />
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 animate-pulse text-xl tracking-tighter">MEJATIKA PROCESSING...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
          <div className="p-8 flex items-center gap-3 font-black italic">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]">M</div>
            <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "courses", label: "Daftar Kursus", icon: BookOpen },
              { id: "materials", label: "Materi Kursus", icon: FileCheck },
              { id: "certificates", label: "Sertifikat", icon: Award },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[10px] transition-all duration-300 ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-lg translate-x-2' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
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
        <main className="flex-1 ml-72 p-10 flex flex-col">
          
          {activeMenu === "dashboard" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-zinc-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={200} /></div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">Woi, {user?.name?.split(' ')[0]}!</h2>
                <p className="text-amber-500 font-bold uppercase text-[11px] tracking-[0.3em]">Ready to build something great today?</p>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm hover:shadow-xl transition-shadow"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Katalog</p><h3 className="text-5xl font-black italic">{availableCourses.length}</h3></Card>
                <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm hover:shadow-xl transition-shadow"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Sedang Diikuti</p><h3 className="text-5xl font-black italic">{registrations.length}</h3></Card>
                <Card className="p-10 rounded-[2.5rem] bg-white border-b-8 border-emerald-500 shadow-sm hover:shadow-xl transition-shadow"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Kursus Aktif</p><h3 className="text-5xl font-black italic text-emerald-600">{registrations.filter(r => r.status === 'success').length}</h3></Card>
              </div>
            </div>
          )}

          {activeMenu === "courses" && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Katalog Kursus</h2>
              <div className="grid grid-cols-2 gap-10">
                {availableCourses.map((course) => {
                  // PERBAIKAN LOGIKA: Normalisasi ID ke Number agar pengecekan akurat
                  const reg = registrations.find(r => Number(r.course_id) === Number(course.id));
                  const status = reg?.status;

                  return (
                    <Card key={course.id} className="rounded-[3.5rem] overflow-hidden bg-white border-none shadow-sm flex flex-col hover:scale-[1.02] transition-transform duration-500">
                      <div className="h-52 bg-zinc-50 flex items-center justify-center border-b border-zinc-100 relative">
                        <BookOpen className="text-zinc-200" size={80} />
                        {status === 'success' && <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-full shadow-lg"><CheckCircle2 size={20}/></div>}
                      </div>
                      <CardContent className="p-12 flex-1 flex flex-col">
                        <h4 className="text-2xl font-black uppercase italic mb-8 leading-tight tracking-tighter">{course.title}</h4>
                        
                        {status === 'success' ? (
                          <Button 
                            onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} 
                            className="w-full bg-emerald-500 text-white h-16 rounded-[1.5rem] font-black italic uppercase text-[11px] hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                          >
                            Lanjutkan Belajar <Zap size={14} className="ml-2 fill-current"/>
                          </Button>
                        ) : status === 'pending' ? (
                          <div className="space-y-5 bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-100">
                             <div className="flex items-center gap-3 text-amber-700 font-black italic uppercase text-[10px] mb-2"><CreditCard size={18}/> Detail Pembayaran BRI</div>
                             <div className="p-6 bg-white rounded-2xl border border-amber-200 text-center shadow-inner">
                               <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Rekening Transfer</p>
                               <p className="text-xl font-black text-zinc-900 tracking-tighter">0021-01-234567-53-1</p>
                               <p className="text-[9px] text-zinc-500 font-medium italic">A/N Mejatika Edukasi Digital</p>
                             </div>

                             <div className="space-y-3">
                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-amber-300 rounded-[1.5rem] bg-amber-100/30 cursor-pointer hover:bg-amber-100/50 transition-all group">
                                  {selectedProof ? (
                                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">{selectedProof.name}</span>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <UploadCloud className="text-amber-500 group-hover:scale-110 transition-transform" size={28} />
                                      <span className="text-[9px] font-black uppercase text-amber-600 mt-2 tracking-widest">Klik Upload Bukti</span>
                                    </div>
                                  )}
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} />
                                </label>
                                <Button 
                                  onClick={() => handleUploadProof(reg.id)} 
                                  disabled={uploadingId === reg.id} 
                                  className="w-full bg-zinc-950 text-amber-500 h-12 rounded-[1.2rem] font-black italic uppercase text-[10px] shadow-xl"
                                >
                                  {uploadingId === reg.id ? <Loader2 className="animate-spin" /> : "Kirim Konfirmasi"}
                                </Button>
                             </div>
                             <div className="flex items-center gap-3 justify-center py-2 text-amber-600 bg-amber-200/20 rounded-xl">
                               <Clock size={14} className="animate-spin-slow" /><span className="text-[9px] font-black uppercase italic">Verifikasi Admin (Max 24 Jam)</span>
                             </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleEnroll(course.id)} 
                            disabled={registeringId === course.id} 
                            className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[1.5rem] font-black italic uppercase text-[11px] hover:bg-black shadow-xl shadow-zinc-200"
                          >
                            {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar & Amankan Slot"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeMenu === "materials" && (
            <div className="grid grid-cols-12 gap-10 animate-in fade-in duration-500">
              <div className="col-span-4 space-y-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Modul Belajar</h2>
                <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                  {registrations.filter(r => r.status === 'success').map((reg) => (
                    <div key={reg.id} className="space-y-4">
                      <button 
                        onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} 
                        className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all duration-500 ${expandedCourse === reg.course_id ? 'bg-zinc-950 text-white shadow-2xl scale-105' : 'bg-white shadow-sm hover:bg-zinc-50'}`}
                      >
                        <span className="text-[11px] font-black uppercase italic tracking-tight truncate">{reg.course?.title}</span>
                        <ChevronDown size={16} className={`transition-transform duration-500 ${expandedCourse === reg.course_id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                        <div key={m.id} className="ml-6 space-y-3 border-l-4 border-zinc-200 pl-6 py-2">
                          <p className="text-[10px] font-black text-amber-600 uppercase italic mb-2 tracking-widest">{m.title}</p>
                          {[
                            { id: "live", label: "01. Live Session", icon: Video },
                            { id: "materi", label: "02. Materi Pokok", icon: MonitorPlay },
                            { id: "tugas", label: "03. Latihan & Tugas", icon: Flame },
                            { id: "feedback", label: "04. Feedback", icon: MessageSquare }
                          ].map((step) => {
                            const locked = isStepLocked(m.id, step.id)
                            const done = courseProgress[m.id]?.[step.id]
                            return (
                              <button 
                                key={step.id} 
                                disabled={locked} 
                                onClick={() => { setActiveMaterial(m); setActiveStep(step.id); }} 
                                className={`w-full flex items-center justify-between p-4 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-amber-100 text-amber-700 shadow-md translate-x-1' : 'bg-white text-zinc-400'} ${locked ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-zinc-100 hover:text-zinc-700'}`}
                              >
                                <span className="flex items-center gap-3">{locked ? <Lock size={14} /> : <step.icon size={14} />} {step.label}</span>
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

              <div className="col-span-8">
                {activeMaterial ? (
                  <div className="bg-white p-12 rounded-[4rem] shadow-sm border-none space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-black italic uppercase flex items-center gap-4">
                        <span className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 text-sm shadow-lg">0{activeStep === "live" ? "1" : activeStep === "materi" ? "2" : activeStep === "tugas" ? "3" : "4"}</span>
                        {activeStep === "live" ? "Live Session" : activeStep === "materi" ? "Materi Pokok" : activeStep === "tugas" ? "Tugas Praktik" : "Feedback"}
                      </h3>
                      <div className="px-4 py-2 bg-zinc-100 rounded-full text-[9px] font-black uppercase text-zinc-500 italic tracking-widest">{activeMaterial.title}</div>
                    </div>

                    {activeStep === "live" && (
                      <div className="space-y-8">
                        {renderEmbed(activeMaterial.live_link)}
                        <Button onClick={() => markStepComplete(activeMaterial.id, "live", "materi")} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-[11px] shadow-2xl hover:scale-[1.01] transition-all">Tandai Selesai Menonton & Lanjut</Button>
                      </div>
                    )}

                    {activeStep === "materi" && (
                      <div className="space-y-8">
                        {renderEmbed(activeMaterial.file)}
                        <div className="prose prose-zinc max-w-full text-base leading-relaxed p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100 italic font-medium" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                        <Button onClick={() => markStepComplete(activeMaterial.id, "materi", "tugas")} className="w-full bg-emerald-500 text-white h-16 rounded-[2rem] font-black italic uppercase text-[11px] shadow-2xl">Sudah Paham, Lanjut Tugas</Button>
                      </div>
                    )}

                    {activeStep === "tugas" && (
                      <div className="space-y-8">
                         <div className="p-16 border-4 border-dashed border-zinc-100 rounded-[3.5rem] text-center bg-zinc-50/50">
                            <FileText size={60} className="mx-auto text-zinc-200 mb-6" />
                            <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest leading-loose">Kumpulkan Link Project Kamu<br/>(Github, Drive, atau Figma)</p>
                         </div>
                         <textarea 
                           value={taskLink} 
                           onChange={(e) => setTaskLink(e.target.value)} 
                           placeholder="https://..." 
                           className="w-full h-32 p-8 rounded-[2.5rem] bg-zinc-50 outline-none text-sm border-2 border-zinc-100 focus:border-amber-500 transition-colors font-mono" 
                         />
                         <Button onClick={() => { if(taskLink) markStepComplete(activeMaterial.id, "tugas", "feedback") }} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-[11px] shadow-2xl">Kirim Link Tugas</Button>
                      </div>
                    )}

                    {activeStep === "feedback" && (
                      <div className="space-y-8 text-center py-10">
                         <div className="bg-amber-50 p-12 rounded-[3.5rem] border-2 border-amber-100 relative overflow-hidden">
                           <div className="absolute -top-10 -left-10 text-amber-200 opacity-20"><MessageSquare size={150}/></div>
                           <MessageSquare className="mx-auto text-amber-500 mb-6" size={48} />
                           <h4 className="text-xl font-black uppercase italic text-amber-800 mb-4">Butuh Bantuan Mentor?</h4>
                           <p className="text-sm text-zinc-600 italic leading-relaxed max-w-md mx-auto">"Jika ada kendala pada modul ini, silakan hubungi tim mentor di grup Discord eksklusif Mejatika."</p>
                         </div>
                         <Button onClick={() => markStepComplete(activeMaterial.id, "feedback", null)} className="w-full bg-amber-500 text-zinc-950 h-16 rounded-[2rem] font-black italic uppercase text-[11px] shadow-2xl shadow-amber-200">Selesaikan Seluruh Modul</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[5rem] bg-white/50">
                    <div className="relative">
                      <PlayCircle size={100} className="opacity-5 mb-6" />
                      <div className="absolute inset-0 animate-ping opacity-5 bg-zinc-400 rounded-full"></div>
                    </div>
                    <p className="font-black italic uppercase text-[11px] tracking-[0.4em] opacity-30">Pilih Modul Untuk Mulai</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <footer className="py-12 border-t border-zinc-100 mt-auto text-center">
            <p className="text-[10px] font-black uppercase italic text-zinc-400 tracking-[0.5em]">© 2026 MEJATIKA.COM — LEVEL UP YOUR CODE</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
