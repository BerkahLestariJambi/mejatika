"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Clock,
  LogOut,
  RefreshCw,
  UploadCloud,
  CreditCard
} from "lucide-react"

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File | null }>({})
  const router = useRouter()

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const headers = { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache"
      }
      
      const ts = new Date().getTime()
      const [resCourses, resRegis] = await Promise.all([
        fetch(`https://backend.mejatika.com/api/courses?t=${ts}`, { headers }),
        fetch(`https://backend.mejatika.com/api/registrations?t=${ts}`, { headers, cache: 'no-store' })
      ])

      const dataCourses = await resCourses.json()
      const dataRegis = await resRegis.json()

      setCourses(Array.isArray(dataCourses) ? dataCourses : (dataCourses.data || []))
      setRegistrations(Array.isArray(dataRegis) ? dataRegis : (dataRegis.data || []))
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem("user")
    if (userData) setUser(JSON.parse(userData))
    fetchData()
  }, [fetchData])

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) {
        alert("Pendaftaran berhasil! Silakan upload bukti transfer.")
        fetchData()
      }
    } catch (err) {
      alert("Gagal mendaftar")
    }
  }

  const handleUploadProof = async (regId: number, courseId: number) => {
    const file = selectedFile[courseId]
    if (!file) return alert("Pilih file bukti transfer terlebih dahulu!")

    setUploadingId(courseId)
    const formData = new FormData()
    formData.append("proof", file)
    formData.append("id", regId.toString())

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      if (res.ok) {
        alert("Bukti transfer berhasil diunggah! Mohon tunggu verifikasi admin.")
        setSelectedFile({ ...selectedFile, [courseId]: null })
        fetchData()
      } else {
        alert("Gagal mengunggah bukti.")
      }
    } catch (err) {
      alert("Error koneksi")
    } finally {
      setUploadingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-amber-500 h-6 w-6" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-xl text-zinc-900">
              MEJA<span className="text-amber-500">TIKA</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchData(); }} className="rounded-full gap-2 text-xs font-bold uppercase italic">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500"><LogOut size={20} /></Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Panel Siswa Mejatika</p>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5" />
        </section>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500 h-10 w-10" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => {
              const reg = registrations.find(r => String(r.course_id) === String(course.id))
              const status = reg?.status?.toLowerCase()
              const hasUploadedProof = reg?.proof !== null

              return (
                <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white flex flex-col">
                  <div className="h-44 bg-zinc-100 relative overflow-hidden">
                    <img src={course.thumbnail || "/placeholder.svg"} className="h-full w-full object-cover" alt="" />
                    {reg && (
                      <div className="absolute top-4 right-4">
                        <Badge className={`${status === 'success' || status === 'aktif' ? 'bg-green-600' : 'bg-amber-500'} text-white border-none px-4 py-1 rounded-full font-bold uppercase text-[10px]`}>
                          {status === 'success' || status === 'aktif' ? 'Sudah Aktif' : 'Menunggu Verifikasi'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-8 flex-grow">
                    <CardTitle className="font-black uppercase italic text-xl mb-3 tracking-tighter">{course.title}</CardTitle>
                    <div className="text-zinc-500 text-sm line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: course.description }} />
                    
                    <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                      <span className="text-lg font-black text-zinc-900">Rp {Number(course.price).toLocaleString('id-ID')}</span>
                      <Calendar className="text-amber-500 h-5 w-5" />
                    </div>

                    {/* LOGIKA TOMBOL & PEMBAYARAN */}
                    {status === 'success' || status === 'aktif' ? (
                      <Button className="w-full bg-green-600 hover:bg-zinc-900 text-white h-14 rounded-2xl font-black uppercase italic gap-2 shadow-lg shadow-green-100">
                        <CheckCircle2 size={20} /> Mulai Belajar
                      </Button>
                    ) : reg ? (
                      <div className="space-y-4">
                        {/* Instruksi Bayar jika belum upload bukti */}
                        {!hasUploadedProof ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-[11px]">
                            <p className="font-bold text-amber-800 uppercase mb-2 flex items-center gap-1">
                              <CreditCard size={14} /> Instruksi Bayar:
                            </p>
                            <div className="text-zinc-600 space-y-1">
                              <p>🏦 <b>BRI:</b> 0021-01-xxxxxx-xx</p>
                              <p>📱 <b>DANA:</b> 0812-xxxx-xxxx</p>
                              <p className="mt-2 text-red-500 italic font-bold">Transfer Rp {Number(course.price).toLocaleString('id-ID')}</p>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <input 
                                type="file" 
                                onChange={(e) => setSelectedFile({ ...selectedFile, [course.id]: e.target.files?.[0] || null })}
                                className="w-full text-[10px] file:bg-zinc-900 file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 cursor-pointer"
                              />
                              <Button 
                                onClick={() => handleUploadProof(reg.id, course.id)}
                                disabled={uploadingId === course.id}
                                className="w-full bg-amber-500 hover:bg-amber-600 h-10 rounded-xl text-[10px] font-bold"
                              >
                                {uploadingId === course.id ? <Loader2 className="animate-spin" /> : <><UploadCloud size={14} className="mr-2" /> Unggah Bukti</>}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button disabled className="w-full bg-zinc-100 text-zinc-400 h-14 rounded-2xl font-black uppercase italic gap-2 border border-zinc-200">
                            <Clock size={20} /> Menunggu Verifikasi
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleEnroll(course.id)}
                        className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase italic transition-all shadow-lg"
                      >
                        Daftar Kursus
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
