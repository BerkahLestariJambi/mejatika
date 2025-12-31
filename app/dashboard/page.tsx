"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, Download, ChevronDown, Box, ChevronRight,
  Clock, CheckCircle2, Layout as LayoutIcon, PlusCircle, XCircle, AlertCircle
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Progres & Materi
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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // --- LOGIKA CEK STATUS PENDAFTARAN ---
  const getEnrollmentStatus = (courseId: number) => {
    const reg = registrations.find(r => r.course_id === courseId || r.course?.id === courseId);
    if (!reg) return "NOT_ENROLLED";
    return reg.status; // Mengembalikan 'pending', 'success', atau 'rejected'
  }

  const totalCompleted = Object.keys(completedStatus).length

  const renderPreview = (url: string) => {
    if (!url) return null;
    const isDrive = url.includes("drive.google.com");
    const embedUrl = isDrive ? url.replace("/view", "/preview").split('?')[0] : url;
    return (
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-black shadow-inner">
        <iframe src={embedUrl} className="w-full h-full border-none" allow="autoplay" />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 uppercase tracking-widest">Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
          <div className="p-8">
            <div className="flex items-center gap-3 font-black italic">
              <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950">M</div>
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
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[11px] transition-all ${
                  activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-xl shadow-amber-500/20' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
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

        <main className="flex-1 ml-72 p-10 max-w-7xl">
          
          {/* 1. DASHBOARD VIEW */}
          {activeMenu === "dashboard" && (
             <div className="space-y-10 animate-in fade-in">
                <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                   <div className="relative z-10">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                      <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-md leading-relaxed">Senang melihatmu kembali. Pilih kursusmu dan mulai mabar developer.</p>
                   </div>
                   <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-blue-500">
                      <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><LayoutIcon size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Tersedia</p>
                      <h3 className="text-4xl font-black italic">{availableCourses.length}</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-amber-500">
                      <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><CheckCircle2 size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Aktif</p>
                      <h3 className="text-4xl font-black italic">{registrations.filter(r => r.status === 'success').length}</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-emerald-500">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Clock size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Progres Belajar</p>
                      <h3 className="text-4xl font-black italic">{totalCompleted > 0 ? 1 : 0}</h3>
                   </Card>
                </div>
             </div>
          )}

          {/* 2. DAFTAR KURSUS VIEW (LOGIKA STATUS PEMBAYARAN & VERIFIKASI) */}
          {activeMenu === "courses" && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Explorasi Kursus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableCourses.map((course) => {
                  const status = getEnrollmentStatus(course.id);
                  
                  return (
                    <Card key={course.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all">
                      <div className={`h-40 flex items-center justify-center 
                        ${status === 'success' ? 'bg-emerald-50' : 
                          status === 'pending' ? 'bg-amber-50' : 
                          status === 'rejected' ? 'bg-rose-50' : 'bg-zinc-100'}`}>
                        {status === 'success' && <CheckCircle2 size={48} className="text-emerald-500" />}
                        {status === 'pending' && <Clock size={48} className="text-amber-500 animate-pulse" />}
                        {status === 'rejected' && <XCircle size={48} className="text-rose-500" />}
                        {status === 'NOT_ENROLLED' && <BookOpen size={48} className="text-zinc-300" />}
                      </div>
                      
                      <CardContent className="p-8">
                        <h4 className="text-sm font-black uppercase italic mb-8 line-clamp-2 min-h-[3rem] leading-tight">{course.title}</h4>
                        
                        {/* KONDISI TOMBOL */}
                        {status === 'success' ? (
                          <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12">
                            Buka Materi <ChevronRight size={14} className="ml-1" />
                          </Button>
                        ) : status === 'pending' ? (
                          <div className="w-full bg-amber-100 text-amber-700 rounded-2xl font-black italic uppercase text-[9px] h-12 flex flex-col items-center justify-center leading-tight px-4 text-center">
                            <span className="flex items-center gap-1"><Clock size={12}/> Menunggu Verifikasi</span>
                            <span className="opacity-70 text-[8px]">Pembayaran sedang dicek</span>
                          </div>
                        ) : status === 'rejected' ? (
                          <div className="space-y-3">
                            <div className="text-[9px] font-black text-rose-600 uppercase italic text-center flex items-center justify-center gap-1">
                              <AlertCircle size={12} /> Verifikasi Gagal / Ditolak
                            </div>
                            <Button onClick={() => window.open(`https://mejatika.com/course/${course.id}`, "_blank")} className="w-full bg-rose-600 text-white rounded-2xl font-black italic uppercase text-[10px] h-12">
                              Daftar Sekarang <PlusCircle size={14} className="ml-1" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-[9px] font-black text-zinc-400 uppercase italic text-center">
                              Anda belum melakukan pembayaran
                            </div>
                            <Button onClick={() => window.open(`https://mejatika.com/course/${course.id}`, "_blank")} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 hover:bg-amber-500 hover:text-zinc-950">
                              Daftar Sekarang <PlusCircle size={14} className="ml-1" />
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

          {/* 3. MATERI KURSUS VIEW (Hanya yang status Success) */}
          {activeMenu === "materials" && (
            <div className="grid grid-cols-12 gap-8 animate-in fade-in">
              <div className="col-span-4 space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Materi Belajar</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                  {registrations.filter(r => r.status === 'success').map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <button onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)} className={`w-full p-4 rounded-2xl flex items-center justify-between ${expandedCourse === reg.id ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white shadow-sm'}`}>
                        <span className="text-[11px] font-black uppercase italic truncate w-40 text-left">{reg.course?.title}</span>
                        <ChevronDown size={16} className={expandedCourse === reg.id ? 'rotate-180' : ''} />
                      </button>
                      {expandedCourse === reg.id && reg.course?.materials?.map((m: any, idx: number) => (
                        <div key={m.id}>
                          <button onClick={() => setActiveMaterial(m)} className={`w-full p-4 rounded-2xl text-left border-2 flex items-center gap-3 ${activeMaterial?.id === m.id ? 'border-amber-500 bg-white' : 'border-transparent bg-white shadow-sm'}`}>
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${activeMaterial?.id === m.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100'}`}>{idx+1}</div>
                            <span className="text-xs font-bold truncate">{m.title}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                  {registrations.filter(r => r.status === 'success').length === 0 && (
                    <div className="text-center py-20 opacity-30 font-black italic uppercase text-[10px]">Belum ada kursus aktif</div>
                  )}
                </div>
              </div>
              
              <div className="col-span-8">
                {activeMaterial ? (
                  <div className="animate-in fade-in space-y-6">
                    <div className="bg-zinc-950 rounded-[2.5rem] p-6 shadow-2xl">{renderPreview(activeMaterial.file)}</div>
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white">
                      <h3 className="text-3xl font-black italic uppercase mb-8 border-b pb-8">{activeMaterial.title}</h3>
                      <div className="prose prose-zinc max-w-none text-zinc-600" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                    </Card>
                  </div>
                ) : (
                  <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-300 border-4 border-dashed border-zinc-100 rounded-[4rem]">
                     <PlayCircle size={80} className="mb-6 opacity-10 animate-pulse" />
                     <p className="font-black italic uppercase text-[11px] tracking-[0.4em] opacity-40">Pilih Modul Untuk Belajar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. SERTIFIKAT VIEW */}
          {activeMenu === "certificates" && (
            <div className="space-y-10 animate-in fade-in">
                <div className="bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                   <h2 className="text-5xl font-black italic uppercase mb-4 tracking-tighter">Sertifikat</h2>
                   <p className="text-zinc-400 font-bold uppercase text-xs">Selesaikan materi untuk klaim sertifikat kursusmu.</p>
                   <Award size={200} className="absolute -right-10 -bottom-10 text-white/5" />
                </div>
            </div>
          )}
        </main>
      </div>

      <footer className="ml-72 py-10 px-10 border-t border-zinc-100 bg-white mt-auto text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">
        © {new Date().getFullYear()} Mejatika.com | Mabar Developer
      </footer>
    </div>
  )
}
