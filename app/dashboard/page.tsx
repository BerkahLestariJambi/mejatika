"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, Download, ChevronDown, Box, ChevronRight,
  Clock, CheckCircle2, Layout
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Progres
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedStatus, setCompletedStatus] = useState<Record<number, boolean>>({})

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
  const inProgressCount = registrations.filter(r => totalCompleted > 0 && totalCompleted < 12).length;

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
          <div className="p-6 border-t border-zinc-900">
             <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px]">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72 p-10 max-w-7xl pb-32">
          
          {/* VIEW: DASHBOARD */}
          {activeMenu === "dashboard" && (
             <div className="space-y-10 animate-in fade-in">
                <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                   <div className="relative z-10">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                      <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-md leading-relaxed">Senang melihatmu kembali. Lanjutkan progres belajarmu hari ini dan selesaikan tantangannya.</p>
                   </div>
                   <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20" />
                </div>

                {/* DASHBOARD CARDS STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Layout size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Tersedia</p>
                      <h3 className="text-4xl font-black italic">24</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><CheckCircle2 size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Terdaftar</p>
                      <h3 className="text-4xl font-black italic">{registrations.length}</h3>
                   </Card>
                   <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Clock size={24} /></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Sedang Proses</p>
                      <h3 className="text-4xl font-black italic">{inProgressCount > 0 ? inProgressCount : registrations.length > 0 ? 1 : 0}</h3>
                   </Card>
                </div>
             </div>
          )}

          {/* VIEW: SERTIFIKAT */}
          {activeMenu === "certificates" && (
            <div className="space-y-10 animate-in fade-in">
              {totalCompleted < 12 ? (
                <div className="relative overflow-hidden bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                  <div className="relative z-10">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Halo, {user?.name}!</h2>
                    <p className="text-amber-500 font-black uppercase text-sm tracking-widest mb-4">Progres: {totalCompleted} / 12 Materi</p>
                    <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest max-w-lg leading-relaxed">
                      Senang melihatmu kembali. Lanjutkan progres belajarmu hari ini dan selesaikan tantangannya untuk dapatkan sertifikat.
                    </p>
                    <Button onClick={() => setActiveMenu("materials")} className="mt-8 bg-amber-500 text-zinc-950 rounded-2xl font-black italic uppercase text-[10px] h-12 px-8 hover:bg-white">
                      Lanjutkan Belajar <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                  <Award size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrations.map((reg) => (
                    <Card key={reg.id} className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white flex items-center justify-between border-b-4 border-emerald-500">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Award size={32} /></div>
                        <div>
                          <h4 className="font-black italic uppercase text-sm">{reg.course?.title}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">Status: Kursus Selesai</p>
                        </div>
                      </div>
                      <Button className="bg-zinc-950 text-amber-500 rounded-xl font-black italic uppercase text-[10px] h-11 px-6"><Download size={16} /></Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: DAFTAR KURSUS & MATERI TETAP SAMA SEPERTI SEBELUMNYA */}
          {/* ... (Daftar Kursus & Materi View Disini) ... */}

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
            <a href="#" className="text-[10px] font-black uppercase italic text-zinc-400 hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
