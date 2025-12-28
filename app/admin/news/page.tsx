"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  const [loading, setLoading] = useState(false)
  
  // Form States
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [quote, setQuote] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState("")
  
  const { toast } = useToast()

  // Helpers
  const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Accept": "application/json"
  });

  const fetchNews = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch News Error:", err); 
    }
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
    } catch (err) { 
      console.error("Fetch Categories Error:", err); 
    }
  }

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle(""); 
    setContent(""); 
    setQuote("");
    setImage(null); 
    setCategoryId(""); 
    setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("quote", quote || "");
    formData.append("category_id", categoryId);
    
    if (image) {
      formData.append("image", image);
    }

    // Penentuan URL: Gunakan ID untuk update agar tidak kena Error 405
    let url = "https://backend.mejatika.com/api/news";
    
    if (editing) {
      // Sama seperti SlidersPage: Target ID + Method Spoofing PUT
      url = `https://backend.mejatika.com/api/news/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Selalu POST untuk kirim FormData
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast({ title: editing ? "Berhasil diperbarui!" : "Berhasil disimpan!" });
        resetForm(); 
        setOpenForm(false); 
        fetchNews();
      } else {
        toast({ 
            title: "Gagal menyimpan", 
            description: result.message || "Periksa kembali data Anda", 
            variant: "destructive" 
        });
      }
    } catch (error) { 
      toast({ title: "Error sistem", description: "Tidak dapat terhubung ke server", variant: "destructive" }); 
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
      if (res.ok) { 
        toast({ title: "Berhasil dihapus!" }); 
        fetchNews(); 
      } else {
        toast({ title: "Gagal menghapus", variant: "destructive" });
      }
    } catch (err) { 
        console.error("Delete Error:", err); 
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Berita</h1>
        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-semibold"><Plus className="mr-2 h-4 w-4" /> Tambah Berita</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Artikel Berita" : "Buat Artikel Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Judul Berita</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul..." required />
              </div>

              <div className="space-y-2">
                <Label>Konten Utama</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis isi berita..." required className="min-h-[200px]" />
              </div>

              <div className="space-y-2">
                <Label>Kutipan (Optional)</Label>
                <Input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Kutipan singkat..." />
              </div>
              
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Gambar Unggulan {editing && <span className="text-[10px] text-muted-foreground ml-2">(Kosongkan jika tidak ganti)</span>}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </div>

              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Simpan Perubahan" : "Publikasikan Berita"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="p-4 w-24">Gambar</th>
                  <th className="p-4">Informasi Berita</th>
                  <th className="p-4 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">Tidak ada berita ditemukan.</td>
                  </tr>
                )}
                {news.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 vertical-top">
                      <img 
                        src={article.image || "/placeholder.svg"} 
                        alt="" 
                        className="h-16 w-16 object-cover rounded-md border bg-muted" 
                      />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base leading-tight">{article.title}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            {categories.find(c => c.id === Number(article.category_id))?.name || "Uncategorized"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-1 text-xs">{article.content}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setEditing(article);
                            setTitle(article.title);
                            setContent(article.content);
                            setQuote(article.quote || "");
                            setCategoryId(String(article.category_id));
                            setOpenForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Judul: <strong>{article.title}</strong> akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(article.slug)}
                              >
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
