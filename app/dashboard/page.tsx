"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  User, PlayCircle, CheckCircle2, Send, Download, 
  ChevronDown, Box, ChevronRight 
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Materi & Progres
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  
  // State untuk melacak progres per materi
  const [completedStatus, setCompletedStatus] = useState<Record<number, boolean>>({}) // ID Materi -> Selesai
  const [submittedTasks, setSubmittedTasks] = useState<Record<number, string>>({})   // ID Materi -> Jawaban
  const [feedbackStatus, setFeedbackStatus] = useState<Record<number, boolean>>({})  // ID Materi -> Ada Feedback

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

  // Fungsi navigasi otomatis dari daftar kursus
  const handleStartCourse = (reg: any) => {
    setExpandedCourse(reg.id)
    setActiveMenu("materials")
    if (reg.course?.materials?.length > 0) {
      setActiveMaterial(reg.course.materials[0])
    }
  }

  const renderPreview = (url: string) => {
    if (!url) return null;
    const isDrive = url.includes("drive.google.com");
    const embedUrl = isDrive ? url.replace("/view", "/preview").replace("?usp=sharing", "") : url;
    return (
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-black shadow-inner">
        <iframe src={embedUrl} className="w-full h-full border-none" allow="autoplay" />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 uppercase tracking-widest">Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 font-black italic">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">M</div>
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[11px] transition-all duration-300 ${
                activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-xl shadow-amber-500/20 scale-[1.02]' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900">
           <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px] transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 max-w-7xl">
        
        {/* VIEW: DAFTAR KURSUS */}
        {activeMenu === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Kursus Terdaftar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <Card key={reg.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500">
                  <div className="h-32 bg-zinc-100 flex items-center justify-center group-hover:bg-amber-50">
                    <BookOpen size={40} className="text-zinc-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <CardContent className="p-8">
                    <h4 className="text-sm font-black uppercase italic mb-6 line-clamp-2 min-h-[3rem] leading-snug">{reg.course?.title}</h4>
                    <Button onClick={() => handleStartCourse(reg)} className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 hover:bg-amber-500 hover:text-zinc-950 transition-all">
                      Buka Modul <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MATERI KURSUS */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* KIRI: DAFTAR MODUL */}
            <div className="col-span-4 space-y-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Materi Belajar</h2>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {registrations.map((reg) => (
                  <div key={reg.id} className="space-y-3">
                    <button 
                      onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.id ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white shadow-sm hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Box size={18} className={expandedCourse === reg.id ? 'text-amber-500' : 'text-zinc-400'} />
                        <span className="text-[11px] font-black uppercase italic truncate w-40">{reg.course?.title}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${expandedCourse === reg.id ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedCourse === reg.id && (
                      <div className="ml-4 space-y-3 animate-in slide-in-from-top-2">
                        {reg.course?.materials?.map((m: any, idx: number) => {
                          const isActive = activeMaterial?.id === m.id;
                          const isMateriDone = completedStatus[m.id];
                          const isTugasDone = !!submittedTasks[m.id];
                          const isFeedbackDone = feedbackStatus[m.id];

                          return (
                            <div key={m.id}>
                              <button 
                                onClick={() => setActiveMaterial(m)}
                                className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${
                                  isActive ? 'border-amber-500 bg-white shadow-lg' : 'border-transparent bg-white shadow-sm hover:border-zinc-200'
                                }`}
                              >
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 text-zinc-400'}`}>
                                  {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-zinc-800 truncate">{m.title}</span>
                              </button>

                              {/* FLOW SISTEM OTOMATIS */}
                              {isActive && (
                                <div className="ml-8 pl-6 border-l-2 border-dashed border-amber-200 py-4 space-y-5 animate-in slide-in-from-left-2">
                                  <div className="relative flex items-center gap-3">
                                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] transition-colors ${isMateriDone ? 'bg-emerald-500' : 'bg-amber-500 ring-4 ring-amber-500/20'}`} />
                                    <span className={`text-[9px] font-black uppercase italic ${isMateriDone ? 'text-emerald-600' : 'text-zinc-900'}`}>1. Materi Pelajaran</span>
                                  </div>
                                  <div className="relative flex items-center gap-3">
                                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] transition-colors ${isTugasDone ? 'bg-emerald-500' : isMateriDone ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-zinc-200'}`} />
                                    <span className={`text-[9px] font-black uppercase italic ${isTugasDone ? 'text-emerald-600' : isMateriDone ? 'text-zinc-900' : 'text-zinc-300'}`}>2. Latihan Praktik</span>
                                  </div>
                                  <div className="relative flex items-center gap-3">
                                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] transition-colors ${isFeedbackDone ? 'bg-emerald-500' : isTugasDone ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-zinc-200'}`} />
                                    <span className={`text-[9px] font-black uppercase italic ${isFeedbackDone ? 'text-emerald-600' : isTugasDone ? 'text-zinc-900' : 'text-zinc-300'}`}>3. Feedback Mentor</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* KANAN: VIEWER KONTEN (PENYELESAIAN LAYOUT) */}
            <div className="col-span-8 space-y-8">
              {activeMaterial ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  {/* Player Frame */}
                  <div className="bg-zinc-950 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-black uppercase italic text-amber-500 tracking-wider">
                       <span>{activeMaterial.title}</span>
                       <Download size={18} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => window.open(activeMaterial.file, "_blank")} />
                    </div>
                    {renderPreview(activeMaterial.file)}
                  </div>

                  {/* Deskripsi Materi (DIPERBAIKI AGAR TIDAK KELUAR FRAME) */}
                  <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white mt-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-zinc-50">
                      <h3 className="text-3xl font-black italic uppercase leading-tight max-w-xl break-words">{activeMaterial.title}</h3>
                      {!completedStatus[activeMaterial.id] && (
                        <Button 
                          onClick={() => setCompletedStatus({...completedStatus, [activeMaterial.id]: true})}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-10 shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                          Selesai Materi
                        </Button>
                      )}
                    </div>
                    
                    {/* Area Teks Deskripsi - break-words untuk mencegah teks keluar frame */}
                    <div className="prose prose-zinc max-w-none break-words overflow-hidden text-zinc-600 leading-relaxed font-medium
                      prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:text-zinc-900
                      prose-img:rounded-[2rem] prose-img:shadow-xl prose-a:text-amber-600">
                      <div dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                    </div>
                  </Card>

                  {/* AREA LATIHAN (Terbuka setelah Selesai Materi) */}
                  {completedStatus[activeMaterial.id] && (
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border-2 border-amber-100 mt-8 animate-in slide-in-from-bottom-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20"><FileCheck size={20} /></div>
                        <h4 className="text-xl font-black italic uppercase tracking-tight">Tugas Latihan Praktik</h4>
                      </div>
                      
                      {submittedTasks[activeMaterial.id] ? (
                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                          <p className="text-xs font-black uppercase italic text-emerald-700 mb-2">Jawaban Terkirim:</p>
                          <p className="text-sm text-emerald-900 break-words">{submittedTasks[activeMaterial.id]}</p>
                          <div className="mt-6 p-4 bg-white rounded-2xl border border-emerald-200">
                            <p className="text-[10px] font-black uppercase italic text-zinc-400">Status Feedback:</p>
                            <p className="text-sm italic font-bold text-zinc-600 mt-1">"Sedang direview oleh mentor. Mohon tunggu..."</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <textarea 
                            onChange={(e) => (window as any).currentTaskValue = e.target.value}
                            placeholder="Tuliskan link Google Drive/GitHub atau jawaban teks Anda di sini..."
                            className="w-full h-32 rounded-3xl p-6 bg-zinc-50 border-2 border-transparent focus:border-amber-500 focus:bg-white transition-all outline-none text-sm"
                          />
                          <Button 
                            onClick={() => {
                              const val = (window as any).currentTaskValue;
                              if(val) setSubmittedTasks({...submittedTasks, [activeMaterial.id]: val});
                            }}
                            className="h-14 w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[11px] hover:bg-amber-500 hover:text-zinc-950 shadow-xl"
                          >
                            Kirim Tugas Sekarang
                          </Button>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-300 border-4 border-dashed border-zinc-100 rounded-[4rem]">
                   <PlayCircle size={80} strokeWidth={1} className="mb-6 opacity-10 animate-pulse" />
                   <p className="font-black italic uppercase text-[11px] tracking-[0.4em] opacity-40">Pilih Modul Untuk Belajar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD & SERTIFIKAT (Simple & Clean) */}
        {activeMenu === "dashboard" && (
           <div className="space-y-10 animate-in fade-in zoom-in-95">
              <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                 <div className="relative z-10">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                    <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-md leading-relaxed">Senang melihatmu kembali. Lanjutkan progres belajarmu hari ini dan selesaikan tantangannya.</p>
                 </div>
                 <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-4 border-amber-500">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Kursus</p>
                    <h3 className="text-5xl font-black italic">{registrations.length}</h3>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  )
}
