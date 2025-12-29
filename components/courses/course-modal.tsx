"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function CourseModal({ isOpen, onClose, course, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "", description: "", duration: "", instructor: "", price: 0, image: "", status: "active"
  })

  useEffect(() => {
    if (course) setFormData(course)
    else setFormData({ title: "", description: "", duration: "", instructor: "", price: 0, image: "", status: "active" })
  }, [course, isOpen])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const url = course ? `/api/courses?id=${course.id}` : "/api/courses"
    const method = course ? "PUT" : "POST"

    try {
      await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      })
      onSuccess()
      onClose()
    } catch (err) {
      alert("Gagal menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] max-w-lg p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            {course ? "Edit" : "Add"} <span className="text-amber-500">Course</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4 font-bold uppercase tracking-widest text-[11px]">
          <div className="space-y-1.5">
            <label className="text-zinc-400">Judul Kursus</label>
            <Input className="rounded-xl" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-zinc-400">Deskripsi Singkat</label>
            <Textarea className="rounded-xl min-h-[100px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400">Durasi</label>
              <Input className="rounded-xl" placeholder="3 Bulan" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400">Harga (IDR)</label>
              <Input type="number" className="rounded-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-zinc-400">URL Gambar</label>
            <Input className="rounded-xl" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
          </div>
          <Button disabled={loading} className="w-full bg-amber-500 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg mt-4">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Simpan Kursus"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
