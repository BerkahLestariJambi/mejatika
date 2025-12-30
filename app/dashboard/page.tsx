"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  X,
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

  // State Flow Materi & Latihan
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [completedMaterials, setCompletedMaterials] = useState<number[]>([]) // Simpan ID materi yang selesai
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

  // --- LOGIKA RENDER PREVIEW DRIVE/YT ---
  const renderPreview = (url: string) => {
    if (url.includes("drive.google.com")) {
      const embedUrl = url.split('/view')[0] + '/preview';
      return <iframe src={embedUrl} className="w-full h-[500px] rounded-2xl bg-black" allow="autoplay" />
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full aspect-video rounded-2xl" allowFullScreen />
    }
    return (
      <div className="p-10 text-center bg-zinc-100 rounded-2xl">
        <ExternalLink className="mx-auto mb-2 text-zinc-400" />
        <Button onClick={() => window.open(url, "_blank")} size="sm">Buka Materi di Tab Baru</Button>
      </div>
    )
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      
      {/* SIDEBAR FIXED */}
      <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 font-black italic">M</div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
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
              <p className="text-[10px] font-black uppercase text-zinc-500 truncate">{user?.name}</p>
              <p className="text-[9px] text-zinc-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black italic uppercase text-[11px] transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 p-10">
        
        {/* 1. MENU: DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">Welcome Back!</h2>
              <p className="text-zinc-400 font-medium">Lanjutkan progres belajar Anda hari ini.</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Kursus Aktif</p>
                <h3 className="text-3xl font-black italic">{registrations.length}</h3>
              </Card>
              {/* Tambahkan statistik lain di sini */}
            </div>
          </div>
        )}

        {/* 2. MENU: DAFTAR KURSUS */}
        {activeMenu === "courses" && (
          <div className="space-y-6">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter">My Enrolled Courses</h2>
             <div className="grid gap-4">
                {registrations.map((reg) => (
                  <Card key={reg.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                          <BookOpen size={30} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase italic text-zinc-900">{reg.course?.title}</h4>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none uppercase font-black italic text-[9px]">{reg.status}</Badge>
                        </div>
                      </div>
                      <Button onClick={() => { setSelectedCourse(reg.course); setActiveMenu("materials"); }} className="bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[10px] h-12 px-8">
                        Buka Materi <ChevronRight size={16} className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {/* 3. MENU: MATERI KURSUS (FLOW UTAMA) */}
        {activeMenu === "materials" && (
          <div className="grid grid-cols-12 gap-8">
            {/* List Materi Samping */}
            <div className="col-span-4 space-y-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Modul Belajar</h2>
              {selectedCourse ? (
                selectedCourse.materials?.map((m: any, index: number) => (
                  <button 
                    key={m.id}
                    onClick={() => setActiveMaterial(m)}
                    className={`w-full p-5 rounded-3xl text-left transition-all border-2 flex items-center justify-between ${
                      activeMaterial?.id === m.id ? 'border-amber-500 bg-white shadow-xl shadow-amber-500/10' : 'border-transparent bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black italic ${activeMaterial?.id === m.id ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-100 text-zinc-400'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Materi</p>
                        <h5 className="font-bold text-zinc-900 text-sm">{m.title}</h5>
                      </div>
                    </div>
                    {completedMaterials.includes(m.id) && <CheckCircle2 className="text-emerald-500" size={20} />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center bg-zinc-100 rounded-3xl italic text-zinc-400">Silakan pilih kursus terlebih dahulu di menu Daftar Kursus.</div>
              )}
            </div>

            {/* Viewer Materi & Latihan */}
            <div className="col-span-8">
              {activeMaterial ? (
                <div className="space-y-6">
                  {/* Player */}
                  <div className="bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl p-4">
                    <div className="flex justify-between items-center mb-4 px-4 pt-2">
                       <span className="text-[10px] font-black uppercase italic text-amber-500">Sekarang Belajar: {activeMaterial.title}</span>
                       <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => window.open(activeMaterial.file, "_blank")}>
                          <Download size={16} />
                       </Button>
                    </div>
                    {renderPreview(activeMaterial.file)}
                  </div>

                  {/* Deskripsi & Tombol Selesai */}
                  <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-black italic uppercase">{activeMaterial.title}</h3>
                      {!completedMaterials.includes(activeMaterial.id) && (
                        <Button 
                          onClick={() => setCompletedMaterials([...completedMaterials, activeMaterial.id])}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic uppercase text-[10px] h-12 px-8"
                        >
                          Tandai Selesai & Lanjut Latihan
                        </Button>
                      )}
                    </div>
                    <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                  </Card>

                  {/* BAGIAN LATIHAN (HANYA MUNCUL JIKA SUDAH CENTANG) */}
                  {completedMaterials.includes(activeMaterial.id) && (
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-amber-50/50 border border-amber-100 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-6 text-amber-600">
                         <FileCheck size={24} />
                         <h4 className="text-lg font-black italic uppercase">Latihan & Tugas Praktik</h4>
                      </div>
                      <div className="space-y-4">
                        <textarea 
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Tuliskan jawaban atau link tugas Anda di sini..."
                          className="w-full h-40 rounded-3xl p-6 bg-white border-none shadow-inner text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex-1 flex items-center justify-center gap-3 h-14 bg-white border-2 border-dashed border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/50 transition-all text-[11px] font-black uppercase italic text-amber-600">
                             <Upload size={18} /> Unggah Gambar Hasil (.jpg, .png)
                             <input type="file" className="hidden" />
                          </label>
                          <Button className="h-14 px-10 bg-zinc-950 text-amber-500 rounded-2xl font-black italic uppercase text-[11px] shadow-lg">
                             <Send size={18} className="mr-3" /> Kirim Jawaban
                          </Button>
                        </div>

                        {/* Feedback (Dummy) */}
                        <div className="mt-8 p-6 bg-white rounded-3xl border border-emerald-100 flex gap-4">
                           <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                              <MessageSquare size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Feedback Mentor</p>
                              <p className="text-sm italic text-zinc-600">"Tugas belum diperiksa. Harap tunggu evaluasi dari tim instruktur."</p>
                           </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                   <PlayCircle size={80} strokeWidth={1} className="mb-4 opacity-20" />
                   <p className="font-black italic uppercase text-xs tracking-widest">Pilih materi untuk memulai</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. MENU: SERTIFIKAT */}
        {activeMenu === "certificates" && (
          <div className="max-w-4xl space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">My Certificates</h2>
            <div className="grid grid-cols-2 gap-6">
               <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white opacity-50 grayscale">
                  <Award size={40} className="text-amber-500 mb-4" />
                  <h4 className="text-lg font-black italic uppercase mb-2">Sertifikat Belum Tersedia</h4>
                  <p className="text-xs text-zinc-400 font-medium">Selesaikan semua materi dan tugas untuk mendapatkan sertifikat resmi.</p>
               </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
