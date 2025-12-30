"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, Download, ChevronDown, Box, ChevronRight,
  Clock, CheckCircle2, Layout as LayoutIcon, Send
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Progres & Materi
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedStatus, setCompletedStatus] = useState<Record<number, boolean>>({}) // Materi Selesai
  const [submittedTasks, setSubmittedTasks] = useState<Record<number, string>>({})   // Tugas Terkirim
  const [feedbackStatus, setFeedbackStatus] = useState<Record<number, boolean>>({})  // Feedback Mentor

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const [resReg, resUser] = await Promise.all([
        fetch("https://backend.mejatika.com/api/registrations", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/me", { headers: { "Authorization": `Bearer ${token}` } })
      ])
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
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
                      <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-md leading-relaxed">Senang melihatmu kembali. Lanjutkan progres belajarmu hari ini.</p>
                   </div>
                   <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
                      <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><LayoutIcon size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Tersedia</p>
                      <h3 className="text-4xl font-black italic">24</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
                      <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><CheckCircle2 size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Terdaftar</p>
                      <h3 className="text-4xl font-black italic">{registrations.length}</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Clock size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Sedang Proses</p>
                      <h3 className="text-4xl font-black italic">{totalCompleted > 0 && totalCompleted < 12 ? 1 : 0}</h3>
                   </Card>
                </div>
             </div>
          )}

          {/* 2. DAFTAR KURSUS VIEW */}
          {activeMenu === "courses" && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Kursus Terdaftar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((reg) => (
                  <Card key={reg.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all">
                    <div className="h-32 bg-zinc-100 flex items-center justify-center">
                      <BookOpen size={40} className="text-zinc-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <CardContent className="p-8">
                      <h4 className="text-sm font-black uppercase italic mb-6 line-clamp-2 min-h-[3rem]">{reg.course?.title}</h4>
                      <Button onClick={() => { setExpandedCourse(reg.id); setActiveMenu("materials"); if(reg.course?.materials?.length > 0) setActiveMaterial(reg.course.materials[0]); }} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12">
                        Buka Modul <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3. MATERI KURSUS VIEW (FLOW SUDAH KEMBALI) */}
          {activeMenu === "materials" && (
            <div className="grid grid-cols-12 gap-8 animate-in fade-in">
              {/* Kolom Kiri: Sidebar Materi */}
              <div className="col-span-4 space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Materi Belajar</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <button onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)} className={`w-full p-4 rounded-2xl flex items-center justify-between ${expandedCourse === reg.id ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white shadow-sm'}`}>
                        <div className="flex items-center gap-3 text-left">
                          <Box size={18} className={expandedCourse === reg.id ? 'text-amber-500' : 'text-zinc-400'} />
                          <span className="text-[11px] font-black uppercase italic truncate w-40">{reg.course?.title}</span>
                        </div>
                        <ChevronDown size={16} className={expandedCourse === reg.id ? 'rotate-180' : ''} />
                      </button>

                      {expandedCourse === reg.id && (
                        <div className="ml-4 space-y-3">
                          {reg.course?.materials?.map((m: any, idx: number) => {
                            const isActive = activeMaterial?.id === m.id;
                            const isMateriDone = completedStatus[m.id];
                            const isTugasDone = !!submittedTasks[m.id];
                            return (
                              <div key={m.id}>
                                <button onClick={() => setActiveMaterial(m)} className={`w-full p-4 rounded-2xl text-left border-2 flex items-center gap-3 ${isActive ? 'border-amber-500 bg-white shadow-lg' : 'border-transparent bg-white shadow-sm'}`}>
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100'}`}>
                                    {idx + 1}
                                  </div>
                                  <span className="text-xs font-bold truncate">{m.title}</span>
                                </button>
                                
                                {/* FLOW INDICATOR */}
                                {isActive && (
                                  <div className="ml-8 pl-6 border-l-2 border-dashed border-amber-200 py-4 space-y-5">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${isMateriDone ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                      <span className="text-[9px] font-black uppercase italic">Materi</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${isTugasDone ? 'bg-emerald-500' : isMateriDone ? 'bg-amber-500' : 'bg-zinc-200'}`} />
                                      <span className="text-[9px] font-black uppercase italic">Latihan</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kolom Kanan: Konten Materi */}
              <div className="col-span-8 space-y-8">
                {activeMaterial ? (
                  <div className="animate-in fade-in">
                    <div className="bg-zinc-950 rounded-[2.5rem] p-6 shadow-2xl">
                       <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-black uppercase italic text-amber-500">
                          <span>{activeMaterial.title}</span>
                          <Download size={18} className="cursor-pointer" onClick={() => window.open(activeMaterial.file, "_blank")} />
                       </div>
                       {renderPreview(activeMaterial.file)}
                    </div>

                    <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white mt-6 overflow-hidden">
                      <div className="flex justify-between items-start mb-8 border-b pb-8">
                        <h3 className="text-3xl font-black italic uppercase leading-tight max-w-xl break-words">{activeMaterial.title}</h3>
                        {!completedStatus[activeMaterial.id] && (
                          <Button onClick={() => setCompletedStatus({...completedStatus, [activeMaterial.id]: true})} className="bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-10 shadow-lg shadow-emerald-500/20">
                            Selesai Materi
                          </Button>
                        )}
                      </div>
                      <div className="prose prose-zinc max-w-none break-words text-zinc-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                    </Card>

                    {/* LATIHAN (Hanya muncul jika materi selesai) */}
                    {completedStatus[activeMaterial.id] && (
                      <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border-2 border-amber-100 mt-8">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950"><FileCheck size={20} /></div>
                           <h4 className="text-xl font-black italic uppercase tracking-tight">Tugas Latihan Praktik</h4>
                        </div>
                        {submittedTasks[activeMaterial.id] ? (
                          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                            <p className="text-xs font-black uppercase italic text-emerald-700 mb-2">Jawaban Terkirim:</p>
                            <p className="text-sm text-emerald-900 break-words">{submittedTasks[activeMaterial.id]}</p>
                            <p className="text-[10px] font-black uppercase italic text-zinc-400 mt-4 italic">"Feedback: Menunggu Mentor..."</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <textarea id="taskInput" placeholder="Ketik link drive atau jawaban Anda..." className="w-full h-32 rounded-3xl p-6 bg-zinc-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none text-sm transition-all" />
                            <Button onClick={() => { const val = (document.getElementById('taskInput') as HTMLTextAreaElement).value; if(val) setSubmittedTasks({...submittedTasks, [activeMaterial.id]: val}); }} className="h-14 w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[11px] hover:bg-amber-500 hover:text-zinc-950">
                              Kirim Tugas Sekarang
                            </Button>
                          </div>
                        )}
                      </Card>
                    )}
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
              {totalCompleted < 12 ? (
                <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                   <div className="relative z-10">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                      <p className="text-amber-500 font-black uppercase text-sm tracking-widest mb-4">Progres: {totalCompleted} / 12 Materi</p>
                      <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-lg leading-relaxed">Senang melihatmu kembali. Selesaikan tantangan untuk dapatkan sertifikat.</p>
                      <Button onClick={() => setActiveMenu("materials")} className="mt-8 bg-amber-500 text-zinc-950 rounded-2xl font-black italic uppercase text-[10px] h-12 px-8">Mulai Belajar</Button>
                   </div>
                   <Award size={200} className="absolute -right-10 -bottom-10 text-white/5" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrations.map((reg) => (
                    <Card key={reg.id} className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white flex items-center justify-between border-b-4 border-emerald-500">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Award size={32} /></div>
                        <div>
                          <h4 className="font-black italic uppercase text-sm">{reg.course?.title}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">Sertifikat Tersedia</p>
                        </div>
                      </div>
                      <Button className="bg-zinc-950 text-amber-500 rounded-xl font-black italic uppercase text-[10px] h-11 px-6"><Download size={16} /></Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="ml-72 py-10 px-10 border-t border-zinc-100 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">
            <span>© {new Date().getFullYear()} Copyright</span>
            <span className="h-1 w-1 bg-zinc-200 rounded-full" />
            <span className="text-zinc-900">Mejatika.com</span>
            <span className="h-1 w-1 bg-zinc-200 rounded-full" />
            <span className="text-amber-500">Mabar Developer</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-black uppercase italic text-zinc-400 hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="text-[10px] font-black uppercase italic text-zinc-400 hover:text-zinc-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
