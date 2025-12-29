"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, Users, Loader2, X, Clock, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)

  // Fetch Data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("https://backend.mejatika.com/api/course-schedules"),
        fetch("https://backend.mejatika.com/api/courses")
      ])
      const sData = await sRes.json()
      const cData = await cRes.json()
      setSchedules(Array.isArray(sData) ? sData : sData.data || [])
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

  // Handler Simpan (Create & Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData)

    const url = editingSchedule 
      ? `https://backend.mejatika.com/api/course-schedules/${editingSchedule.id}`
      : "https://backend.mejatika.com/api/course-schedules"
    
    try {
      const res = await fetch(url, {
        method: editingSchedule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setIsModalOpen(false)
        setEditingSchedule(null)
        fetchData()
      }
    } catch (err) {
      console.error("Error saving schedule:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler Hapus
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return
    try {
      await fetch(`https://backend.mejatika.com/api/course-schedules/${id}`, { method: "DELETE" })
      fetchData()
    } catch (err) {
      console.error("Error deleting schedule:", err)
    }
  }

  return (
    <div className="space-y-8 p-2 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Schedule <span className="text-amber-500">Management</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight">Kelola ketersediaan waktu dan batch kursus.</p>
        </div>
        <Button 
          onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
          className="bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-12 px-6 font-bold uppercase transition-all shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Schedule
        </Button>
      </div>

      {/* List Card */}
      <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-50 p-8">
          <CardTitle className="text-xl font-black uppercase italic">All Schedules</CardTitle>
          <CardDescription>Daftar seluruh jadwal yang sedang berjalan atau akan datang.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="group flex flex-col lg:flex-row lg:items-center justify-between p-8 hover:bg-zinc-50/50 transition-all gap-6">
                  <div className="flex gap-6">
                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-900 text-white group-hover:bg-amber-500 transition-colors">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black uppercase italic text-zinc-900">{schedule.title}</h3>
                        <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none ${
                          schedule.status === "upcoming" ? "bg-blue-100 text-blue-600" : 
                          schedule.status === "ongoing" ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">{schedule.course?.title}</p>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-zinc-500 font-medium">
                        <span className="flex items-center gap-2"><Clock size={14} /> {schedule.time}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} /> {schedule.location}</span>
                        <span className="flex items-center gap-2"><Users size={14} /> {schedule.currentParticipants}/{schedule.maxParticipants} Peserta</span>
                        <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(schedule.startDate).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <Button 
                      variant="outline" size="icon" className="h-12 w-12 rounded-2xl hover:border-amber-500 hover:text-amber-500 transition-all"
                      onClick={() => { setEditingSchedule(schedule); setIsModalOpen(true); }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" size="icon" className="h-12 w-12 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Form Create/Update */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              {editingSchedule ? "Edit Schedule" : "New Schedule"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Judul Batch</Label>
              <Input name="title" defaultValue={editingSchedule?.title} placeholder="Contoh: Batch 1 - Weekend" required className="rounded-xl h-12 border-zinc-100" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Pilih Kursus</Label>
              <Select name="courseId" defaultValue={editingSchedule?.courseId?.toString()}>
                <SelectTrigger className="rounded-xl h-12 border-zinc-100">
                  <SelectValue placeholder="Pilih Kursus" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Tgl Mulai</Label>
                <Input name="startDate" type="date" defaultValue={editingSchedule?.startDate?.split('T')[0]} required className="rounded-xl h-12 border-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Tgl Selesai</Label>
                <Input name="endDate" type="date" defaultValue={editingSchedule?.endDate?.split('T')[0]} required className="rounded-xl h-12 border-zinc-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Lokasi</Label>
                <Input name="location" defaultValue={editingSchedule?.location} placeholder="Zoom / Studio" required className="rounded-xl h-12 border-zinc-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Max Peserta</Label>
                <Input name="maxParticipants" type="number" defaultValue={editingSchedule?.maxParticipants} required className="rounded-xl h-12 border-zinc-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-zinc-400">Status</Label>
              <Select name="status" defaultValue={editingSchedule?.status || "upcoming"}>
                <SelectTrigger className="rounded-xl h-12 border-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-amber-600 h-14 rounded-2xl font-black uppercase tracking-widest transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" /> : editingSchedule ? "Update Schedule" : "Create Schedule"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
