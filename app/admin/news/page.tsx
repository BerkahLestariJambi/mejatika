"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, // <-- Komponen yang tadi menyebabkan error
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchNews = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news", {
        headers: { "Accept": "application/json" },
      })
      const data = await res.json()
      setNews(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/categories", {
        headers: { "Accept": "application/json" },
      })
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNews()
    fetchCategories()
  }, [])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setImage(null)
    setPreview(null)
    setCategoryId(null)
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      toast({ title: "Kategori wajib dipilih", variant: "destructive" })
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("category_id", String(categoryId))
    
    if (image) {
      formData.append("image", image)
    }

    let url = "https://backend.mejatika.com/api/news"
    if (editing) {
      url = `${url}/${editing.id}`
      formData.append("_method", "PUT")
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
        body: formData,
      })

      if (res.ok) {
        toast({ title: editing ? "Berita berhasil diupdate!" : "Berita berhasil ditambahkan!" })
        resetForm()
        setOpenForm(false)
        fetchNews()
      } else {
        const err = await res.json()
        toast({ title: "Gagal simpan berita", description: err.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Terjadi kesalahan sistem", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
      })
      if (res.ok) {
        toast({ title: "Berita berhasil dihapus!" })
        fetchNews()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">News Management</h1>
          <p className="text-muted-foreground">Kelola artikel berita Anda di sini.</p>
        </div>
        <Dialog 
          open={openForm} 
          onOpenChange={(open) => {
            setOpenForm(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
              <DialogDescription>Isi formulir berikut untuk menyimpan berita.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea 
                placeholder="Isi berita" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
                className="min-h-[120px]"
              />
              <select
                className="w-full border rounded p-2 bg-background text-sm"
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gambar Berita</label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setImage(file)
                      if (file) setPreview(URL.createObjectURL(file))
                    }}
                />
              </div>
              {preview && (
                <div className="relative h-40 w-full overflow-hidden rounded-md border">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>Batal</Button>
                <Button type="submit">{editing ? "Update Berita" : "Simpan Berita"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
          <CardDescription>Semua berita yang telah diterbitkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((article) => {
              const category = categories.find((c) => c.id === article.category_id)
              return (
                <div key={article.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                <img
  src={article.image ? `https://backend.mejatika.com/storage/${article.image}` : "/placeholder.svg"}
  alt={article.title}
  className="h-20 w-32 rounded object-cover flex-shrink-0 bg-muted"
  onError={(e) => {
    // Jika gambar tetap tidak ditemukan, gunakan placeholder
    (e.target as HTMLImageElement).src = "/placeholder.svg";
  }}
/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold leading-tight text-base truncate">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.content}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary">{category?.name ?? "Umum"}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(article)
                            setTitle(article.title)
                            setContent(article.content)
                            setCategoryId(article.category_id)
                            setPreview(article.image)
                            setOpenForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                              <AlertDialogDescription>Data ini akan dihapus permanen dari server.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive text-white hover:bg-destructive/90">
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {news.length === 0 && <p className="text-center py-10 text-muted-foreground">Tidak ada data berita.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
