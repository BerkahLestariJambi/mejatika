"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  User, PlayCircle, CheckCircle2, Send, Download, 
  ChevronRight, ExternalLink 
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Utama Materi
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedMaterials, setCompletedMaterials] = useState<number[]>([]) 
  const [submissionText, setSubmissionText] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  // LOGIKA PENTING: Menangani klik dari Sidebar maupun tombol "Buka Materi"
  useEffect(() => {
    if (activeMenu === "materials") {
      // 1. Jika user belum pilih kursus lewat tombol, tapi klik menu sidebar
      if (!selectedCourse && registrations.length > 0) {
        const defaultCourse = registrations[0].course
        setSelectedCourse(defaultCourse)
        // Set materi pertama agar flow langsung muncul
        if (defaultCourse?.materials?.length > 0) {
          setActiveMaterial(defaultCourse.materials[0])
        }
      } 
      // 2. Jika user sudah pilih kursus (lewat tombol) tapi belum ada materi aktif
      else if (selectedCourse && !activeMaterial) {
        if (selectedCourse.materials?.length > 0) {
          setActiveMaterial(selectedCourse.materials[0])
        }
      }
    }
  }, [activeMenu, registrations, selectedCourse, activeMaterial])

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
      const regList = Array.isArray(dataReg) ? dataReg : dataReg.data || []
      setRegistrations(regList)
      setUser(dataUser)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); router.push("/login")
  }

  const renderPreview = (url: string) => {
    if (!url) return null;
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/(.+?)\//)?.[1] || url.split('/d/')[1]?.split('/')[0];
      return <iframe src={`https://drive.google.com/file/d/${fileId}/preview`} className="w-full h-[500px] rounded-2xl bg-black border-none" />
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full aspect-video rounded-2xl border-none" allowFullScreen />
    }
    return (
      <div className="p-10 text-center bg-zinc-100 rounded-2xl">
        <Button onClick={() => window.open(url, "_blank")} size="sm">Buka Materi di Tab Baru</Button>
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400">LOADING...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 font-black italic">M</div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Mejatika<span className="text-amber-500">.</span></h1>
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
                activeMenu === item.id ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:bg-zinc-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900">
          <div className="bg-zinc-900/50 p-4 rounded-2xl mb-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center text-amber-500"><User size={20} /></div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase text-zinc-100 truncate">{user?.name}</p>
              <p className="text-[9px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px]">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        
        {/* VIEW: DAFTAR KURSUS */}
        {activeMenu === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            {registrations.map((reg) => (
              <Card key={reg.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-all">
                <div className="h-28 bg-zinc-100 flex items-center justify-center"><BookOpen size={40} className="text-zinc-300" /></div>
                <CardContent className="p-6">
                  <h4 className="text-sm font-black uppercase italic mb-6 line-clamp-2">{reg.course?.title}</h4>
                  <Button 
                    onClick={() => { setSelectedCourse(reg.course); setActiveMaterial(null); setActiveMenu("materials"); }} 
                    className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-11"
                  >
                    Buka Materi <ChevronRight size={14} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* VIEW: MATERI (FLOW AUTOMATIC) */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in">
            {/* Sidebar Modul */}
            <div className="col-span-4 space-y-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Materi: {selectedCourse?.title}</h2>
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedCourse?.materials?.map((m: any, index: number) => {
                  const isActive = activeMaterial?.id === m.id
                  const isDone = completedMaterials.includes(m.id)
                  const hasTask = submissionText.length > 5

                  return (
                    <div key={m.id}>
                      <button 
                        onClick={() => setActiveMaterial(m)}
                        className={`w-full p-5 rounded-3xl text-left transition-all border-2 flex items-center justify-between ${
                          isActive ? 'border-amber-500 bg-white shadow-xl shadow-amber-500/10' : 'border-transparent bg-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black italic shrink-0 ${isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 text-zinc-400'}`}>
                            {index + 1}
                          </div>
                          <h5 className="font-bold text-zinc-900 text-sm truncate w-40">{m.title}</h5>
                        </div>
                        {isDone && hasTask && <CheckCircle2 className="text-emerald-500" size={20} />}
                      </button>

                      {/* FLOW INDICATOR (Langsung Muncul karena Auto-Select) */}
                      {isActive && (
                        <div className="ml-10 pl-6 border-l-2 border-dashed border-amber-200 py-3 space-y-5 animate-in slide-in-from-top-2">
                          <div className="relative flex items-center gap-3">
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-[#F8F9FB] shadow-sm ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <div className={`text-[10px] font-black uppercase italic ${isDone ? 'text-zinc-400' : 'text-zinc-900'}`}>1. Materi</div>
                          </div>
                          <div className="relative flex items-center gap-3">
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-[#F8F9FB] shadow-sm ${hasTask ? 'bg-emerald-500' : isDone ? 'bg-amber-500' : 'bg-zinc-200'}`} />
                            <div className={`text-[10px] font-black uppercase italic ${hasTask ? 'text-zinc-400' : isDone ? 'text-zinc-900' : 'text-zinc-300'}`}>2. Latihan</div>
                          </div>
                          <div className="relative flex items-center gap-3">
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-[#F8F9FB] shadow-sm ${hasTask ? 'bg-amber-500' : 'bg-zinc-200'}`} />
                            <div className={`text-[10px] font-black uppercase italic ${hasTask ? 'text-zinc-900' : 'text-zinc-300'}`}>3. Feedback</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Viewer Utama */}
            <div className="col-span-8 space-y-6">
              {activeMaterial ? (
                <>
                  <div className="bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-black uppercase italic text-amber-500">
                       <span>{activeMaterial.title}</span>
                       <Button size="sm" variant="ghost" onClick={() => window.open(activeMaterial.file, "_blank")}><Download size={16} /></Button>
                    </div>
                    {renderPreview(activeMaterial.file)}
                  </div>
                  <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white">
                    <div className="flex justify-between items-start mb-8">
                      <h3 className="text-3xl font-black italic uppercase leading-tight max-w-lg">{activeMaterial.title}</h3>
                      {!completedMaterials.includes(activeMaterial.id) && (
                        <Button onClick={() => setCompletedMaterials([...completedMaterials, activeMaterial.id])} className="bg-emerald-500 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8">Tandai Selesai</Button>
                      )}
                    </div>
                    <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                  </Card>
                  {completedMaterials.includes(activeMaterial.id) && (
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border animate-in slide-in-from-bottom-4">
                      <h4 className="text-lg font-black italic uppercase mb-6">Tugas Latihan</h4>
                      <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} placeholder="Link tugas..." className="w-full h-32 rounded-3xl p-6 bg-zinc-50 border-none mb-4 text-sm focus:ring-2 focus:ring-amber-500" />
                      <Button className="h-12 w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px]">Kirim Jawaban</Button>
                    </Card>
                  )}
                </>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-300 italic font-black uppercase text-[10px] tracking-[0.3em]">Memilih materi...</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
