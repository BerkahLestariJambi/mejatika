"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // Sesuaikan payload dengan validasi di Controller PHP
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
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setIsModalOpen(false)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return
    await fetch(`https://backend.mejatika.com/api/schedules/${id}`, { 
        method: "DELETE",
        headers: { "Accept": "application/json" }
    })
    fetchData()
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Schedule <span className="text-amber-500">List</span></h1>
          <p className="text-zinc-500">Kelola waktu dan lokasi kelas kursus.</p>
        </div>
        <Button onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }} className="bg-zinc-900 rounded-2xl h-12 px-6 font-bold uppercase">
          <Plus className="mr-2 h-5 w-5" /> Add New
        </Button>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-zinc-50/50 transition-all gap-4">
                  <div className="flex gap-6">
                    <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-zinc-900 text-white">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase italic text-zinc-900">
                        {schedule.course?.title || "No Course Linked"}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-zinc-500">
                        <span className="flex items-center gap-1 text-amber-600"><Clock size={14}/> {new Date(schedule.start_time).toLocaleString('id-ID')}</span>
                        <span className="flex items-center gap-1"><MapPin size={14}/> {schedule.location || "TBA"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl h-12 w-12" onClick={() => { setEditingSchedule(schedule); setIsModalOpen(true); }}>
                      <Edit size={18} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 text-red-500 hover:bg-red-50" onClick={() => handleDelete(schedule.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic">{editingSchedule ? "Edit Schedule" : "New Schedule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">Pilih Kursus</Label>
              <Select name="course_id" defaultValue={editingSchedule?.course_id?.toString()}>
                <SelectTrigger className="rounded-xl h-12 border-zinc-100">
                  <SelectValue placeholder="Pilih Kursus" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">Waktu Mulai</Label>
              <Input name="start_time" type="datetime-local" defaultValue={editingSchedule?.start_time ? editingSchedule.start_time.slice(0, 16) : ""} required className="rounded-xl h-12 border-zinc-100" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">Waktu Selesai</Label>
              <Input name="end_time" type="datetime-local" defaultValue={editingSchedule?.end_time ? editingSchedule.end_time.slice(0, 16) : ""} required className="rounded-xl h-12 border-zinc-100" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">Lokasi / Link</Label>
              <Input name="location" defaultValue={editingSchedule?.location} placeholder="Zoom atau Nama Ruangan" className="rounded-xl h-12 border-zinc-100" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-amber-600 h-14 rounded-2xl font-black uppercase tracking-widest">
              {isSubmitting ? <Loader2 className="animate-spin" /> : editingSchedule ? "Update Schedule" : "Save Schedule"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
