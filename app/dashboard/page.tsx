"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, ChevronDown, Clock, 
  FileText, Loader2, Flame, MessageSquare, 
  Video, MonitorPlay, Zap, Lock, CreditCard, UploadCloud,
  Send, UserCircle2, Menu, X, Star, RefreshCw, AlertCircle, Download
} from "lucide-react"
import Swal from 'sweetalert2'

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State Operasional
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<string>("live") 
  
  // State Tugas
  const [studentAnswer, setStudentAnswer] = useState("")
  const [taskLink, setTaskLink] = useState("")
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [courseProgress, setCourseProgress] = useState<Record<number, any>>({})
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null)
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(null)

  const API_URL = "https://backend.mejatika.com/api"

  // 1. Fetch Data Utama
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    
    try {
      setLoading(true)
      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
      
      const [resReg, resUser, resAll] = await Promise.all([
        fetch(`${API_URL}/registrations`, { headers }),
        fetch(`${API_URL}/me`, { headers }),
        fetch(`${API_URL}/courses`, { headers })
      ])

      if (resReg.status === 401) throw new Error("Unauthorized")

      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
    } catch (err: any) { 
      if (err.message === "Unauthorized") {
        localStorage.clear()
        router.push("/login")
      }
      setError("Gagal sinkronisasi data.")
    } finally { setLoading(false) }
  }, [router])

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("mejatika_progress")
    if (saved) setCourseProgress(JSON.parse(saved))
  }, [fetchData])

  // --- LOGIKA PENDAFTARAN & PEMBAYARAN ---
  const handleRegister = async (courseId: number) => {
    setRegisteringId(courseId)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) {
        Swal.fire("Berhasil", "Pendaftaran dibuat. Silakan upload bukti bayar.", "success")
        fetchData()
      }
    } catch (err) { Swal.fire("Gagal", "Terjadi kesalahan.", "error") }
    finally { setRegisteringId(null) }
  }

  const handleUploadProof = async (regId: number) => {
    if (!selectedProof) return Swal.fire("Error", "Pilih file terlebih dahulu!", "warning")
    setUploadingId(regId)
    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("payment_proof", selectedProof)

    try {
      const res = await fetch(`${API_URL}/registrations/${regId}/upload-proof`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        Swal.fire("Berhasil", "Bukti bayar terkirim. Menunggu verifikasi admin.", "success")
        setSelectedProof(null)
        fetchData()
      }
    } catch (err) { Swal.fire("Gagal", "Gagal upload file.", "error") }
    finally { setUploadingId(null) }
  }

  // --- LOGIKA DOWNLOAD (ANTI-UNAUTHORIZED) ---
  const handleDownloadCertificate = async (reg: any) => {
    const certData = reg.certificate;
    if (!certData?.id) return Swal.fire("Info", "Sertifikat belum terbit.", "info");
    
    setDownloadingCertId(reg.id);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/certificates/${certData.id}/download`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/pdf" }
      });

      if (response.status === 401) {
        router.push("/login");
        throw new Error("Sesi login berakhir.");
      }

      if (!response.ok) throw new Error("Gagal mengambil file.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sertifikat-${reg.course?.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.fire("Berhasil", "File diunduh.", "success");
    } catch (err: any) { Swal.fire("Gagal", err.message, "error"); }
    finally { setDownloadingCertId(null); }
  }

  const markStepComplete = (materialId: number, currentStep: string, nextStep: string | null) => {
    const newProgress = { ...courseProgress, [materialId]: { ...(courseProgress[materialId] || {}), [currentStep]: true } }
    setCourseProgress(newProgress);
    localStorage.setItem("mejatika_progress", JSON.stringify(newProgress));
    if (nextStep) setActiveStep(nextStep);
  }

  const isStepLocked = (materialId: number, step: string) => {
    const p = courseProgress[materialId] || {}
    if (step === "live") return false
    if (step === "materi") return !p.live
    if (step === "tugas") return !p.materi
    if (step === "feedback") return !p.tugas
    return true
  }

  const calculateProgress = (courseId: number) => {
    const course = availableCourses.find(c => Number(c.id) === Number(courseId))
    if (!course?.materials?.length) return 0
    let completed = 0
    course.materials.forEach((m: any) => {
      const p = courseProgress[m.id] || {}
      if (p.live) completed++
      if (p.materi) completed++
      if (p.tugas) completed++
      if (p.feedback) completed++
    })
    return Math.round((completed / (course.materials.length * 4)) * 100)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r fixed h-full z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b font-bold text-xl flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">M</div> Mejatika
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "courses", label: "Katalog Kursus", icon: BookOpen },
            { id: "materials", label: "Ruang Belajar", icon: FileCheck },
            { id: "certificates", label: "Sertifikat", icon: Award },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeMenu === item.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => {localStorage.clear(); router.push("/login")}} className="absolute bottom-8 left-4 right-4 flex items-center gap-3 p-4 text-red-500 font-bold hover:bg-red-50 rounded-xl">
          <LogOut size={20}/> Logout
        </button>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 lg:p-10">
        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
           <div className="space-y-6">
             <div className="bg-indigo-600 p-10 rounded-[2rem] text-white">
                <h2 className="text-3xl font-black">Halo, {user?.name}!</h2>
                <p className="opacity-80">Selamat datang kembali di panel belajarmu.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400">TOTAL KURSUS</p>
                  <h3 className="text-3xl font-black">{availableCourses.length}</h3>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400">KURSUS SAYA</p>
                  <h3 className="text-3xl font-black text-indigo-600">{registrations.length}</h3>
                </Card>
             </div>
           </div>
        )}

        {/* KATALOG KURSUS (Daftar & Upload Bukti) */}
        {activeMenu === "courses" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">Katalog Kursus Tersedia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCourses.map(course => {
                const reg = registrations.find(r => r.course_id === course.id);
                return (
                  <Card key={course.id} className="p-6 rounded-3xl overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-lg">{course.title}</h3>
                       <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full font-bold">IDR {course.price?.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">{course.description}</p>
                    
                    {!reg ? (
                      <Button onClick={() => handleRegister(course.id)} disabled={registeringId === course.id} className="w-full bg-indigo-600">
                        {registeringId === course.id ? <Loader2 className="animate-spin"/> : "Daftar Sekarang"}
                      </Button>
                    ) : reg.status === "pending" ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs font-medium">
                          Silakan transfer ke: <br/><strong>BCA 123456789 a/n Mejatika</strong>
                        </div>
                        <input type="file" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} className="text-xs w-full"/>
                        <Button onClick={() => handleUploadProof(reg.id)} disabled={uploadingId === reg.id} className="w-full bg-slate-900">
                          {uploadingId === reg.id ? <Loader2 className="animate-spin"/> : "Kirim Bukti Bayar"}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-bold">
                        Sudah Terdaftar & Aktif
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* RUANG BELAJAR & SERTIFIKAT (Sama seperti sebelumnya) */}
        {activeMenu === "materials" && (
           <p className="text-center py-20 opacity-50">Gunakan menu di samping untuk memilih materi.</p>
        )}

        {activeMenu === "certificates" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrations.filter(r => r.status === 'success' || r.status === 'aktif').map(reg => (
              <Card key={reg.id} className="p-6 text-center rounded-3xl">
                <Award className="mx-auto mb-4 text-indigo-600" size={48}/>
                <h4 className="font-bold mb-4">{reg.course?.title}</h4>
                <Button 
                  onClick={() => handleDownloadCertificate(reg)} 
                  disabled={!reg.certificate || downloadingCertId === reg.id} 
                  className="w-full"
                >
                  {downloadingCertId === reg.id ? <RefreshCw className="animate-spin"/> : (reg.certificate ? "Download PDF" : "Progress: " + calculateProgress(reg.course_id) + "%")}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
