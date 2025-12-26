"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type News = {
  id: number
  title: string
  content: string
  quote?: string
  image: string
  category_id: number
}

type Category = {
  id: number
  name: string
}

export default function NewsManagementPage() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // States Form
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [quote, setQuote] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [image, setImage] = useState<File | null>(null)
  
  const [editing, setEditing] = useState<News | null>(null)
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      
      const [newsRes, catRes] = await Promise.all([
        fetch("https://backend.mejatika.com/api/news"),
        fetch("https://backend.mejatika.com/api/categories", { headers })
      ])
      
      const newsData = await newsRes.json()
      const catData = await catRes.json()
      
      setNewsList(Array.isArray(newsData) ? newsData : [])
      setCategories(Array.isArray(catData) ? catData : [])
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    
    formData.append("title", title)
    formData.append("content", content)
    formData.append("quote", quote || "")
    formData.append("category_id", categoryId)
    if (image) formData.append("image", image)

    let url = "https://backend.mejatika.com/api/news"
    let method = "POST"

    if (editing) {
      url = `https://backend.mejatika.com/api/news/${editing.id}`
      formData.append("_method", "PUT") // Mengikuti pola Slider kamu
      method = "POST" 
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      toast({
        title: "Gagal Simpan",
        description: err.message || "Periksa kembali inputan anda",
        variant: "destructive",
      })
      return
    }

    // Reset form sesuai pola Slider kamu
    setTitle("")
    setContent("")
    setQuote("")
    setCategoryId("")
    setImage(null)
    setEditing(null)
    setOpen(false)
    fetchData()

    toast({
      title: editing ? "Berita diupdate!" : "Berita disimpan!",
      description: "Data berhasil diperbarui di database.",
    })
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`https://backend.mejatika.com/api/news/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    
    if (res.ok) {
      fetchData()
      toast({ title: "Berhasil dihapus!" })
    } else {
      toast({ title: "Gagal hapus", variant: "destructive" })
    }
    setDeleteId(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Berita</h1>
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if(!val) { setEditing(null); setTitle(""); setContent(""); setQuote(""); setCategoryId(""); }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Tambah Berita</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Judul Berita</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label>Kategori</Label>
                <select 
                  className="w-full border p-2 rounded-md text-sm" 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Konten</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <div>
                <Label>Kutipan (Quote Majalah)</Label>
                <Input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Opsional" />
              </div>
              <div>
                <Label>Gambar Berita</Label>
                <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Update Berita" : "Simpan Berita"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Gambar</th>
              <th className="p-3 text-left">Judul</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((n) => (
              <tr key={n.id} className="border-b">
                <td className="p-3">
                  <img src={n.image} className="h-12 w-20 object-cover rounded" alt="" />
                </td>
                <td className="p-3 font-medium">{n.title}</td>
                <td className="p-3 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditing(n)
                    setTitle(n.title)
                    setContent(n.content)
                    setQuote(n.quote || "")
                    setCategoryId(String(n.category_id))
                    setOpen(true)
                  }}>
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(n.id)}>
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus berita ini?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Ya, Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
