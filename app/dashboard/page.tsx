"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  Award, 
  LogOut, 
  User, 
  PlayCircle, 
  CheckCircle2, 
  Send, 
  Upload, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Download
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedMaterials, setCompletedMaterials] = useState<number[]>([]) 
  const [submissionText, setSubmissionText] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

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

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    router.push("/login")
  }

  const renderPreview = (url: string) => {
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/(.+?)\//)?.[1] || url.split('/d/')[1]?.split('/')[0];
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      return <iframe src={embedUrl} className="w-full h-[500px] rounded-2xl bg-black border-none" allow="autoplay" />
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full aspect-video rounded-2xl border-none" allowFullScreen />
    }
    return (
      <div className="p-10 text-center bg-zinc-100 rounded-2xl">
        <ExternalLink className="mx-auto mb-2 text-zinc-400" />
        <Button onClick={() => window.open(url, "_blank")} size="sm">Buka Materi di Tab Baru</Button>
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-zinc-400 uppercase tracking-widest">Loading...</div>

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
              onClick={() => {
                setActiveMenu(item.id);
                if(item.id !== "materials") setActiveMaterial(null);
              }}
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
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center text-amber-500">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase text-zinc-100 truncate">{user?.name}</p>
              <p className="text-[9px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px] transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">
        
        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="space-y-8">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">Welcome Back!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white border-b-4 border-amber-500">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Aktif</p>
                <h3 className="text-4xl font-black italic text-zinc-900">{registrations.length}</h3>
              </Card>
            </div>
          </div>
        )}

        {/* COURSES (3 CARDS PER ROW) */}
        {activeMenu === "courses" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <Card key={reg.id} className="group border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                  <div className="h-28 bg-zinc-100 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                    <BookOpen size={40} className="text-zinc-300 group-hover:text-amber-500/30" />
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-black uppercase italic text-zinc-900 mb-6 line-clamp-2 min-h-[3.5rem]">{reg.course?.title}</h4>
                    <Button 
                      onClick={() => { setSelectedCourse(reg.course); setActiveMenu("materials"); }} 
                      className="w-full bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 hover:bg-amber-500 hover:text-zinc-950 transition-all"
                    >
                      Buka Materi
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MATERIALS SECTION */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4 space-y-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Modul Belajar</h2>
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                {selectedCourse?.materials?.map((m: any, index: number) => (
                  <button 
                    key={m.id}
                    onClick={() => setActiveMaterial(m)}
                    className={`w-full p-5 rounded-3xl text-left transition-all border-2 flex items-center justify-between ${
                      activeMaterial?.id === m.id ? 'border-amber-500 bg-white shadow-xl shadow-amber-500/10' : 'border-transparent bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black italic shrink-0 ${activeMaterial?.id === m.id ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-100 text-zinc-400'}`}>
                        {index + 1}
                      </div>
                      <h5 className="font-bold text-zinc-900 text-sm truncate">{m.title}</h5>
                    </div>
                    {completedMaterials.includes(m.id) && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-8 space-y-6">
              {activeMaterial ? (
                <>
                  <div className="bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4 px-2">
                       <span className="text-[10px] font-black uppercase italic text-amber-500">Studying: {activeMaterial.title}</span>
                       <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => window.open(activeMaterial.file, "_blank")}>
                          <Download size={16} />
                       </Button>
                    </div>
                    {renderPreview(activeMaterial.file)}
                  </div>

                  <Card className="border-none shadow-sm rounded-[2.5rem] p-10 bg-white">
                    <div className="flex justify-between items-start gap-4 mb-8">
                      <h3 className="text-3xl font-black italic uppercase break-words leading-tight">{activeMaterial.title}</h3>
                      {!completedMaterials.includes(activeMaterial.id) && (
                        <Button 
                          onClick={() => setCompletedMaterials([...completedMaterials, activeMaterial.id])}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8 shrink-0"
                        >
                          Tandai Selesai
                        </Button>
                      )}
                    </div>
                    {/* FIXED: No multiline strings in className */}
                    <div 
                      className="prose prose-zinc max-w-none break-words overflow-hidden prose-p:text-zinc-600 prose-headings:italic prose-headings:font-black [&_img]:rounded-3xl" 
                      dangerouslySetInnerHTML={{ __html: activeMaterial.content }} 
                    />
                  </Card>
                </>
              ) : (
                <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-300">
                  <PlayCircle size={80} strokeWidth={1} className="mb-4 opacity-10" />
                  <p className="font-black italic uppercase text-xs tracking-widest">Pilih materi untuk memulai</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
