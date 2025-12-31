"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, PlusCircle, ChevronDown, Clock, 
  ShieldCheck, Send, FileText, ExternalLink
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Flow Materi
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
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

  const renderPreview = (url: string) => {
    if (!url) return null;
    const isDrive = url.includes("drive.google.com");
    const embedUrl = isDrive ? url.replace("/view", "/preview").split('?')[0] : url;
    return (
      <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden bg-black shadow-2xl">
        <iframe src={embedUrl} className="w-full h-full border-none" allow="autoplay" />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 animate-pulse uppercase tracking-[0.3em]">Mejatika Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
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
            
            {/* 1. DASHBOARD */}
            {activeMenu === "dashboard" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest opacity-70">Kelola pembelajaranmu dalam satu dashboard.</p>
                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white group hover:bg-zinc-950 transition-all duration-300">
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 group-hover:text-amber-500">Tersedia di Sistem</p>
                      <h3 className="text-4xl font-black italic group-hover:text-white">{availableCourses.length}</h3>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white group hover:bg-zinc-950 transition-all duration-300">
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 group-hover:text-amber-500">Total Pendaftaran</p>
                      <h3 className="text-4xl font-black italic group-hover:text-white">{registrations.length}</h3>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-emerald-500 group hover:bg-zinc-950 transition-all duration-300">
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 group-hover:text-amber-500">Kursus Sukses</p>
                      <h3 className="text-4xl font-black italic text-emerald-600 group-hover:text-emerald-400">{registrations.filter(r => r.status === 'success').length}</h3>
                    </Card>
                  </div>
              </div>
            )}

            {/* 2. DAFTAR KURSUS */}
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
                          <h4 className="text-sm font-black uppercase italic mb-6 line-clamp-2 min-h-[3rem] leading-tight">{course.title}</h4>
                          {status === 'success' ? (
                            <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12">Buka Materi</Button>
                          ) : status === 'WAITING_PAYMENT' ? (
                            <div className="w-full bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 text-center">
                              <p className="text-[9px] font-black uppercase italic leading-tight">Silakan lakukan pembayaran dalam waktu 3 hari sebelum kedaluwarsa</p>
                            </div>
                          ) : (
                            <Button onClick={() => window.open(`https://mejatika.com/course/${course.id}`, "_blank")} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 shadow-lg hover:bg-amber-500 hover:text-zinc-950 transition-all">
                              Daftar Sekarang <PlusCircle size={14} className="ml-2" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. MATERI KURSUS (FLOW LENGKAP) */}
            {activeMenu === "materials" && (
              <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="col-span-4 space-y-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Modul Belajar</h2>
                  <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                    {registrations.filter(r => r.status === 'success').map((reg) => (
                      <div key={reg.id} className="space-y-2">
                        <button onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.id ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white shadow-sm hover:bg-zinc-50'}`}>
                          <span className="text-[11px] font-black uppercase italic truncate text-left">{reg.course?.title}</span>
                          <ChevronDown size={16} className={expandedCourse === reg.id ? 'rotate-180' : ''} />
                        </button>
                        {expandedCourse === reg.id && reg.course?.materials?.map((m: any, idx: number) => (
                          <button key={m.id} onClick={() => setActiveMaterial(m)} className={`w-full p-4 rounded-2xl text-left border-2 flex items-center gap-3 transition-all ${activeMaterial?.id === m.id ? 'border-amber-500 bg-white shadow-md' : 'border-transparent bg-white shadow-sm'}`}>
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${activeMaterial?.id === m.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100'}`}>{idx+1}</div>
                            <span className="text-xs font-bold truncate">{m.title}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {registrations.filter(r => r.status === 'success').length === 0 && (
                      <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed">
                        <p className="text-[10px] font-black uppercase text-zinc-400 italic">Belum ada kursus aktif</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-8">
                  {activeMaterial ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                      <div className="bg-zinc-950 rounded-[3rem] p-6 shadow-2xl">{renderPreview(activeMaterial.file)}</div>
                      <Card className="p-10 bg-white rounded-[3rem] border-none shadow-sm">
                        <div className="flex justify-between items-start mb-8 border-b pb-8">
                          <h3 className="text-3xl font-black italic uppercase leading-tight max-w-xl">{activeMaterial.title}</h3>
                          {!completedStatus[activeMaterial.id] && (
                            <Button onClick={() => setCompletedStatus({...completedStatus, [activeMaterial.id]: true})} className="bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8 shadow-lg shadow-emerald-500/20">Selesai Materi</Button>
                          )}
                        </div>
                        <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                      </Card>

                      {completedStatus[activeMaterial.id] && (
                        <Card className="p-8 bg-white border-2 border-amber-100 rounded-[3rem] shadow-xl">
                          <h4 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2"><FileText className="text-amber-500" /> Tugas Latihan</h4>
                          {submittedTasks[activeMaterial.id] ? (
                            <div className="p-6 bg-emerald-50 rounded-3xl text-sm italic font-bold text-emerald-700 border border-emerald-100 flex items-center justify-between">
                              <span>Tugas Terkirim: {submittedTasks[activeMaterial.id]}</span>
                              <CheckCircle2 size={20} />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <textarea id="taskInput" placeholder="Tempel link Google Drive tugas Anda di sini..." className="w-full h-32 rounded-3xl p-6 bg-zinc-50 outline-none border border-zinc-100 focus:border-amber-500 transition-all text-sm" />
                              <Button onClick={() => { const val = (document.getElementById('taskInput') as HTMLTextAreaElement).value; if(val) setSubmittedTasks({...submittedTasks, [activeMaterial.id]: val}); }} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black h-14 uppercase italic text-[11px] tracking-widest hover:bg-amber-500 hover:text-zinc-950 transition-all">
                                Kirim Tugas Sekarang <Send size={14} className="ml-2" />
                              </Button>
                            </div>
                          )}
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[4rem]">
                       <PlayCircle size={100} className="mb-6 opacity-5 animate-pulse" />
                       <p className="font-black italic uppercase text-[12px] tracking-[0.5em] opacity-40">Pilih Modul Untuk Memulai</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. SERTIFIKAT */}
            {activeMenu === "certificates" && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                <div className="h-40 w-40 bg-amber-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
                  <Award size={80} className="text-amber-500" />
                </div>
                <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Sertifikat Digital</h2>
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest max-w-sm mx-auto leading-relaxed">
                  Selesaikan seluruh materi dan tugas di kursus Anda untuk membuka akses sertifikat resmi Mejatika.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <footer className="py-10 border-t border-zinc-100 bg-white mt-20">
            <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">
              <span>© {new Date().getFullYear()} MEJATIKA.COM | MABAR DEV PANEL</span>
              <div className="flex gap-8">
                <a href="#" className="hover:text-zinc-950 transition-colors">Syarat & Ketentuan</a>
                <a href="#" className="hover:text-zinc-950 transition-colors">Bantuan</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
