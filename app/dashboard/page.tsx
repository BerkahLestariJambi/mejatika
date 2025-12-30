"use client"

import { useEffect, useState } from "react"
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
  LogOut 
} from "lucide-react"

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]) // 1. Tambahkan state pendaftaran
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchDashboardData(token)
  }, [])

  // 2. Fungsi fetch ganda (Kursus + Pendaftaran Saya)
  const fetchDashboardData = async (token: string) => {
    try {
      const headers = { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
      
      const [resCourses, resRegis] = await Promise.all([
        fetch("https://backend.mejatika.com/api/courses", { headers }),
        fetch("https://backend.mejatika.com/api/registrations", { headers, cache: 'no-store' }) // Ambil data status
      ])

      const dataCourses = await resCourses.json()
      const dataRegis = await resRegis.json()

      setCourses(Array.isArray(dataCourses) ? dataCourses : (dataCourses.data || []))
      setMyRegistrations(Array.isArray(dataRegis) ? dataRegis : (dataRegis.data || []))
    } catch (err) {
      console.error("Gagal sinkronisasi data")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) return <div className="p-10 text-center font-bold">Menyinkronkan Status...</div>

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* ... bagian nav tetap sama ... */}

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => {
            
            // 3. LOGIKA PENGECEKAN: Apakah saya sudah daftar kursus ini?
            const registration = myRegistrations.find(r => r.course_id === course.id)
            const isRegistered = !!registration
            const currentStatus = registration?.status // 'pending' atau 'success'

            return (
              <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                <div className="h-40 relative">
                  <img src={course.thumbnail || "/placeholder.svg"} className="h-full w-full object-cover" alt="" />
                  
                  {/* Tampilkan Badge Status jika sudah daftar */}
                  {isRegistered && (
                    <div className="absolute top-4 right-4">
                      <Badge className={currentStatus === 'success' ? 'bg-green-500' : 'bg-amber-500'}>
                        {currentStatus === 'success' ? 'AKTIF' : 'MENUNGGU VERIFIKASI'}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-8">
                  <CardTitle className="font-black uppercase italic text-xl mb-3 tracking-tighter">
                    {course.title}
                  </CardTitle>
                  
                  {/* 4. PERUBAHAN TOMBOL DINAMIS */}
                  {currentStatus === 'success' ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-black uppercase italic gap-2">
                      <CheckCircle2 /> Mulai Belajar
                    </Button>
                  ) : isRegistered ? (
                    <Button disabled className="w-full bg-zinc-200 text-zinc-500 h-14 rounded-2xl font-black uppercase italic gap-2">
                      <Clock /> Terdaftar (Pending)
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase italic"
                      onClick={() => {/* fungsi daftar */}}
                    >
                      Daftar Kursus
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
