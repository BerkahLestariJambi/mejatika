"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
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
  const [loading, setLoading] = useState(false)
  
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [quote, setQuote] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  
  const { toast } = useToast()

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
    setTitle(""); setContent(""); setQuote("");
    setImage(null); setPreview(null); setCategoryId(null); setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!categoryId) {
      setLoading(false);
      return toast({ title: "Kategori wajib dipilih", variant: "destructive" });
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("quote", quote || "");
    formData.append("category_id", String(categoryId));
    if (image) formData.append("image", image);

    let url = "https://backend.mejatika.com/api/news";
    if (editing) {
      url = `${url}/${editing.slug}`; // pakai slug
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST", // spoofing PUT
        headers: getAuthHeader(),
        body: formData,
      });

      if (res.ok) {
        toast({ title: editing ? "Berhasil diperbarui!" : "Berhasil disimpan!" });
        resetForm(); 
        setOpenForm(false); 
        fetchNews();
      } else {
        const errData = await res.json();
        toast({ title: "Gagal menyimpan", description: errData.message, variant: "destructive" });
      }
    } catch (error) { 
      toast({ title: "Error sistem", variant: "destructive" }); 
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/news/${slug}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) { toast({ title: "Berhasil dihapus!" }); fetchNews(); }
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder="Konten" value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-[100px]" />
              <Textarea placeholder="Kutipan (Quote)" value={quote} onChange={(e) => setQuote(e.target.value)} />
              
              <select className="w-full border rounded p-2" value={categoryId ?? ""} onChange={(e) => setCategoryId(Number(e.target.value))} required>
                <option value="">Pilih Kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
                if (file) setPreview(URL.createObjectURL(file));
              }} />

              {preview && <img src={preview} className="h-40 w-full object-cover rounded border" />}

              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Update Sekarang" : "Simpan Berita"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.slug} className="flex flex-col sm:flex-row gap-4 border-b pb-4">
                <img src={article.image || "/placeholder.svg"} className="h-24 w-full sm:w-40 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{article.title}</h3>
                    <Badge variant="outline">{categories.find(c => c.id === article.category_id)?.name || "Umum"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">"{article.quote || "Tidak ada kutipan"}"</p>
                                    <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(article);
                        setTitle(article.title);
                        setContent(article.content);
                        setQuote(article.quote || "");
                        setCategoryId(article.category_id);
                        setPreview(article.image);
                        setOpenForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Berita akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.slug)}>
                            Hapus
                          </AlertDialogAction>
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
