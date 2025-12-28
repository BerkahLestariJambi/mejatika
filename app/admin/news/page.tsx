"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
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

// Sesuaikan tipe data dengan struktur API News Anda
type News = {
  id: number
  slug: string
  title: string
  content: string
  quote?: string
  image: string
  category_id: number
}

export default function NewsManagementPage() {
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  // Form States
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [quote, setQuote] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [image, setImage] = useState<File | null>(null)
  
  const [editing, setEditing] = useState<News | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchNews = async () => {
    const res = await fetch("https://backend.mejatika.com/api/news")
    const data = await res.json()
    setNews(Array.isArray(data) ? data : [])
  }

  const fetchCategories = async () => {
    const res = await fetch("https://backend.mejatika.com/api/categories", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchNews()
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("quote", quote || "")
    formData.append("category_id", categoryId)
    
    // Hanya tambahkan file jika ada file baru yang dipilih
    if (image) {
      formData.append("image", image)
    }

    let url = "https://backend.mejatika.com/api/news"
    let method: "POST" = "POST" // Selalu POST untuk FormData dengan File

    if (editing) {
      // Mengikuti pola SlidersPage yang berhasil
      url = `https://backend.mejatika.com/api/news/${editing.slug}`
      formData.append("_method", "PUT") // Trick agar Laravel mengenali ini sebagai PUT
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json" 
        },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Gagal menyimpan")
      }

      // Reset Form (Persis pola SlidersPage)
      setTitle("")
      setContent("")
      setQuote("")
      setCategoryId("")
      setImage(null)
      setEditing(null)
      setOpen(false)
      fetchNews()

      toast({
        title: editing ? "Berita berhasil diupdate!" : "Berita berhasil disimpan!",
        description: "Perubahan sudah tersimpan di database.",
      })
    } catch (error: any) {
      toast({
        title: "Terjadi Kesalahan",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteSlug) return
    const res = await fetch(`https://backend.mejatika.com/api/news/${deleteSlug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    if (res.ok) {
      fetchNews()
      toast({ title: "Berhasil dihapus!" })
    } else {
      toast({ title: "Gagal hapus berita", variant: "destructive" })
    }
    setDeleteSlug(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Berita</h1>
        
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
                setEditing(null);
                setTitle("");
                setContent("");
                setCategoryId("");
                setQuote("");
            }}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Berita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label>Konten</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required className="h-32" />
              </div>
              <div>
                <Label>Kutipan (Opsional)</Label>
                <Input value={quote} onChange={(e) => setQuote(e.target.value)} />
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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Gambar {editing && "(Kosongkan jika tidak ingin ganti)"}</Label>
                <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Update Berita" : "Simpan Berita"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Berita */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Gambar</th>
              <th className="p-3">Judul</th>
              <th className="p-3">Kategori</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {news.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <img src={n.image} alt="" className="w-20 h-12 object-cover rounded" />
                </td>
                <td className="p-3 font-medium">{n.title}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {categories.find(c => c.id === n.category_id)?.name || n.category_id}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(n)
                      setTitle(n.title)
                      setContent(n.content)
                      setQuote(n.quote || "")
                      setCategoryId(String(n.category_id))
                      setOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteSlug(n.slug)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus berita ini?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">Hapus</AlertDialogAction>
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
