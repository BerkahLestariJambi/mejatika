"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileCheck, Award, LogOut, 
  PlayCircle, CheckCircle2, PlusCircle, ChevronDown, Clock, 
  FileText, Loader2, MessageSquare, Video, MonitorPlay, Zap, 
  Lock, CreditCard, UploadCloud, FileImage
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [activeMaterial, setActiveMaterial] = useState<any>(null)
  const [selectedProof, setSelectedProof] = useState<File | null>(null)
  const [activeStep, setActiveStep] = useState<string>("live") 

  // State Progress (Akan disinkronkan dengan Backend)
  const [liveDone, setLiveDone] = useState<Record<number, boolean>>({}) 
  const [materiDone, setMateriDone] = useState<Record<number, boolean>>({}) 
  const [taskSubmitted, setTaskSubmitted] = useState<Record<number, string>>({})
  const [feedbackDone, setFeedbackDone] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
    try {
      const [resReg, resUser, resAll] = await Promise.all([
        fetch("https://backend.mejatika.com/api/registrations", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/me", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("https://backend.mejatika.com/api/courses", { headers: { "Authorization": `Bearer ${token}` } })
      ])
      const dataReg = await resReg.json()
      const dataUser = await resUser.json()
      const dataAll = await resAll.json()

      setRegistrations(Array.isArray(dataReg) ? dataReg : dataReg.data || [])
      setUser(dataUser)
      setAvailableCourses(Array.isArray(dataAll) ? dataAll : dataAll.data || [])
      
      // LOGIKA: Map progress dari backend ke state lokal jika ada API-nya
      // Di sini kita asumsikan data progress ikut di dalam dataReg/materials
    } catch (err) { 
      console.error(err) 
    } finally { 
      setLoading(false) 
    }
  }

  // SIMPAN PROGRESS KE BACKEND
  const saveProgress = async (materialId: number, step: string, value: any) => {
    const token = localStorage.getItem("token")
    try {
      await fetch("https://backend.mejatika.com/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ material_id: materialId, step, value })
      })
    } catch (err) { console.error("Sync error:", err) }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran?")) return
    setRegisteringId(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      })
      if (res.ok) fetchData()
    } catch (err) { alert("Error koneksi.") } finally { setRegisteringId(null) }
  }

  const handleUploadProof = async (regId: number) => {
    if (!selectedProof) return alert("Pilih file bukti transfer (JPG/PNG)!")
    setUploadingId(regId)
    const formData = new FormData()
    formData.append("id", regId.toString()) 
    formData.append("proof", selectedProof) 

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`https://backend.mejatika.com/api/registrations/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        body: formData 
      })
      if (res.ok) {
        alert("Bukti bayar berhasil diupload! Tunggu verifikasi admin.");
        setSelectedProof(null);
        fetchData();
      } else {
        const result = await res.json()
        alert(result.message || "Gagal upload.");
      }
    } catch (err) { alert("Terjadi kesalahan jaringan.") } finally { setUploadingId(null) }
  }

  const renderEmbed = (url: string) => {
    if (!url) return <div className="p-10 text-center text-zinc-400 italic font-black uppercase text-[10px]">Pratinjau tidak tersedia</div>;
    let embedUrl = url;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("drive.google.com")) {
      embedUrl = url.replace("/view", "/preview");
    }
    return (
      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border-4 border-white">
        <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  if (loading) return <div className="h-screen flex flex-col items-center justify-center font-black italic text-zinc-900 animate-pulse bg-amber-500">
    <div className="text-6xl tracking-tighter mb-4">MEJATIKA</div>
    <div className="text-[10px] uppercase tracking-[0.5em]">Tunggu sebentar...</div>
  </div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] text-zinc-900 flex-col font-sans">
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-72 bg-zinc-950 text-white fixed h-full flex flex-col z-50">
          <div className="p-8 flex items-center gap-3 font-black italic">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950">M</div>
            <h1 className="text-xl uppercase tracking-tighter">Mejatika<span className="text-amber-500">.</span></h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "courses", label: "Katalog", icon: BookOpen },
              { id: "materials", label: "Materi", icon: FileCheck },
              { id: "certificates", label: "Sertifikat", icon: Award },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black italic uppercase text-[10px] transition-all ${activeMenu === item.id ? 'bg-amber-500 text-zinc-950 scale-105 shadow-xl shadow-amber-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-zinc-900">
             <button onClick={() => {localStorage.clear(); router.push("/login")}} className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 font-black italic uppercase text-[10px] hover:bg-rose-500/10 rounded-2xl transition-all">
              <LogOut size={18} /> Logout Akun
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72 p-10 flex flex-col">
          
          {activeMenu === "dashboard" && (
            <div className="space-y-10">
              <div className="bg-zinc-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">Gas Terus, <br/>{user?.name}!</h2>
                  <p className="text-amber-500 font-bold uppercase text-[10px] tracking-widest">Akses semua materi eksklusif Mejatika di sini.</p>
                </div>
                <div className="absolute -right-20 -top-20 h-80 w-80 bg-amber-500 rounded-full blur-[100px] opacity-20"></div>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Kursus</p><h3 className="text-5xl font-black italic leading-none">{availableCourses.length}</h3></Card>
                <Card className="p-10 rounded-[2.5rem] bg-white border-none shadow-sm"><p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Terdaftar</p><h3 className="text-5xl font-black italic leading-none">{registrations.length}</h3></Card>
                <Card className="p-10 rounded-[2.5rem] bg-emerald-500 text-white border-none shadow-xl shadow-emerald-500/20"><p className="text-[10px] font-black uppercase text-emerald-100 mb-2">Kursus Aktif</p><h3 className="text-5xl font-black italic leading-none">{registrations.filter(r => r.status === 'success').length}</h3></Card>
              </div>
            </div>
          )}

          {activeMenu === "courses" && (
            <div className="space-y-8">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Katalog Kursus</h2>
              <div className="grid grid-cols-2 gap-8">
                {availableCourses.map((course) => {
                  const reg = registrations.find(r => r.course_id === course.id);
                  const status = reg?.status || "NOT_ENROLLED";

                  return (
                    <Card key={course.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-sm hover:shadow-xl transition-all duration-500">
                      <div className="h-48 bg-zinc-100 flex items-center justify-center relative overflow-hidden group">
                        <BookOpen className="text-zinc-200 group-hover:scale-110 transition-transform duration-700" size={80} />
                        <div className="absolute top-6 right-6 bg-zinc-950 text-amber-500 px-4 py-2 rounded-full font-black italic text-[9px] uppercase tracking-tighter shadow-xl">Premium</div>
                      </div>
                      <CardContent className="p-10">
                        <h4 className="text-xl font-black uppercase italic mb-8 leading-tight h-14 line-clamp-2">{course.title}</h4>
                        
                        {status === 'success' ? (
                          <Button onClick={() => { setExpandedCourse(course.id); setActiveMenu("materials"); }} className="w-full bg-emerald-500 text-white h-16 rounded-2xl font-black italic uppercase text-[11px] shadow-lg shadow-emerald-500/20">Mulai Belajar <Zap size={16} className="ml-2 fill-current"/></Button>
                        ) : status === 'pending' ? (
                          <div className="space-y-4 bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-200/50">
                             <div className="flex items-center gap-3 text-amber-700 font-black italic uppercase text-[10px] mb-2"><CreditCard size={18}/> Transfer via BRI</div>
                             <div className="p-6 bg-white rounded-3xl border border-amber-200 shadow-inner">
                               <p className="text-[9px] text-zinc-400 font-bold uppercase mb-1">Nomor Rekening</p>
                               <p className="text-xl font-black text-zinc-900 tracking-tighter">0021-01-234567-53-1</p>
                               <p className="text-[9px] text-amber-600 font-bold italic uppercase mt-1">A/N Mejatika Edukasi</p>
                             </div>

                             <div className="space-y-3 pt-2">
                                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-amber-300 rounded-[2rem] bg-white cursor-pointer hover:bg-amber-100/50 transition-all group overflow-hidden">
                                  {selectedProof ? (
                                    <div className="flex flex-col items-center">
                                      <FileImage className="text-emerald-500 mb-1" size={32} />
                                      <span className="text-[9px] font-black uppercase text-zinc-900 truncate max-w-[150px]">{selectedProof.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center text-zinc-400">
                                      <UploadCloud className="group-hover:text-amber-500 group-hover:animate-bounce mb-1" size={32} />
                                      <span className="text-[9px] font-black uppercase">Pilih Foto Bukti</span>
                                    </div>
                                  )}
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedProof(e.target.files?.[0] || null)} />
                                </label>
                                
                                <Button 
                                  onClick={() => handleUploadProof(reg.id)} 
                                  disabled={uploadingId === reg.id}
                                  className="w-full bg-zinc-950 text-amber-500 h-14 rounded-2xl font-black italic uppercase text-[10px]"
                                >
                                  {uploadingId === reg.id ? <Loader2 className="animate-spin" /> : "Upload Konfirmasi Bayar"}
                                </Button>
                             </div>
                             <div className="text-center pt-2">
                               <span className="text-[8px] font-black uppercase text-amber-600/60 tracking-widest italic animate-pulse">Menunggu Admin Approve...</span>
                             </div>
                          </div>
                        ) : (
                          <Button onClick={() => handleEnroll(course.id)} disabled={registeringId === course.id} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-2xl font-black italic uppercase text-[11px] hover:bg-zinc-900 transition-all">
                            {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Kursus Sekarang"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeMenu === "materials" && (
            <div className="grid grid-cols-12 gap-10">
              {/* LIST MATERI */}
              <div className="col-span-4 space-y-6">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Modul Saya</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                  {registrations.filter(r => r.status === 'success').length === 0 && (
                    <div className="p-10 text-center border-4 border-dashed border-zinc-100 rounded-[3rem] text-zinc-300">
                       <Zap size={40} className="mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-black uppercase italic">Belum ada kursus aktif</p>
                    </div>
                  )}
                  {registrations.filter(r => r.status === 'success').map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <button onClick={() => setExpandedCourse(expandedCourse === reg.course_id ? null : reg.course_id)} className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all group ${expandedCourse === reg.course_id ? 'bg-zinc-950 text-white shadow-2xl' : 'bg-white shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${expandedCourse === reg.course_id ? 'bg-amber-500' : 'bg-zinc-200'}`}></div>
                          <span className="text-[10px] font-black uppercase italic truncate max-w-[180px]">{reg.course?.title}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-500 ${expandedCourse === reg.course_id ? 'rotate-180 text-amber-500' : 'text-zinc-300'}`} />
                      </button>
                      
                      {expandedCourse === reg.course_id && reg.course?.materials?.map((m: any) => (
                        <div key={m.id} className="ml-6 space-y-2 border-l-4 border-zinc-100 pl-6 py-4">
                          <p className="text-[10px] font-black text-amber-600 uppercase italic mb-3 tracking-tighter">{m.title}</p>
                          {[
                            { id: "live", label: "01. Live Session", icon: Video, done: liveDone[m.id], locked: false },
                            { id: "materi", label: "02. Materi Pokok", icon: MonitorPlay, done: materiDone[m.id], locked: !liveDone[m.id] },
                            { id: "tugas", label: "03. Latihan & Tugas", icon: FileText, done: !!taskSubmitted[m.id], locked: !materiDone[m.id] },
                            { id: "feedback", label: "04. Evaluasi Mentor", icon: MessageSquare, done: feedbackDone[m.id], locked: !taskSubmitted[m.id] }
                          ].map((step) => (
                            <button key={step.id} disabled={step.locked} onClick={() => { setActiveMaterial(m); setActiveStep(step.id); }} className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase italic transition-all ${activeMaterial?.id === m.id && activeStep === step.id ? 'bg-amber-500 text-zinc-950 scale-105' : 'bg-white text-zinc-500 hover:bg-zinc-50'} ${step.locked ? 'opacity-30 cursor-not-allowed' : 'shadow-sm'}`}>
                              <span className="flex items-center gap-3">{step.locked ? <Lock size={14} /> : <step.icon size={14} />} {step.label}</span>
                              {step.done && <CheckCircle2 size={14} className={activeMaterial?.id === m.id && activeStep === step.id ? "text-zinc-950" : "text-emerald-500"} />}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className="col-span-8">
                {activeMaterial ? (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                    <div className="bg-white p-12 rounded-[4rem] shadow-xl border-none">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 bg-zinc-950 text-amber-500 rounded-2xl flex items-center justify-center font-black italic shadow-xl">
                              {activeStep === "live" ? "01" : activeStep === "materi" ? "02" : activeStep === "tugas" ? "03" : "04"}
                           </div>
                           <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                             {activeStep === "live" ? "Live Session" : activeStep === "materi" ? "Materi Pokok" : activeStep === "tugas" ? "Tugas Praktik" : "Feedback & Evaluasi"}
                           </h3>
                        </div>
                        <div className="bg-zinc-50 px-6 py-2 rounded-full text-[9px] font-black uppercase text-zinc-400 border border-zinc-100">
                          {activeMaterial.title}
                        </div>
                      </div>

                      {activeStep === "live" && (
                        <div className="space-y-8">
                          {renderEmbed(activeMaterial.live_link)}
                          <Button onClick={() => { 
                            setLiveDone({...liveDone, [activeMaterial.id]: true}); 
                            saveProgress(activeMaterial.id, "live", true);
                            setActiveStep("materi"); 
                          }} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-xs shadow-2xl hover:scale-[1.02] transition-transform">Saya Sudah Menonton & Lanjut</Button>
                        </div>
                      )}

                      {activeStep === "materi" && (
                        <div className="space-y-8">
                          {renderEmbed(activeMaterial.file)}
                          <div className="prose prose-zinc max-w-full text-base leading-relaxed p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100" dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                          <Button onClick={() => { 
                            setMateriDone({...materiDone, [activeMaterial.id]: true}); 
                            saveProgress(activeMaterial.id, "materi", true);
                            setActiveStep("tugas"); 
                          }} className="w-full bg-emerald-500 text-white h-16 rounded-[2rem] font-black italic uppercase text-xs shadow-2xl hover:scale-[1.02] transition-transform">Selesai Baca & Lanjut Tugas</Button>
                        </div>
                      )}

                      {activeStep === "tugas" && (
                        <div className="space-y-8 text-center">
                           <div className="py-16 border-4 border-dashed border-zinc-100 rounded-[3.5rem] bg-zinc-50/50">
                              <FileText size={60} className="mx-auto text-zinc-200 mb-6" />
                              <p className="text-sm font-black text-zinc-400 uppercase italic tracking-widest">Submit Link Tugas Progress (Drive/GitHub)</p>
                           </div>
                           {taskSubmitted[activeMaterial.id] ? (
                             <div className="p-8 bg-emerald-50 text-emerald-700 rounded-[2rem] text-xs font-black uppercase italic border-2 border-emerald-100 shadow-inner">
                               Link Berhasil Dikirim: <span className="underline ml-2">{taskSubmitted[activeMaterial.id]}</span>
                             </div>
                           ) : (
                             <div className="space-y-4 text-left">
                               <textarea id="taskInput" placeholder="Masukkan link hasil praktikmu di sini..." className="w-full h-40 p-10 rounded-[3rem] bg-zinc-50 border-2 border-transparent focus:border-amber-500 transition-all outline-none text-sm font-medium" />
                               <Button onClick={() => { 
                                 const val = (document.getElementById('taskInput') as HTMLTextAreaElement).value; 
                                 if(val) { 
                                   setTaskSubmitted({...taskSubmitted, [activeMaterial.id]: val}); 
                                   saveProgress(activeMaterial.id, "tugas", val);
                                   setActiveStep("feedback"); 
                                 }
                               }} className="w-full bg-zinc-950 text-amber-500 h-16 rounded-[2rem] font-black italic uppercase text-xs shadow-2xl hover:scale-[1.02] transition-transform">Kirim Tugas Sekarang</Button>
                             </div>
                           )}
                        </div>
                      )}

                      {activeStep === "feedback" && (
                        <div className="space-y-8">
                           <div className="bg-amber-50 p-10 rounded-[3rem] border-4 border-amber-100 relative overflow-hidden">
                             <div className="relative z-10">
                               <h4 className="text-lg font-black uppercase italic text-amber-700 mb-6 flex items-center gap-3"><MessageSquare size={24}/> Catatan Mentor</h4>
                               <p className="text-sm text-amber-900 leading-relaxed italic bg-white p-8 rounded-[2rem] shadow-sm">
                                 "Pastikan kode kamu sudah rapi sebelum lanjut ke modul berikutnya. Jika ada error, diskusikan di channel Discord Mejatika."
                               </p>
                             </div>
                             <Zap className="absolute -bottom-10 -right-10 text-amber-200 opacity-20" size={150} />
                           </div>
                           <Button onClick={() => {
                             setFeedbackDone({...feedbackDone, [activeMaterial.id]: true});
                             saveProgress(activeMaterial.id, "feedback", true);
                             alert("Modul Selesai! Kamu luar biasa.");
                           }} className="w-full bg-amber-500 text-zinc-950 h-16 rounded-[2rem] font-black italic uppercase text-xs shadow-xl shadow-amber-500/20">Selesaikan Modul Ini</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-200 border-8 border-dashed border-zinc-50 rounded-[5rem] bg-white/50">
                    <div className="p-10 bg-white rounded-full shadow-2xl mb-8">
                      <PlayCircle size={100} className="text-zinc-100" />
                    </div>
                    <p className="font-black italic uppercase text-xs tracking-[0.4em] opacity-30">Pilih Modul Belajar Untuk Memulai</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "certificates" && (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <Award size={150} className="text-zinc-100" />
                <Zap size={50} className="absolute -top-4 -right-4 text-amber-500 animate-bounce" />
              </div>
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-zinc-900">Belum Ada Sertifikat</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Selesaikan 1 kursus penuh untuk mencetak sertifikat digital.</p>
              </div>
              <Button onClick={() => setActiveMenu("materials")} className="bg-zinc-950 text-white h-14 px-10 rounded-2xl font-black italic uppercase text-[10px]">Ke Modul Belajar</Button>
            </div>
          )}

          <footer className="py-16 border-t border-zinc-100 mt-auto text-center">
            <div className="flex justify-center gap-10 mb-6 opacity-20">
              <div className="h-1 w-12 bg-zinc-900 rounded-full"></div>
              <div className="h-1 w-12 bg-zinc-900 rounded-full"></div>
              <div className="h-1 w-12 bg-zinc-900 rounded-full"></div>
            </div>
            <p className="text-[10px] font-black uppercase italic text-zinc-300 tracking-[0.5em]">© 2026 MEJATIKA ACADEMY • BUILD THE FUTURE</p>
          </footer>
        </main>
      </div>

      {/* CUSTOM CSS FOR SCROLLBAR */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E4E7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F59E0B; }
      `}</style>
    </div>
  )
}
