"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Download, 
  PlayCircle, 
  FileText, 
  ChevronUp, 
  User, 
  LogOut, 
  X,
  Mail,
  Calendar,
  ShieldCheck,
  ExternalLink
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"courses" | "profile">("courses")

  // State untuk Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)

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

  useEffect(() => { fetchData() }, [])

  // FUNGSI LOGIKA PREVIEW (PENTING!)
  const renderPreview = (url: string) => {
    // 1. Logika YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}`} 
          className="w-full aspect-video rounded-xl shadow-lg" 
          allowFullScreen 
        />
      );
    }

    // 2. Logika Google Drive
    if (url.includes("drive.google.com")) {
       const embedUrl = url.replace("/view", "/preview").replace("?usp=sharing", "");
       return (
        <iframe src={embedUrl} className="w-full h-[600px] rounded-xl border-none shadow-lg" allow="autoplay" />
       )
    }

    // 3. Logika PDF umum / Link Lainnya
    if (url.endsWith(".pdf")) {
      return <iframe src={`${url}#toolbar=0`} className="w-full h-[600px] rounded-xl shadow-lg" />
    }

    // Fallback: Default Viewer
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
        <ExternalLink size={40} className="text-zinc-300 mb-4" />
        <p className="text-zinc-500 font-bold italic uppercase text-xs mb-4">Preview tidak tersedia untuk link ini</p>
        <Button onClick={() => window.open(url, "_blank")} className="bg-amber-500 hover:bg-amber-600 rounded-full font-black uppercase italic text-[10px] h-10 px-8">
           Buka Sumber Luar
        </Button>
      </div>
    )
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center text-amber-500 shadow-xl">
              <User size={30} />
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest italic">Dashboard Peserta</p>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
                {user?.name || "Student"}
              </h2>
            </div>
          </div>
          
          <div className="flex bg-zinc-100 p-1 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("courses")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'courses' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              My Courses
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              Profile
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* TAB CONTENT: COURSES */}
        {activeTab === "courses" && (
          <div className="grid gap-6">
            {registrations.length === 0 ? (
              <Card className="border-none shadow-xl rounded-[2.5rem] p-16 text-center bg-white">
                <BookOpen className="mx-auto h-16 w-16 text-zinc-100 mb-6" />
                <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-xs">Anda belum memiliki kursus aktif</p>
              </Card>
            ) : (
              registrations.map((reg) => (
                <Card key={reg.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 leading-none mb-1">
                            {reg.course?.title}
                          </h3>
                          <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase border-none ${
                            reg.status === 'success' || reg.status === 'aktif' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {reg.status}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)}
                        className="w-full md:w-auto rounded-xl bg-zinc-900 hover:bg-zinc-800 font-bold uppercase italic text-[10px] h-12 px-8 transition-transform active:scale-95 shadow-lg shadow-zinc-200"
                      >
                        {expandedCourse === reg.id ? <X className="mr-2 h-4 w-4 text-rose-500" /> : <PlayCircle className="mr-2 h-4 w-4 text-amber-500" />}
                        {expandedCourse === reg.id ? "Tutup Materi" : "Buka Modul Belajar"}
                      </Button>
                    </div>

                    {/* COLLAPSIBLE MATERIALS */}
                    {expandedCourse === reg.id && (
                      <div className="bg-zinc-50/80 border-t border-zinc-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <h4 className="font-black uppercase italic text-[10px] tracking-[0.2em] text-zinc-400">Daftar Materi & Modul</h4>
                        
                        <div className="grid gap-3">
                          {reg.course?.materials?.length > 0 ? (
                            reg.course.materials.map((material: any) => (
                              <div key={material.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all hover:border-amber-200 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-zinc-100 text-zinc-400 rounded-xl flex items-center justify-center">
                                    <FileText size={18} />
                                  </div>
                                  <span className="font-bold text-zinc-800 text-sm">{material.title}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Button 
                                    size="sm" variant="outline" 
                                    onClick={() => {
                                      setPreviewUrl(material.file);
                                      setPreviewTitle(material.title);
                                      setPreviewContent(material.content);
                                    }}
                                    className="flex-1 sm:flex-none rounded-xl text-[10px] font-black uppercase italic h-10 px-5 border-zinc-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                  >
                                    <PlayCircle size={14} className="mr-2" /> Play/Preview
                                  </Button>
                                  <a href={material.file} target="_blank" className="h-10 w-10 bg-zinc-100 flex items-center justify-center rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                                    <Download size={16} />
                                  </a>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-10 text-center opacity-50 italic text-sm">Belum ada materi diunggah untuk kursus ini.</div>
                          )}
                        </div>

                        {/* PREVIEW FRAME (DIPERBAIKI) */}
                        {previewUrl && (
                          <div className="mt-8 rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-zinc-900 p-5 flex justify-between items-center text-white">
                              <div>
                                <span className="text-[10px] font-black uppercase italic text-amber-500 tracking-[0.3em] block mb-1">Learning Player</span>
                                <h5 className="font-black italic uppercase tracking-tighter text-lg">{previewTitle}</h5>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => { setPreviewUrl(null); setPreviewContent(null); }} className="text-zinc-400 hover:text-white hover:bg-rose-500 rounded-full shadow-lg transition-all">
                                <X size={20} />
                              </Button>
                            </div>
                            
                            <div className="p-4 bg-zinc-950">
                               {renderPreview(previewUrl)}
                            </div>

                            {/* TAMPILAN DESKRIPSI DARI QUILL */}
                            {previewContent && (
                               <div className="p-8 bg-white prose prose-amber max-w-none">
                                  <h6 className="text-[10px] font-black uppercase italic tracking-widest text-zinc-400 mb-4 border-b pb-2">Deskripsi Materi</h6>
                                  <div 
                                    className="text-zinc-600 leading-relaxed quill-content"
                                    dangerouslySetInnerHTML={{ __html: previewContent }} 
                                  />
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB CONTENT: PROFILE (Sama seperti sebelumnya) */}
        {activeTab === "profile" && (
           <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
             <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
               <CardHeader className="bg-zinc-900 text-white p-10 text-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik-fractal.png')]"></div>
                 <div className="relative z-10">
                   <div className="h-20 w-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-zinc-800 shadow-xl">
                      <User size={40} />
                   </div>
                   <CardTitle className="text-3xl font-black uppercase italic tracking-tighter mb-1">{user?.name}</CardTitle>
                   <CardDescription className="text-amber-500 font-bold uppercase italic text-[10px] tracking-widest">Active Member since {new Date(user?.created_at).getFullYear()}</CardDescription>
                 </div>
               </CardHeader>
               <CardContent className="p-8 space-y-4">
                  {[
                    { label: "Email Address", value: user?.email, icon: Mail },
                    { label: "Account Role", value: user?.role || "Peserta", icon: ShieldCheck, badge: true },
                    { label: "Joined Date", value: new Date(user?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 transition-all hover:bg-white hover:shadow-md">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-zinc-100">
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase italic text-zinc-400 leading-none mb-1 tracking-widest">{item.label}</p>
                        {item.badge ? (
                           <Badge className="bg-amber-100 text-amber-700 border-none font-black uppercase italic text-[9px]">{item.value}</Badge>
                        ) : (
                          <p className="font-bold text-zinc-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button onClick={handleLogout} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase italic tracking-tighter mt-6 shadow-lg shadow-rose-100 active:scale-95 transition-all">
                    <LogOut className="mr-2 h-5 w-5" /> Sign Out from Account
                  </Button>
               </CardContent>
             </Card>
           </div>
        )}
      </div>
    </div>
  )
}
