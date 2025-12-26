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
  AlertDialogDescription,
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

  // Ambil token dari localStorage
  const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Accept": "application/json"
  });

  const fetchNews = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  const fetchCategories = async () => {
    try {
      // WAJIB menggunakan header Authorization
      const res = await fetch("https://backend.mejatika.com/api/categories", {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle(""); setContent(""); setImage(null);
    setPreview(null); setCategoryId(null); setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return toast({ title: "Kategori wajib dipilih", variant: "destructive" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", String(categoryId));
    if (image) formData.append("image", image);

    let url = "https://backend.mejatika.com/api/news";
    if (editing) {
      url = `${url}/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Berhasil menyimpan data!" });
        resetForm(); setOpenForm(false); fetchNews();
      }
    } catch (error) { toast({ title: "Error sistem", variant: "destructive" }); }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) { toast({ title: "Berhasil dihapus!" }); fetchNews(); }
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Article</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder="Isi" value={content} onChange={(e) => setContent(e.target.value)} required />
              <select 
                className="w-full border rounded p-2" 
                value={categoryId ?? ""} 
                onChange={(e) => setCategoryId(Number(e.target.value))} 
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
                if (file) setPreview(URL.createObjectURL(file));
              }} />
              {preview && <img src={preview} className="h-40 w-full object-cover rounded" />}
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.id} className="flex gap-4 border-b pb-4">
                <img src={article.image || "/placeholder.svg"} className="h-20 w-32 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold">{article.title}</h3>
                  <Badge>{categories.find(c => c.id === article.category_id)?.name || "Umum"}</Badge>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setEditing(article); setTitle(article.title); setContent(article.content);
                        setCategoryId(article.category_id); setPreview(article.image); setOpenForm(true);
                    }}><Edit className="h-4 w-4" /></Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Hapus?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
