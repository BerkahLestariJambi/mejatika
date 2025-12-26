"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const { toast } = useToast()

  // fetch categories dari backend
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news-categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        toast({ title: "Gagal ambil kategori", description: "Respon tidak valid", variant: "destructive" })
        setCategories([])
      }
    } catch (err) {
      console.error("Fetch error:", err)
      toast({ title: "Gagal ambil kategori", description: "Periksa koneksi atau token", variant: "destructive" })
      setCategories([])
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // submit tambah / edit kategori
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", name)
    formData.append("slug", slug)

    let url = "https://backend.mejatika.com/api/news-categories"
    let method: "POST" | "PUT" = "POST"

    if (editing) {
      url = `https://backend.mejatika.com/api/news-categories/${editing.id}`
      formData.append("_method", "PUT")
      method = "POST"
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })

    if (res.ok) {
      toast({ title: editing ? "Kategori berhasil diupdate!" : "Kategori berhasil ditambahkan!" })
      setName("")
      setSlug("")
      setEditing(null)
      setOpenForm(false)
      fetchCategories()
    } else {
      const err = await res.json()
      toast({ title: "Gagal simpan kategori", description: JSON.stringify(err.errors), variant: "destructive" })
    }
  }

  // hapus kategori
  const handleDelete = async (id: number) => {
    const res = await fetch(`https://backend.mejatika.com/api/news-categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    if (res.ok) {
      toast({ title: "Kategori berhasil dihapus!" })
      fetchCategories()
    } else {
      toast({ title: "Gagal hapus kategori", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">News Categories</h1>
          <p className="text-muted-foreground">Manage news categories</p>
        </div>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                <Button type="submit">{editing ? "Update" : "Simpan"}</Button>
              </div>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Organize your news with categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">Slug: {category.slug ?? "-"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(category)
                        setName(category.name)
                        setSlug(category.slug)
                        setOpenForm(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yakin hapus kategori ini?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Belum ada kategori tersedia.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
