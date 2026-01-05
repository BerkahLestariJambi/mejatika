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
  FileImage
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
  
  // State upload bukti bayar
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  
  // State Navigasi Tahapan Materi & Input Tugas
  const [activeStep, setActiveStep] = useState<string>("live") 
  const [taskLink, setTaskLink] = useState("")
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  useEffect(() => {
    fetchData()
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
      
      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err) { 
      console.error("Fetch Error:", err) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran kursus ini?")) return
    setRegisteringId(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) { fetchData() }
    } catch (err) { alert("Error koneksi.") } finally { setRegisteringId(null) }
  }

  const handleUploadProof = async (regId: number) => {
    if (!selectedProof) return alert("Pilih file bukti transfer terlebih dahulu!")
    setUploadingId(regId)
    const formData = new FormData()
    formData.append("id", regId.toString())
    formData.append("proof", selectedProof)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`https://backend.mejatika.com/api/registrations/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: formData 
      })
      if (res.ok) {
        alert("Bukti bayar berhasil diupload! Tunggu verifikasi admin.")
        setSelectedProof(null)
        fetchData()
      } else {
        const err = await res.json()
        alert(err.message || "Gagal upload.")
      }
    } catch (err) { alert("Terjadi kesalahan jaringan.") } finally { setUploadingId(null) }
  }

  const handleSubmitTask = async (materialId: number) => {
    if (!taskLink) return alert("Link tugas tidak boleh kosong!")
    setIsSubmittingTask(true)
    try {
      const token = localStorage.getItem("token")
      // Asumsi endpoint update material/progress tugas
      const res = await fetch(`https://backend.mejatika.com/api/materials/${materialId}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ project_link: taskLink })
      })
      if (res.ok) {
        alert("Tugas berhasil dikirim!")
        fetchData() // Refresh untuk update icon centang
        setActiveStep("feedback")
      }
    } catch (err) { alert("Gagal mengirim tugas.") } finally { setIsSubmittingTask(false) }
  }

  const renderEmbed = (url: string) => {
    if (!url) return <div className="p-10 text-center text-zinc-400 italic">Pratinjau tidak tersedia</div>
    let embedUrl = url
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview")
    }
    return (
      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl">
        <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen />
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 animate-pulse text-2xl tracking-tighter">LOADING MEJATIKA...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
          <div className="p-8 flex items-center gap-3 font-black italic">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950">M</div>
            <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "courses", label: "Daftar Kursus", icon: BookOpen },
              { id: "materials", label: "Materi Kursus", icon: FileCheck },
              { id: "certificates", label: "Sertifikat", icon: Award },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[10px] transition-all ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-zinc-900">
             <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 font-black italic uppercase text-[10px] hover:bg-rose-500/10 rounded-2xl transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72 p-10 flex flex-col">
          
          {activeMenu === "dashboard" && (
            <div className="space-y-10">
              <div className="bg-zinc-900 rounded-[3rem] p-12 text-white">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Halo, {user?.name}!</h2>
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Selamat datang di Mejatika Dev Panel.</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Card className="p-8 rounded-[2rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400">Tersedia</p><h3 className="text-4xl font-black italic">{availableCourses.length}</h3></Card>
                <Card className="p-8 rounded-[2rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400">Terdaftar</p><h3 className="text-4xl font-black italic">{registrations.length}</h3></Card>
                <Card className="p-8 rounded-[2rem] bg-white border-b-4 border-emerald-500 shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400">Aktif</p><h3 className="text-4xl font-black italic text-emerald-600">{registrations.filter(r => r.status === 'success').length}</h3></Card>
              </div>
            </div>
          )}

          {activeMenu === "courses" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Katalog Kursus</h2>
              <div className="grid grid-cols-2 gap-8">
                {availableCourses.map((course) => {
                  const reg = registrations.find(r => r.course_id === course.id)
                  const status = reg?.status || 'NOT_ENROLLED'
                  
                  return (
                    <Card key={course.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-sm flex flex-col">
                      <div className="h-40 bg-zinc-50 flex items-center justify-center border-b border-zinc-100"><BookOpen className="text-zinc-200" size={60} /></div>
                      <CardContent className="p-10 flex-1 flex flex-col">
                        <h4 className="text-lg font-black uppercase italic mb-6 leading-tight">{course.title}</h4>
                        
                        {status === 'success' ? (
                          <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white h-14 rounded-2xl font-black italic uppercase text-[10px] hover:bg-emerald-600">Akses Terbuka <Zap size={14} className="ml-2"/></Button>
                        ) : status === 'pending' ? (
                          <div className="space-y-4 bg-amber-50 p-6 rounded-[2.5rem] border border-amber-200">
                             <div className="flex items-center gap-3 text-amber-700 font-black italic uppercase text-[10px]"><CreditCard size={18}/> Pembayaran BRI</div>
                             <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm">
                               <p className="text-[9px] text-zinc-400 font-bold uppercase">Nomor Rekening</p>
                               <p className="text-lg font-black text-zinc-900 tracking-tighter">0021-01-234567-53-1</p>
                               <p className="text-[9px] text-zinc-500 font-medium italic">A/N Mejatika Edukasi Digital</p>
                             </div>

                             <div className="space-y-3">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 rounded-[2rem] bg-amber-100/20 cursor-pointer hover:bg-amber-100/40 transition-all overflow-hidden group">
                                  {selectedProof ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <FileImage className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                                      <span className="text-[8px] font-black uppercase text-emerald-700 max-w-[150px] truncate">{selectedProof.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <UploadCloud className="text-amber-500 group-hover:animate-bounce" size={32} />
                                      <span className="text-[8px] font-black uppercase text-amber-600">Pilih Bukti Bayar</span>
                                    </div>
                                  )}
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} />
                                </label>
                                
                                <Button 
                                  onClick={() => handleUploadProof(reg.id)} 
                                  disabled={uploadingId === reg.id}
                                  className="w-full bg-zinc-950 text-amber-500 h-12 rounded-xl font-black italic uppercase text-[10px]"
                                >
                                  {uploadingId === reg.id ? <Loader2 className="animate-spin" /> : "Kirim Bukti"}
                                </Button>
                             </div>
                             
                             <div className="flex items-center gap-2 justify-center py-2">
                               <Clock size={12} className="text-amber-600" />
                               <span className="text-[8px] font-black uppercase text-amber-600 tracking-wider">Menunggu Verifikasi</span>
                             </div>
                          </div>
                        ) : (
                          <Button onClick={() => handleEnroll(course.id)} disabled={registeringId === course.id} className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic uppercase text-[10px] hover:bg-black">
                            {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Kursus Sekarang"}
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
            <div className="grid grid-cols-12 gap-8">
              {/* SIDE LIST MATERI */}
              <div className="col-span-4 space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Modul Belajar</h2>
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                  {registrations.filter(r => r.status === 'success').map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.course_id ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white shadow-sm'}`}>
                        <span className="text-[10px] font-black uppercase italic truncate">{reg.course?.title}</span>
                        <ChevronDown size={14} className={expandedCourse === reg.course_id ? 'rotate-180' : ''} />
                      </button>

                      {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                        <div key={m.id} className="ml-4 space-y-2 border-l-2 border-zinc-200 pl-4 py-2">
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{m.title}</p>
                          {[
                            { id: "live", label: "1. Live Session", icon: Video },
                            { id: "materi", label: "2. Materi Pokok", icon: MonitorPlay },
                            { id: "tugas", label: "3. Latihan & Tugas", icon: Flame },
                            { id: "feedback", label: "4. Feedback", icon: MessageSquare }
                          ].map((step) => (
                            <button 
                              key={step.id} 
                              onClick={() => { setActiveMaterial(m); setActiveStep(step.id); setTaskLink(m.project_link || ""); }} 
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-amber-100 text-amber-700' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
                            >
                              <span className="flex items-center gap-2"><step.icon size={12} /> {step.label}</span>
                              {/* Indikator Selesai Sederhana */}
                              {step.id === "tugas" && m.project_link && <CheckCircle2 size={12} className="text-emerald-500" />}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTENT VIEWER */}
              <div className="col-span-8 overflow-hidden">
                {activeMaterial ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border-none overflow-hidden">
                      <h3 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-3">
                         <span className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-zinc-950 text-xs italic">
                           {activeStep === "live" ? "1" : activeStep === "materi" ? "2" : activeStep === "tugas" ? "3" : "4"}
                         </span>
                         {activeStep === "live" ? "Live Session" : activeStep === "materi" ? "Materi Pokok" : activeStep === "tugas" ? "Tugas Praktik" : "Feedback & Evaluasi"}
                      </h3>

                      {activeStep === "live" && (
                        <div className="space-y-6">
                          {renderEmbed(activeMaterial.live_link)}
                          <Button onClick={() => setActiveStep("materi")} className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic uppercase hover:bg-black">Lanjut Ke Materi</Button>
                        </div>
                      )}

                      {activeStep === "materi" && (
                        <div className="space-y-6">
                          {renderEmbed(activeMaterial.file)}
                          <div className="prose prose-zinc max-w-full text-sm leading-relaxed p-6 bg-zinc-50 rounded-[2rem] overflow-hidden break-words" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                          <Button onClick={() => setActiveStep("tugas")} className="w-full bg-emerald-500 text-white h-14 rounded-2xl font-black italic uppercase hover:bg-emerald-600">Lanjut Ke Tugas</Button>
                        </div>
                      )}

                      {activeStep === "tugas" && (
                        <div className="space-y-6">
                           <div className="p-8 border-2 border-dashed border-zinc-200 rounded-[2rem] text-center">
                              <FileText size={40} className="mx-auto text-zinc-300 mb-4" />
                              <p className="text-xs font-bold text-zinc-500 uppercase italic">Kirim Link Project (Drive/Github/YouTube)</p>
                           </div>
                           
                           <input 
                              type="text" 
                              value={taskLink} 
                              onChange={(e) => setTaskLink(e.target.value)}
                              placeholder="Paste link tugas di sini..." 
                              className="w-full p-5 rounded-2xl bg-zinc-50 outline-none text-sm border border-transparent focus:border-amber-500 transition-all" 
                            />
                           
                           <Button 
                              onClick={() => handleSubmitTask(activeMaterial.id)} 
                              disabled={isSubmittingTask}
                              className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic uppercase"
                            >
                              {isSubmittingTask ? <Loader2 className="animate-spin" /> : "Kirim Tugas Sekarang"}
                           </Button>
                        </div>
                      )}

                      {activeStep === "feedback" && (
                        <div className="space-y-6">
                           <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100 overflow-hidden">
                             <h4 className="text-sm font-black uppercase italic text-amber-700 mb-4 flex items-center gap-2"><MessageSquare size={16}/> Feedback Mentor</h4>
                             <p className="text-xs text-zinc-600 leading-relaxed italic break-words">
                               {activeMaterial.mentor_feedback || "Belum ada feedback. Silakan hubungi mentor di Discord jika ada kendala mendesak."}
                             </p>
                           </div>
                           <div className="bg-zinc-950 p-8 rounded-[2rem] text-white">
                              <p className="text-[10px] font-bold uppercase text-amber-500 mb-1">Status Kelulusan Modul</p>
                              <p className="text-2xl font-black italic uppercase tracking-tight">{activeMaterial.project_link ? "TUGAS TERKIRIM" : "MENUNGGU TUGAS"}</p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[4rem]">
                    <PlayCircle size={80} className="mb-4 opacity-10" />
                    <p className="font-black italic uppercase text-[10px] tracking-widest opacity-40">Pilih Modul & Tahapan Belajar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "certificates" && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <Award size={100} className="text-zinc-100 mb-6" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-400">Sertifikat Belum Tersedia</h2>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-2">Selesaikan semua modul untuk klaim sertifikat digital.</p>
            </div>
          )}

          <footer className="py-10 border-t border-zinc-100 mt-auto text-center">
            <p className="text-[9px] font-black uppercase italic text-zinc-400 tracking-widest">© 2026 MEJATIKA.COM — ALL RIGHTS RESERVED</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
