"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  CheckCircle2, ChevronDown, Loader2, Flame, MessageSquare, 
  Video, MonitorPlay, Zap, Lock, UploadCloud,
  Send, Menu, Calendar, Download, Star
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([]) // State Baru untuk API Certificate
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<string>("live")
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  // 1. Fetch Data dari Backend (Termasuk Certificate Controller)
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    
    try {
      const [resReg, resUser, resAll, resCert] = await Promise.all([
        fetch("https://backend.mejatika.com/api/registrations", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/me", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/courses", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/certificates", { headers: { "Authorization": `Bearer ${token}` } }) // Endpoint PHP kamu
      ])

      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()
      const dataCert = await resCert.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
      setCertificates(Array.isArray(dataCert) ? dataCert : dataCert.data || [])
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- RENDER HALAMAN SERTIFIKAT (MENGGUNAKAN DATA CONTROLLER PHP) ---
  const renderCertificatesPage = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sertifikat Saya</h1>
          <p className="text-slate-500">Daftar sertifikat resmi yang telah diterbitkan oleh Mejatika.</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-2">
          <Award className="text-indigo-600" size={20} />
          <span className="text-sm font-bold text-indigo-700">{certificates.length} Sertifikat Terbit</span>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-bold">Semua Sertifikat</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 p-6 md:flex-row md:items-center md:justify-between hover:bg-slate-50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <h3 className="font-bold text-slate-800">{cert.user?.name || user?.name}</h3>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 uppercase text-[10px]">Issued</Badge>
                    </div>
                    <p className="text-sm font-semibold text-indigo-600">{cert.course?.title || "Course Name"}</p>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Diterbitkan: {new Date(cert.issued_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <span>•</span>
                      <span>No: {cert.certificate_number}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 hover:text-indigo-600">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button className="h-11 rounded-xl font-bold bg-slate-900 text-white px-6">
                      Lihat
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Award className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Belum ada sertifikat yang diterbitkan.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] text-white flex items-center gap-6">
        <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <Star className="text-amber-400" fill="currentColor" />
        </div>
        <div>
          <h4 className="font-bold text-lg">Validasi Sertifikat</h4>
          <p className="text-slate-400 text-sm">Setiap sertifikat memiliki nomor unik yang dapat divalidasi oleh perusahaan melalui sistem verifikasi kami.</p>
        </div>
      </div>
    </div>
  )

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-400 animate-pulse font-bold">MEJATIKA LOADING...</div>

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">M</div>
          <h1 className="text-xl font-bold text-slate-800">Mejatika.</h1>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "courses", label: "Katalog Kursus", icon: BookOpen },
            { id: "materials", label: "Ruang Belajar", icon: FileCheck },
            { id: "certificates", label: "Sertifikat", icon: Award },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeMenu === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6">
           <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10">
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center mb-6">
           <h1 className="font-bold text-indigo-600">Mejatika.</h1>
           <button onClick={() => setSidebarOpen(true)}><Menu /></button>
        </div>

        {/* Dashboard Area */}
        {activeMenu === "dashboard" && (
           <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white">
              <h2 className="text-4xl font-bold mb-2">Welcome Back, {user?.name?.split(' ')[0]}!</h2>
              <p className="opacity-80">Kamu memiliki {certificates.length} sertifikat yang sudah terbit.</p>
           </div>
        )}

        {/* Render Certificates Page */}
        {activeMenu === "certificates" && renderCertificatesPage()}

        {/* Material & Courses Logic tetap ada di sini (seperti file sebelumnya) */}
        {/* ... */}
      </main>
    </div>
  )
}
