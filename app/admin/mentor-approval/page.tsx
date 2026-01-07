"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, User as UserIcon, Book } from "lucide-react"
import { toast } from "sonner"

export default function AdminMentorApprovalPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null) // format: courseId-mentorId

  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    fetchPendingApplications()
  }, [])

  const fetchPendingApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/admin/applications/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setApplications(data.data || [])
    } catch (error) {
      toast.error("Gagal mengambil data pengajuan")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (courseId: number, mentorId: number, status: 'approved' | 'rejected') => {
    setProcessing(`${courseId}-${mentorId}`)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/admin/applications/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          mentor_id: mentorId,
          status: status
        }),
      })

      if (res.ok) {
        toast.success(`Berhasil ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan`)
        fetchPendingApplications() // Refresh data
      } else {
        toast.error("Gagal memperbarui status")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
          Persetujuan <span className="text-amber-500">Mentor</span>
        </h1>
        <p className="text-zinc-500 mt-2">Daftar kontributor yang mengajukan diri untuk mengajar kursus.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-20 text-center text-zinc-400 font-bold">
          Tidak ada pengajuan pending saat ini.
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((course) => (
            <div key={course.id} className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-black uppercase text-zinc-700">
                <Book size={20} className="text-amber-500" /> {course.title}
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {course.instructors.map((mentor: any) => (
                  <Card key={mentor.id} className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0">
                          {mentor.mentor_profile?.photo ? (
                            <img src={mentor.mentor_profile.photo} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400"><UserIcon /></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-zinc-900">{mentor.name}</h4>
                          <p className="text-xs text-amber-600 font-bold uppercase mb-2">{mentor.mentor_profile?.specialization || "Keahlian belum diisi"}</p>
                          <p className="text-xs text-zinc-500 line-clamp-2 italic">"{mentor.mentor_profile?.bio || 'Tidak ada bio'}"</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button 
                          onClick={() => handleStatusUpdate(course.id, mentor.id, 'approved')}
                          disabled={processing === `${course.id}-${mentor.id}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-bold text-xs"
                        >
                          {processing === `${course.id}-${mentor.id}` ? <Loader2 className="animate-spin" /> : <><Check size={16} className="mr-1" /> Terima</>}
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(course.id, mentor.id, 'rejected')}
                          disabled={processing === `${course.id}-${mentor.id}`}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 font-bold text-xs"
                        >
                          <X size={16} className="mr-1" /> Tolak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
