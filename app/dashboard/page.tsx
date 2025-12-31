"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, PlusCircle, ChevronDown, Clock, 
  Send, FileText, Loader2, Circle, Flame, Target, MessageSquare,
  Video, MonitorPlay, Zap
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const materiRef = useRef<HTMLDivElement>(null)
  
  // --- STATE LAMA (DIPERTAHANKAN) ---
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  
  // --- STATE BARU (FLOW KONTROL) ---
  const [liveDone, setLiveDone] = useState<Record<number, boolean>>({}) 
  const [completedStatus, setCompletedStatus] = useState<Record<number, boolean>>({}) 
  const [submittedTasks, setSubmittedTasks] = useState<Record<number, string>>({})

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
      console.error(err) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran?")) return
    setRegisteringId(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      })
      
      if (res.ok) {
        alert("Pendaftaran Berhasil! Menunggu aktivasi admin.")
        fetchData()
      } else {
        alert("Gagal mendaftar.")
      }
    } catch (err) {
      alert("Error koneksi.")
    } finally {
      setRegisteringId(null)
    }
  }

  const getEnrollmentStatus = (courseId: number) => {
    const reg = registrations.find(r => r.course_id === courseId || r.course?.id === courseId);
    if (!reg) return "NOT_ENROLLED";
    if (reg.status === 'pending') {
      const createdAt = new Date(reg.created_at).getTime();
      const now = new Date().getTime();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      if (now - createdAt > threeDaysInMs) return "NOT_ENROLLED"; 
      return "WAITING_PAYMENT"; 
    }
    return reg.status; 
  }

  const renderEmbed = (url: string) => {
    if (!url) return null;
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview").split('?')[0];
    }
    
    return (
      <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border-4 border-zinc-900">
        <iframe 
          src={embedUrl} 
          className="w-full h-full border-none" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen 
        />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 animate-pulse uppercase tracking-[0.3em]">Mejatika Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR (TETAP SAMA) */}
        <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
          <div className="p-8">
            <div className="flex items-center gap-3 font-black italic">
              <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg">M</div>
              <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "courses", label: "Daftar Kursus", icon: BookOpen },
              { id: "materials", label: "Materi Kursus", icon: FileCheck },
              { id: "certificates", label: "Sertifikat", icon: Award },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[11px] transition-all ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-zinc-900 mt-auto">
             <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px]">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72 p-10 flex flex-col">
          <div className="flex-1">
            
            {/* DASHBOARD VIEW */}
            {activeMenu === "dashboard" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest opacity-70">Akses dashboard pembelajaran Anda.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white"><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Tersedia</p><h3 className="text-4xl font-black italic">{availableCourses.length}</h3></Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white"><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Terdaftar</p><h3 className="text-4xl font-black italic">{registrations.length}</h3></Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-emerald-500"><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Sukses</p><h3 className="text-4xl font-black italic text-emerald-600">{registrations.filter(r => r.status === 'success').length}</h3></Card>
                  </div>
              </div>
            )}

            {/* COURSES VIEW */}
            {activeMenu === "courses" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Katalog Kursus</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => {
                    const status = getEnrollmentStatus(course.id);
                    return (
                      <Card key={course.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all">
                        <div className={`h-32 flex items-center justify-center ${status === 'success' ? 'bg-emerald-50' : 'bg-zinc-50'}`}>
                          {status === 'success' ? <CheckCircle2 size={40} className="text-emerald-500" /> : <BookOpen size={40} className="text-zinc-200" />}
                        </div>
                        <CardContent className="p-8">
                          <h4 className="text-sm font-black uppercase italic mb-6 line-clamp-2 min-h-[3rem]">{course.title}</h4>
                          {status === 'success' ? (
                            <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12">Buka Materi</Button>
                          ) : (status === 'WAITING_PAYMENT' || status === 'pending') ? (
                            <Button disabled className="w-full bg-zinc-100 text-zinc-400 h-14 rounded-2xl font-black uppercase italic gap-2 text-[10px]">
                              <Clock size={16} /> Menunggu Verifikasi
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleEnroll(course.id)} 
                              disabled={registeringId === course.id}
                              className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 shadow-lg"
                            >
                              {registeringId === course.id ? <Loader2 className="animate-spin" /> : <>Daftar Sekarang <PlusCircle size={14} className="ml-2" /></>}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MATERIALS VIEW (LOGIKA BARU DIGABUNG KE SINI) */}
            {activeMenu === "materials" && (
              <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
                {/* Sidebar Materi */}
                <div className="col-span-4 space-y-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Modul Belajar</h2>
                  <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                    {registrations.filter(r => r.status === 'success').map((reg) => (
                      <div key={reg.id} className="space-y-4">
                        <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.course_id ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white shadow-sm'}`}>
                          <span className="text-[11px] font-black uppercase italic truncate text-left">{reg.course?.title}</span>
                          <ChevronDown size={16} className={expandedCourse === reg.course_id ? 'rotate-180' : ''} />
                        </button>
                        
                        {expandedCourse === reg.course_id && (
                          <div className="relative ml-6 space-y-0">
                            <div className="absolute left-[-17px] top-4 bottom-4 w-0.5 bg-zinc-200" />
                            {reg.course?.materials?.map((m: any) => (
                              <div key={m.id} className="relative pb-8 last:pb-0">
                                <button onClick={() => setActiveMaterial(m)} className={`w-full p-5 rounded-2xl text-left border-2 transition-all ${activeMaterial?.id === m.id ? 'border-amber-500 bg-white shadow-lg scale-[1.02]' : 'border-transparent bg-white shadow-sm hover:border-zinc-200'}`}>
                                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 block">Modul Aktif</span>
                                  <span className="text-xs font-bold">{m.title}</span>
                                </button>

                                {/* Stepper Visual di Sidebar */}
                                <div className="mt-4 space-y-3 ml-2">
                                  {[
                                    { label: "Live Session", icon: Video, active: !!m.live_link, done: liveDone[m.id] },
                                    { label: "Materi Pokok", icon: MonitorPlay, active: true, done: completedStatus[m.id] },
                                    { label: "Latihan & Tugas", icon: Flame, active: true, done: !!submittedTasks[m.id] }
                                  ].map((step, i) => {
                                    if (i === 0 && !step.active) return null;
                                    return (
                                      <div key={i} className="flex items-center gap-3">
                                        <div className="relative">
                                          <div className={`absolute left-[-24.5px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#F8F9FB] z-10 ${step.done ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                          <step.icon size={14} className={step.done ? 'text-emerald-500' : 'text-zinc-400'} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase italic ${step.done ? 'text-emerald-600' : 'text-zinc-500'}`}>{step.label}</span>
                                      </div>
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

                {/* Konten Utama Materi */}
                <div className="col-span-8">
                  {activeMaterial ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                      
                      {/* 1. Live Session Section */}
                      {activeMaterial.live_link && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 bg-rose-600 text-white px-5 py-2 rounded-full shadow-lg animate-pulse">
                              <Zap size={14} className="fill-white" />
                              <span className="text-[10px] font-black uppercase italic tracking-widest">Live Session</span>
                            </div>
                            {!liveDone[activeMaterial.id] && (
                                <Button onClick={() => { setLiveDone({...liveDone, [activeMaterial.id]: true}); setTimeout(() => materiRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="bg-zinc-950 text-amber-500 rounded-xl font-black uppercase text-[10px] h-10 px-6">Selesaikan Live</Button>
                            )}
                          </div>
                          {renderEmbed(activeMaterial.live_link)}
                        </div>
                      )}

                      {/* 2. Materi & Konten (Terkunci jika Live belum selesai) */}
                      <div ref={materiRef} className={`space-y-6 transition-all duration-700 ${activeMaterial.live_link && !liveDone[activeMaterial.id] ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <div className="bg-zinc-950 rounded-[3rem] p-6 shadow-2xl">
                          {renderEmbed(activeMaterial.file)}
                        </div>
                        
                        <Card className="p-10 bg-white rounded-[3rem] border-none shadow-sm">
                          <div className="flex justify-between items-start mb-8 border-b pb-8">
                            <div>
                              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Penjelasan Materi</p>
                              <h3 className="text-3xl font-black italic uppercase leading-tight max-w-xl">{activeMaterial.title}</h3>
                            </div>
                            {!completedStatus[activeMaterial.id] && (
                              <Button onClick={() => setCompletedStatus({...completedStatus, [activeMaterial.id]: true})} className="bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8">Selesaikan Tahapan</Button>
                            )}
                          </div>
                          <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                        </Card>

                        {/* 3. Tugas (Terbuka jika Materi selesai) */}
                        {completedStatus[activeMaterial.id] && (
                          <Card className="p-10 bg-white border-4 border-amber-400/20 rounded-[3.5rem] shadow-2xl">
                            <h4 className="text-2xl font-black italic uppercase mb-2">Tugas & Feedback</h4>
                            {submittedTasks[activeMaterial.id] ? (
                              <div className="p-8 bg-emerald-50 rounded-[2rem] text-sm italic font-bold text-emerald-700 border border-emerald-100 flex items-center gap-4">
                                <CheckCircle2 size={24} /> <span>Tugas Berhasil Terkirim: {submittedTasks[activeMaterial.id]}</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <textarea id="taskInput" placeholder="Masukkan Link Google Drive / Github / Link Tugas Anda..." className="w-full h-32 rounded-[2rem] p-8 bg-zinc-50 outline-none border-2 border-zinc-100 focus:border-amber-500 transition-all text-sm" />
                                <Button onClick={() => { const val = (document.getElementById('taskInput') as HTMLTextAreaElement).value; if(val) setSubmittedTasks({...submittedTasks, [activeMaterial.id]: val}); }} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black h-16 uppercase italic text-[12px]">Kirim Semua Progres <Send size={16} className="ml-2" /></Button>
                              </div>
                            )}
                          </Card>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[4rem] bg-white/50">
                       <PlayCircle size={100} className="mb-6 opacity-5 animate-pulse" />
                       <p className="font-black italic uppercase text-[12px] tracking-[0.5em] opacity-40">Pilih Modul Pembelajaran</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CERTIFICATES VIEW */}
            {activeMenu === "certificates" && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                <div className="h-40 w-40 bg-amber-50 rounded-full flex items-center justify-center mb-10 shadow-inner"><Award size={80} className="text-amber-500" /></div>
                <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Sertifikat Kelulusan</h2>
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest max-w-sm mx-auto leading-relaxed">Selesaikan seluruh flow modul (Live, Materi, & Tugas) untuk klaim sertifikat resmi Mejatika.</p>
              </div>
            )}
          </div>

          <footer className="py-10 border-t border-zinc-100 bg-white mt-20">
            <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">
              <span>© {new Date().getFullYear()} MEJATIKA.COM | MABAR DEV PANEL</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
