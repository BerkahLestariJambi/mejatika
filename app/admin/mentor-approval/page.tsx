"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X, User as UserIcon, Book, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function AdminMentorApprovalPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

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
      // Mengambil data dari response API
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
        fetchPendingApplications()
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* PERBAIKAN: Melakukan iterasi langsung pada array flat applications */}
          {applications.map((app) => (
            <Card key={app.application_id} className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase text-amber-600 bg-amber-50 w-fit px-3 py-1 rounded-full">
                   <Book size={14} /> {app.course_title}
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-100">
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <UserIcon size={30} />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-zinc-900 leading-tight">{app.mentor_name}</h4>
                    <p className="text-[10px] text-zinc-400 font-medium mb-2">{app.mentor_email}</p>
                    <p className="text-xs text-zinc-600 font-bold uppercase">{app.specialization || "Keahlian tidak diisi"}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                   <div className="flex items-center gap-1 text-zinc-400 text-[10px]">
                      <Calendar size={12} />
                      Diajukan: {new Date(app.applied_at).toLocaleDateString('id-ID')}
                   </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button 
                    onClick={() => handleStatusUpdate(app.course_id, app.mentor_id, 'approved')}
                    disabled={processing === `${app.course_id}-${app.mentor_id}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-bold text-xs"
                  >
                    {processing === `${app.course_id}-${app.mentor_id}` ? <Loader2 className="animate-spin" /> : <><Check size={16} className="mr-1" /> Terima</>}
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate(app.course_id, app.mentor_id, 'rejected')}
                    disabled={processing === `${app.course_id}-${app.mentor_id}`}
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
      )}
    </div>
  )
}
