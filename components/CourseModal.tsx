"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export function CourseModal({ isOpen, onClose, course, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    instructor: "",
    price: 0,
    status: "active"
  })

  useEffect(() => {
    if (course) setFormData(course)
    else setFormData({ title: "", description: "", duration: "", instructor: "", price: 0, status: "active" })
  }, [course])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    const method = course ? "PUT" : "POST"
    const url = course ? `/api/courses?id=${course.id}` : "/api/courses"

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] max-w-lg p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            {course ? "Edit" : "Tambah"} <span className="text-amber-500">Kursus</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-[11px] font-bold uppercase tracking-widest">
          <div className="space-y-2">
            <label>Judul Kursus</label>
            <Input className="rounded-xl border-zinc-100" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <label>Deskripsi</label>
            <Textarea className="rounded-xl border-zinc-100" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Durasi</label>
              <Input className="rounded-xl border-zinc-100" placeholder="Contoh: 3 Bulan" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label>Harga (IDR)</label>
              <Input type="number" className="rounded-xl border-zinc-100" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Simpan Data Kursus"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
