"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  User, PlayCircle, CheckCircle2, Send, Download, 
  ChevronRight, ChevronDown, ExternalLink, Box
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State untuk Kontrol Materi
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedMaterials, setCompletedMaterials] = useState<number[]>([]) 
  const [submissionText, setSubmissionText] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  // Mengambil data registrasi yang sukses
  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const [resReg, resUser] = await Promise.all([
        fetch("https://backend.mejatika.com/api/registrations", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("https://backend.mejatika.com/api/me", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      
      // Filter hanya yang statusnya sukses/aktif (sesuaikan dengan key dari API Anda)
      const regList = Array.isArray(dataReg) ? dataReg : dataReg.data || []
      setRegistrations(regList)
      setUser(dataUser)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderPreview = (url: string) => {
    if (!url) return null;
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/(.+?)\//)?.[1] || url.split('/d/')[1]?.split('/')[0];
      return <iframe src={`https://drive.google.com/file/d/${fileId}/preview`} className="w-full h-[500px] rounded-2xl bg-black border-none" />
    }
    return <iframe src={url} className="w-full h-[500px] rounded-2xl border-none" />
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400">LOADING...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      
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
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[11px] transition-all ${
                activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:bg-zinc-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900">
           <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px]">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        
        {activeMenu === "materials" && (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in">
            {/* KIRI: DAFTAR SEMUA KURSUS & MODUL */}
            <div className="col-span-4 space-y-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Materi Belajar</h2>
              
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {registrations.map((reg) => (
                  <div key={reg.id} className="space-y-3">
                    {/* Header Kursus (Accordion Style) */}
                    <button 
                      onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${expandedCourse === reg.id ? 'bg-zinc-900 text-white' : 'bg-white shadow-sm hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Box size={18} className={expandedCourse === reg.id ? 'text-amber-500' : 'text-zinc-400'} />
                        <span className="text-[11px] font-black uppercase italic truncate w-40 text-left">{reg.course?.title}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${expandedCourse === reg.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Daftar Modul di dalam Kursus tersebut */}
                    {expandedCourse === reg.id && (
                      <div className="ml-4 space-y-3 animate-in slide-in-from-top-2">
                        {reg.course?.materials?.map((m: any, idx: number) => {
                          const isActive = activeMaterial?.id === m.id;
                          return (
                            <div key={m.id}>
                              <button 
                                onClick={() => setActiveMaterial(m)}
                                className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${
                                  isActive ? 'border-amber-500 bg-white shadow-lg' : 'border-transparent bg-white shadow-sm'
                                }`}
                              >
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic ${isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 text-zinc-400'}`}>
                                  {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-zinc-800 truncate">{m.title}</span>
                              </button>

                              {/* FLOW SISTEM (Hanya tampil untuk materi yang sedang dibuka) */}
                              {isActive && (
                                <div className="ml-8 pl-6 border-l-2 border-dashed border-amber-200 py-3 space-y-4">
                                  <div className="relative flex items-center gap-3">
                                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] ${completedMaterials.includes(m.id) ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[9px] font-black uppercase italic text-zinc-900">1. Pelajari Materi</span>
                                  </div>
                                  <div className="relative flex items-center gap-3">
                                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] ${submissionText.length > 5 ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
                                    <span className="text-[9px] font-black uppercase italic text-zinc-300">2. Kerjakan Latihan</span>
                                  </div>
                                  <div className="relative flex items-center gap-3">
                                    <div className="absolute -left-[31px] w-3 h-3 rounded-full border-2 border-[#F8F9FB] bg-zinc-200" />
                                    <span className="text-[9px] font-black uppercase italic text-zinc-300">3. Feedback Mentor</span>
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

            {/* KANAN: VIEWER KONTEN */}
            <div className="col-span-8 space-y-6">
              {activeMaterial ? (
                <>
                  <div className="bg-zinc-950 rounded-[2.5rem] p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-black uppercase italic text-amber-500">
                       <span>{activeMaterial.title}</span>
                       <Download size={16} className="cursor-pointer" onClick={() => window.open(activeMaterial.file, "_blank")} />
                    </div>
                    {renderPreview(activeMaterial.file)}
                  </div>

                  <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white">
                    <div className="flex justify-between items-start mb-8">
                      <h3 className="text-3xl font-black italic uppercase leading-tight max-w-lg">{activeMaterial.title}</h3>
                      <Button 
                        onClick={() => setCompletedMaterials([...completedMaterials, activeMaterial.id])}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8"
                      >
                        Selesai Materi
                      </Button>
                    </div>
                    <div className="prose prose-zinc max-w-none prose-headings:italic prose-headings:font-black" 
                         dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                  </Card>

                  {completedMaterials.includes(activeMaterial.id) && (
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border animate-in slide-in-from-bottom-4">
                      <h4 className="text-lg font-black italic uppercase mb-4">Latihan Praktik</h4>
                      <textarea 
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Tempelkan link tugas Anda di sini..."
                        className="w-full h-32 rounded-3xl p-6 bg-zinc-50 border-none mb-4 text-sm"
                      />
                      <Button className="h-12 w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px]">Kirim Jawaban</Button>
                    </Card>
                  )}
                </>
              ) : (
                <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-200 rounded-[3rem]">
                   <PlayCircle size={60} strokeWidth={1} className="mb-4 opacity-20" />
                   <p className="font-black italic uppercase text-[10px] tracking-[0.3em]">Pilih salah satu kursus dan materi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard & Course List tetap seperti sebelumnya namun disesuaikan */}
        {activeMenu === "dashboard" && (
           <div className="space-y-8">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Dashboard</h2>
              <div className="bg-amber-500 p-10 rounded-[3rem] text-zinc-950">
                 <p className="font-black italic uppercase text-xs mb-2">Total Kursus Terdaftar</p>
                 <h3 className="text-6xl font-black italic">{registrations.length}</h3>
              </div>
           </div>
        )}

      </main>
    </div>
  )
}
