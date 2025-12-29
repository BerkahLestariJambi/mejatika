"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, Loader2, MapPin, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)

  // Ambil token dari localStorage
  const getAuthToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("https://backend.mejatika.com/api/schedules"),
        fetch("https://backend.mejatika.com/api/courses")
      ])
      const sData = await sRes.json()
      const cData = await cRes.json()
      setSchedules(Array.isArray(sData) ? sData : [])
      setCourses(Array.isArray(cData) ? cData : cData.data || [])
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const token = getAuthToken()
    const formData = new FormData(e.currentTarget)
    
    // Payload disesuaikan dengan validasi Laravel: course_id, start_time, end_time, location
    const payload = {
      course_id: formData.get("course_id"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      location: formData.get("location"),
    }

    const url = editingSchedule 
      ? `https://backend.mejatika.com/api/schedules/${editingSchedule.id}`
      : "https://backend.mejatika.com/api/schedules"
    
    try {
      const res = await fetch(url, {
        method: editingSchedule ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // Perbaikan error 401
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        setEditingSchedule(null)
        fetchData()
      } else {
        const errData = await res.json()
        alert(errData.message || "Gagal menyimpan data. Pastikan Anda sudah login sebagai Admin.")
      }
    } catch (err) {
      console.error("Submit Error:", err)
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return
    
    const token = getAuthToken()
    try {
      const res = await fetch(`https://backend.mejatika.com/api/schedules/${id}`, { 
        method: "DELETE",
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error("Delete Error:", err)
    }
  }

  // Fungsi helper untuk memformat tanggal database ke input HTML (datetime-local)
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ""
    // Mengubah "2025-12-20 22:00:00" menjadi "2025-12-20T22:00"
    return dateStr.replace(" ", "T").slice(0, 16)
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Schedule <span className="text-amber-500">Management</span>
          </h1>
          <p className="text-zinc-500 font-medium">Atur slot waktu dan lokasi kursus Mejatika.</p>
        </div>
        <Button 
          onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }} 
          className="bg-zinc-900 hover:bg-amber-600 rounded-2xl h-12 px-6 font-bold uppercase transition-all shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Schedule
        </Button>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {schedules.length === 0 ? (
                <div className="p-20 text-center text-zinc-400 font-medium italic">Belum ada jadwal yang terdaftar.</div>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="group flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-zinc-50/50 transition-all gap-4">
                    <div className="flex gap-6">
                      <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-zinc-900 text-white group-hover:bg-amber-500 transition-colors shadow-lg">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic text-zinc-900">
                          {schedule.course?.title || "Kursus Tidak Ditemukan"}
                        </h3>
                        <div className="flex flex-wrap gap-5 mt-3 text-sm font-bold text-zinc-500">
                          <span className="flex items-center gap-2 text-amber-600">
                            <Clock size={16}/> {new Date(schedule.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin size={16}/> {schedule.location || "Lokasi belum diatur"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 hover:border-amber-500 hover:text-amber-500 transition-all" 
                        onClick={() => { setEditingSchedule(schedule); setIsModalOpen(true); }}>
                        <Edit size={18} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all" 
                        onClick={() => handleDelete(schedule.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
              {editingSchedule ? "Update" : "New"} <span className="text-amber-500">Schedule</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Pilih Kursus</Label>
              <Select name="course_id" defaultValue={editingSchedule?.course_id?.toString()}>
                <SelectTrigger className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500">
                  <SelectValue placeholder="Pilih Kursus Terdaftar" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()} className="font-bold uppercase text-xs tracking-wide cursor-pointer focus:bg-amber-50 focus:text-amber-600">{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Waktu Mulai</Label>
              <Input name="start_time" type="datetime-local" defaultValue={formatDateTime(editingSchedule?.start_time)} required className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50" />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Waktu Selesai</Label>
              <Input name="end_time" type="datetime-local" defaultValue={formatDateTime(editingSchedule?.end_time)} required className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50" />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Lokasi / Link Meeting</Label>
              <Input name="location" defaultValue={editingSchedule?.location} placeholder="Contoh: Zoom Meeting atau Ruang A1" className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase tracking-[0.1em] transition-all mt-4 shadow-lg active:scale-95">
              {isSubmitting ? <Loader2 className="animate-spin" /> : editingSchedule ? "Update Schedule" : "Save Schedule"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
