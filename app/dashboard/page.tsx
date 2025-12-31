"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, Download, ChevronDown, Box, ChevronRight,
  Clock, CheckCircle2, Layout as LayoutIcon, PlusCircle
} from "lucide-center"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Progres Belajar
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
      // Ambil 3 data sekaligus: Pendaftaran user, Profil user, dan Semua Kursus di Sistem
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

  // LOGIKA STATUS: MENENTUKAN APAKAH USER SUDAH DAFTAR, PENDING, ATAU BELUM SAMA SEKALI
  const getEnrollmentStatus = (courseId: number) => {
    const reg = registrations.find(r => r.course_id === courseId || r.course?.id === courseId);
    
    if (!reg) return "NOT_ENROLLED";

    if (reg.status === 'pending') {
      const createdAt = new Date(reg.created_at).getTime();
      const now = new Date().getTime();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

      // Jika pendaftaran pending sudah lebih dari 3 hari, anggap hangus (bisa daftar lagi)
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
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-black shadow-2xl">
        <iframe src={embedUrl} className="w-full h-full border-none" allow="autoplay" />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 uppercase tracking-widest">Loading Mejatika...</div>

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
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[11px] transition-all ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-xl shadow-amber-500/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
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

        <main className="flex-1 ml-72 p-10 max-w-7xl flex flex-col">
          <div className="flex-1">
            
            {/* 1. DASHBOARD */}
            {activeMenu === "dashboard" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Selamat datang kembali di panel belajar.</p>
                    </div>
                    <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20" />
                  </div>
                  <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-amber-500 w-fit min-w-[320px]">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Kursus Aktif</p>
                    <h3 className="text-4xl font-black italic">{registrations.filter(r => r.status === 'success').length}</h3>
                  </Card>
              </div>
            )}

            {/* 2. DAFTAR KURSUS (LIS SEMUA KURSUS TERMASUK YG BELUM DAFTAR) */}
            {activeMenu === "courses" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Explorasi Kursus</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {availableCourses.map((course) => {
                    const status = getEnrollmentStatus(course.id);
                    return (
                      <Card key={course.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
                        <div className={`h-40 flex items-center justify-center ${status === 'success' ? 'bg-emerald-50' : status === 'WAITING_PAYMENT' ? 'bg-amber-50' : 'bg-zinc-100'}`}>
                          {status === 'success' ? <CheckCircle2 size={48} className="text-emerald-500" /> : <BookOpen size={48} className="text-zinc-300" />}
                        </div>
                        <CardContent className="p-8">
                          <h4 className="text-sm font-black uppercase italic mb-8 line-clamp-2 min-h-[3rem] leading-tight">{course.title}</h4>
                          
                          {status === 'success' ? (
                            <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white rounded-2xl font-black italic h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20">Buka Materi</Button>
                          ) : status === 'WAITING_PAYMENT' ? (
                            <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-center">
                              <p className="text-[9px] font-black uppercase italic leading-tight">Selesaikan pembayaran dalam waktu 3 hari</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-zinc-400 uppercase italic text-center tracking-tighter">Anda belum melakukan daftar</p>
                              <Button onClick={() => window.open(`https://mejatika.com/course/${course.id}`, "_blank")} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic h-12 hover:bg-amber-500 hover:text-zinc-950 uppercase text-[10px] transition-all">
                                Daftar Sekarang <PlusCircle size={14} className="ml-2" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. MATERI KURSUS */}
            {activeMenu === "materials" && (
              <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="col-span-4 space-y-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Modul Belajar</h2>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {registrations.filter(r => r.status === 'success').map((reg) => (
                      <div key={reg.id} className="space-y-3">
                        <button onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)} className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.id ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white shadow-sm hover:bg-zinc-50'}`}>
                          <span className="text-[11px] font-black uppercase italic truncate w-40 text-left">{reg.course?.title}</span>
                          <ChevronDown size={16} className={expandedCourse === reg.id ? 'rotate-180' : ''} />
                        </button>
                        {expandedCourse === reg.id && reg.course?.materials?.map((m: any, idx: number) => (
                          <button key={m.id} onClick={() => setActiveMaterial(m)} className={`w-full p-4 rounded-2xl text-left border-2 flex items-center gap-3 transition-all ${activeMaterial?.id === m.id ? 'border-amber-500 bg-white shadow-lg' : 'border-transparent bg-white shadow-sm'}`}>
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${activeMaterial?.id === m.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100'}`}>{idx+1}</div>
                            <span className="text-xs font-bold truncate">{m.title}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-8">
                  {activeMaterial ? (
                    <div className="space-y-6">
                      <div className="bg-zinc-950 rounded-[2.5rem] p-6 shadow-2xl">{renderPreview(activeMaterial.file)}</div>
                      <Card className="p-10 bg-white rounded-[2.5rem] border-none shadow-sm">
                        <div className="flex justify-between items-start mb-8 border-b pb-8">
                          <h3 className="text-3xl font-black italic uppercase leading-tight max-w-xl">{activeMaterial.title}</h3>
                          {!completedStatus[activeMaterial.id] && (
                            <Button onClick={() => setCompletedStatus({...completedStatus, [activeMaterial.id]: true})} className="bg-emerald-500 text-white rounded-2xl font-black h-12 px-10 uppercase italic text-[10px]">Selesai Materi</Button>
                          )}
                        </div>
                        <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                      </Card>

                      {completedStatus[activeMaterial.id] && (
                        <Card className="p-8 bg-white border-2 border-amber-100 rounded-[2.5rem] shadow-xl animate-in slide-in-from-bottom-4">
                          <h4 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2"><FileCheck className="text-amber-500" /> Tugas Latihan</h4>
                          {submittedTasks[activeMaterial.id] ? (
                            <div className="p-6 bg-emerald-50 rounded-3xl text-sm italic font-bold text-emerald-700 border border-emerald-100">Link Tugas Terkirim: {submittedTasks[activeMaterial.id]}</div>
                          ) : (
                            <div className="space-y-4">
                              <textarea id="taskInput" placeholder="Ketik link Google Drive tugas anda..." className="w-full h-32 rounded-3xl p-6 bg-zinc-50 outline-none border border-zinc-100 focus:border-amber-500 transition-all" />
                              <Button onClick={() => { const val = (document.getElementById('taskInput') as HTMLTextAreaElement).value; if(val) setSubmittedTasks({...submittedTasks, [activeMaterial.id]: val}); }} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black h-14 uppercase italic text-[11px] tracking-widest">Kirim Tugas Sekarang</Button>
                            </div>
                          )}
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 rounded-[4rem]">
                       <PlayCircle size={80} className="mb-6 opacity-10 animate-pulse" />
                       <p className="font-black italic uppercase text-[11px] tracking-[0.4em] opacity-40">Pilih Modul Belajar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. SERTIFIKAT */}
            {activeMenu === "certificates" && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="h-32 w-32 bg-amber-50 rounded-full flex items-center justify-center mb-8"><Award size={64} className="text-amber-500" /></div>
                <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Sertifikat Belum Tersedia</h2>
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest max-w-sm">Selesaikan semua modul kursus dan kumpulkan tugas untuk klaim sertifikat Anda.</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <footer className="py-10 border-t border-zinc-100 mt-20">
            <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">
              <span>© {new Date().getFullYear()} Mejatika.com | Mabar Developer Community</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-zinc-950">Terms</a>
                <a href="#" className="hover:text-zinc-950">Privacy</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
