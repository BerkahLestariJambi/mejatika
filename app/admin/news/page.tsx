"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const { toast } = useToast()

  // fetch data dari backend
  const fetchNews = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await res.json()
      setNews(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({ title: "Gagal ambil berita", description: String(err), variant: "destructive" })
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({ title: "Gagal ambil kategori", description: String(err), variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchNews()
    fetchCategories()
  }, [])

  // submit tambah / edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    if (image) formData.append("image", image)
    if (categoryId) formData.append("category_id", String(categoryId))

    let url = "https://backend.mejatika.com/api/news"
    let method: "POST" | "PUT" = "POST"

    if (editing) {
      url = `https://backend.mejatika.com/api/news/${editing.id}`
      formData.append("_method", "PUT")
      method = "POST"
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })

    if (res.ok) {
      toast({ title: editing ? "Berita berhasil diupdate!" : "Berita berhasil ditambahkan!" })
      setTitle("")
      setContent("")
      setImage(null)
      setCategoryId(null)
      setEditing(null)
      setOpenForm(false)
      fetchNews()
    } else {
      const err = await res.json()
      toast({ title: "Gagal simpan berita", description: JSON.stringify(err.errors), variant: "destructive" })
    }
  }

  // hapus berita
  const handleDelete = async (id: number) => {
    const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    if (res.ok) {
      toast({ title: "Berita berhasil dihapus!" })
      fetchNews()
    } else {
      toast({ title: "Gagal hapus berita", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">News Management</h1>
          <p className="text-muted-foreground">Create and manage news articles</p>
        </div>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent asChild>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
              </DialogHeader>
              <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder="Isi berita" value={content} onChange={(e) => setContent(e.target.value)} required />
              <select
                className="w-full border rounded p-2"
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
              >
                <option value="">Pilih Kategori</option>
                {Array.isArray(categories) &&
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              <Button type="submit">{editing ? "Update" : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>Manage your news articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(news) &&
              news.map((article) => {
                const category = categories.find((c) => c.id === article.categoryId)
                return (
                  <div key={article.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="h-20 w-32 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-balance">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">{category?.name ?? "Tanpa kategori"}</Badge>
                            <Badge variant={article.status === "published" ? "default" : "secondary"}>
                              {article.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(article)
                              setTitle(article.title)
                              setContent(article.content)
                              setCategoryId(article.categoryId)
                              setOpenForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Yakin hapus berita ini?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(article.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
               </CardContent>
      </Card>
    </div>
  )
}
