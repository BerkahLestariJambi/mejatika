"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [quote, setQuote] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchNews = async () => {
    const res = await fetch("https://backend.mejatika.com/api/news");
    const data = await res.json();
    setNews(data);
  }

  useEffect(() => { fetchNews(); /* Ambil kategori juga di sini */ }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("quote", quote || "");
    formData.append("category_id", String(categoryId));
    if (image) formData.append("image", image);

    let url = "https://backend.mejatika.com/api/news";
    if (editing) {
      // MENGGUNAKAN ENDPOINT UNIK
      url = `https://backend.mejatika.com/api/news-update/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Berhasil disimpan" });
        setOpenForm(false);
        fetchNews();
      } else {
        const err = await res.json();
        toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Koneksi", variant: "destructive" });
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Article
        </Button>
      </div>

      {/* Tabel / List Berita */}
      <Card>
        <CardContent className="p-0">
          {news.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-4 items-center">
                <img src={item.image} className="h-12 w-12 object-cover rounded" />
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs text-muted-foreground italic line-clamp-1">{item.quote}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                setEditing(item);
                setTitle(item.title);
                setContent(item.content);
                setQuote(item.quote || "");
                setCategoryId(item.category_id);
                setPreview(item.image);
                setOpenForm(true);
              }}><Edit className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Berita</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Konten" value={content} onChange={(e) => setContent(e.target.value)} required />
            <Textarea placeholder="Kutipan Penting (Quote)" value={quote} onChange={(e) => setQuote(e.target.value)} />
            {/* Input Category Select & File di sini */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
