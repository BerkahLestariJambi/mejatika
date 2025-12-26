"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Slider = {
  id: number
  title: string
  description?: string
  image: string
  active?: boolean
}

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [editing, setEditing] = useState<Slider | null>(null)
  const [open, setOpen] = useState(false)

  const fetchSliders = async () => {
    const res = await fetch("https://backend.mejatika.com/api/sliders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    const data = await res.json()
    setSliders(data)
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    if (title) formData.append("title", title)
    if (description) formData.append("description", description)
    formData.append("active", active ? "1" : "0")
    if (image) formData.append("image", image)

    let url = "https://backend.mejatika.com/api/sliders"
    let method: "POST" | "PUT" = "POST"

    if (editing) {
      url = `https://backend.mejatika.com/api/sliders/${editing.id}`
      formData.append("_method", "PUT")
      method = "POST"
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      alert("Gagal simpan slider: " + JSON.stringify(err.errors))
      return
    }

    // reset form
    setTitle("")
    setDescription("")
    setActive(true)
    setImage(null)
    setEditing(null)
    setOpen(false)
    fetchSliders()

    alert(editing ? "Slider berhasil diupdate!" : "Slider berhasil disimpan!")
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`https://backend.mejatika.com/api/sliders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    if (res.ok) {
      fetchSliders()
      alert("Slider berhasil dihapus!")
    } else {
      alert("Gagal hapus slider")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Slider</h1>

      {/* Tabel Slider */}
      <table className="w-full border-collapse border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Judul</th>
            <th className="border p-2">Gambar</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sliders.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.id}</td>
              <td className="border p-2">{s.title}</td>
              <td className="border p-2">
                <img src={s.image} alt={s.title} className="h-12 w-24 object-cover" />
              </td>
              <td className="border p-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(s)
                    setTitle(s.title)
                    setDescription(s.description || "")
                    setActive(s.active ?? true)
                    setOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form Tambah/Edit Slider */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Tambah Slider</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Slider" : "Tambah Slider"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Aktif</Label>
              <Input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </div>
            <div>
              <Label>Gambar</Label>
              <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit">{editing ? "Update" : "Simpan"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
