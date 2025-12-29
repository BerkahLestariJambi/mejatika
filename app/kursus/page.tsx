"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Tag, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function KursusPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [regLoading, setRegLoading] = useState<number | null>(null) // Loading per item
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/courses")
        const data = await res.json()
        setCourses(data)
      } catch (err) {
        setMessage({ text: "Gagal memuat daftar kursus.", type: "error" })
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const handleRegister = async (courseId: number) => {
    setRegLoading(courseId)
    setMessage({ text: "", type: "" })
    
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      setMessage({ text: "Silakan login terlebih dahulu untuk mendaftar.", type: "error" })
      setRegLoading(null)
      return
    }

    const user = JSON.parse(userData)

    try {
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId, user_id: user.id }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ text: "Berhasil daftar! Silakan cek email/dashboard Anda.", type: "success" })
      } else {
        setMessage({ text: data.error || "Gagal daftar kursus.", type: "error" })
      }
    } catch {
      setMessage({ text: "Terjadi kesalahan jaringan.", type: "error" })
    } finally {
      setRegLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        {/* HEADER SECTION */}
        <div className="max-w-3xl mb-16">
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4 px-4 py-1 uppercase tracking-widest font-black text-[10px]">
            Akademi Mejatika
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-zinc-900 mb-6 leading-none">
            Program <span className="text-amber-500">Kursus</span>
          </h1>
          <p className="text-lg text-zinc-500 font-medium max-w-xl leading-relaxed">
            Tingkatkan keahlian digital Anda bersama instruktur profesional melalui kurikulum yang terukur.
          </p>
        </div>

        {/* FEEDBACK MESSAGE */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm uppercase tracking-wider">{message.text}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
            <p className="font-black text-xs uppercase tracking-[0.3em] text-zinc-400">Menyiapkan Materi...</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* IMAGE */}
                  <div className="p-4">
                    <div className="relative h-56 w-full rounded-[2rem] overflow-hidden">
                      <img 
                        src={course.image || "/placeholder.svg"} 
                        alt={course.title} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase">
                          {course.category || "Unggulan"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-8 pt-2 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black italic uppercase leading-tight text-zinc-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2">
                      {course.description}
                    </p>

                    {/* DETAILS BOX */}
                    <div className="bg-zinc-50 rounded-3xl p-5 space-y-3 mb-8 border border-zinc-100/50">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-amber-500" /> Durasi</span>
                        <span className="text-zinc-800">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-amber-500" /> Mentor</span>
                        <span className="text-zinc-800">{course.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400 pt-2 border-t border-zinc-200">
                        <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-500" /> Investasi</span>
                        <span className="text-amber-600 font-black text-sm">Rp {course.price.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <Button
                      className="mt-auto w-full bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all"
                      disabled={regLoading === course.id}
                      onClick={() => handleRegister(course.id)}
                    >
                      {regLoading === course.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Daftar Sekarang"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
