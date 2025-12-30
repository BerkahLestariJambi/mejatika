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
  ShieldCheck
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
  const [previewType, setPreviewType] = useState<string | null>(null)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")

    try {
      // Fetch Registrations & User Data
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 pb-24 lg:pb-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <User size={32} />
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-black uppercase tracking-widest italic">Welcome back,</p>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
                {user?.name || "Student"}
              </h2>
            </div>
          </div>
          
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("courses")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase italic transition-all ${activeTab === 'courses' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              My Courses
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase italic transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Profile
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* TAB CONTENT: COURSES */}
        {activeTab === "courses" && (
          <div className="grid gap-6">
            {registrations.length === 0 ? (
              <Card className="border-none shadow-xl rounded-[2.5rem] p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-zinc-200 mb-4" />
                <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm">Belum ada kursus yang diikuti</p>
              </Card>
            ) : (
              registrations.map((reg) => (
                <Card key={reg.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-lg">
                          <BookOpen size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 leading-none mb-1">
                            {reg.course?.title}
                          </h3>
                          <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase border-none ${
                            reg.status === 'success' || reg.status === 'aktif' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {reg.status}
                          </Badge>
                        </div>
                      </div>

                      {(reg.status === 'success' || reg.status === 'aktif') && (
                        <Button 
                          onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)}
                          className="w-full md:w-auto rounded-xl bg-zinc-900 hover:bg-zinc-800 font-bold uppercase italic text-xs h-12 px-6"
                        >
                          {expandedCourse === reg.id ? <ChevronUp className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4 text-amber-500" />}
                          {expandedCourse === reg.id ? "Tutup Materi" : "Mulai Belajar"}
                        </Button>
                      )}
                    </div>

                    {/* COLLAPSIBLE MATERIALS */}
                    {expandedCourse === reg.id && (
                      <div className="bg-zinc-50 border-t border-zinc-100 p-6 animate-in slide-in-from-top duration-300">
                        <h4 className="font-black uppercase italic text-[10px] tracking-[0.2em] text-zinc-400 mb-4">Module Content</h4>
                        <div className="grid gap-3">
                          {reg.course?.materials?.length > 0 ? (
                            reg.course.materials.map((material: any) => (
                              <div key={material.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                    <FileText size={16} />
                                  </div>
                                  <span className="font-bold text-zinc-700 text-sm">{material.title}</span>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Button 
                                    size="sm" variant="outline" 
                                    onClick={() => {
                                      setPreviewUrl(material.file_url);
                                      setPreviewType(material.file_url.split('.').pop());
                                    }}
                                    className="flex-1 sm:flex-none rounded-xl text-[10px] font-black uppercase italic h-9 px-4 border-zinc-200"
                                  >
                                    <PlayCircle size={14} className="mr-1 text-amber-500" /> Preview
                                  </Button>
                                  <a href={material.file_url} download className="h-9 w-9 bg-zinc-100 flex items-center justify-center rounded-xl hover:bg-zinc-900 hover:text-white transition-all">
                                    <Download size={14} />
                                  </a>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-zinc-400 text-xs italic py-4">Materi belum tersedia.</p>
                          )}
                        </div>

                        {/* PREVIEW FRAME */}
                        {previewUrl && (
                          <div className="mt-8 rounded-[2rem] overflow-hidden bg-zinc-900 shadow-2xl border-4 border-white">
                            <div className="bg-zinc-900 p-4 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase italic text-zinc-500 tracking-widest">Player / Viewer</span>
                              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)} className="text-zinc-400 hover:text-white hover:bg-rose-500 rounded-full h-8 w-8 p-0">
                                <X size={18} />
                              </Button>
                            </div>
                            <div className="aspect-video w-full bg-black">
                                {previewType === 'mp4' ? (
                                  <video src={previewUrl} controls className="w-full h-full" />
                                ) : previewType === 'pdf' ? (
                                  <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-[500px]" />
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                    <FileText size={48} className="mb-2 opacity-20" />
                                    <p className="text-xs uppercase font-bold italic">Preview not supported for this type</p>
                                    <a href={previewUrl} className="text-amber-500 mt-2 text-xs underline font-bold">Download File</a>
                                  </div>
                                )}
                            </div>
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

        {/* TAB CONTENT: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-zinc-900 text-white p-8">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">My Account</CardTitle>
                <CardDescription className="text-zinc-400">Informasi profil dan keamanan akun Anda.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-zinc-100">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 leading-none mb-1 tracking-widest">Full Name</p>
                      <p className="font-bold text-zinc-900">{user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-zinc-100">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 leading-none mb-1 tracking-widest">Email Address</p>
                      <p className="font-bold text-zinc-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-zinc-100">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 leading-none mb-1 tracking-widest">Account Role</p>
                      <Badge className="bg-amber-100 text-amber-700 border-none font-black uppercase italic text-[9px]">
                        {user?.role || "Peserta"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm border border-zinc-100">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 leading-none mb-1 tracking-widest">Joined Since</p>
                      <p className="font-bold text-zinc-900">{new Date(user?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleLogout}
                  variant="destructive" 
                  className="w-full h-12 rounded-xl font-black uppercase italic tracking-tighter"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out from Mejatika
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
