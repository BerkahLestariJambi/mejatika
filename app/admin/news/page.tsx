"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Quote, ImageIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  const [loading, setLoading] = useState(false)
  
  // States untuk Form
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
    setTitle(""); 
    setContent(""); 
    setQuote("");
    setImage(null);
    setPreview(null); 
    setCategoryId(null); 
    setEditing(null);
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
    formData.append("quote", quote || ""); // Menyimpan quote ke backend
    formData.append("category_id", String(categoryId));
    
    // Hanya kirim gambar jika ada file baru yang dipilih
    if (image) {
      formData.append("image", image);
    }

    let url = "https://backend.mejatika.com/api/news";
    
    // LOGIKA EDIT (Spoofing Method PUT untuk Laravel)
    if (editing) {
      url = `${url}/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Tetap POST karena menggunakan _method PUT
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
          // Content-Type jangan diatur manual untuk FormData
        },
        body: formData,
      });

      if (res.ok) {
        toast({ title: editing ? "Berhasil diperbarui!" : "Berhasil disimpan!" });
        resetForm(); 
        setOpenForm(false); 
        fetchNews();
      } else {
        const errData = await res.json();
        toast({ 
          title: "Gagal menyimpan", 
          description: errData.message || "Terjadi kesalahan pada server", 
          variant: "destructive" 
        });
      }
    } catch (error) { 
      toast({ title: "Error sistem", variant: "destructive" }); 
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) { 
        toast({ title: "Berhasil dihapus!" }); 
        fetchNews(); 
      }
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">News Management</h1>
        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editing ? "Edit Artikel" : "Tambah Artikel Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase opacity-70">Judul Berita</label>
                <Input 
                  placeholder="Masukkan judul yang menarik..." 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase opacity-70">Konten Utama</label>
                <Textarea 
                  placeholder="Tulis berita lengkap di sini..." 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase opacity-70 flex items-center gap-2">
                  <Quote className="w-3 h-3" /> Kutipan Penting (Quote)
                </label>
                <Textarea 
                  placeholder="Masukkan kutipan yang akan tampil di halaman terakhir majalah..." 
                  value={quote} 
                  onChange={(e) => setQuote(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase opacity-70">Kategori</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-background" 
                    value={categoryId ?? ""} 
                    onChange={(e) => setCategoryId(Number(e.target.value))} 
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase opacity-70">Gambar Cover</label>
                  <Input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }} />
                </div>
              </div>

              {preview && (
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed p-1">
                  <img src={preview} className="h-48 w-full object-cover rounded-lg" alt="preview" />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-[10px] backdrop-blur-sm flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Preview Gambar
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editing ? "Update Sekarang" : "Simpan & Publikasikan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-10 opacity-40 italic">Belum ada berita yang diterbitkan.</div>
            ) : news.map((article) => (
              <div key={article.id} className="flex flex-col sm:flex-row gap-4 border-b border-black/5 dark:border-white/5 pb-4 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors p-2 rounded-xl">
                <div className="relative h-24 w-full sm:w-40 shrink-0 overflow-hidden rounded-lg shadow-inner">
                  <img src={article.image || "/placeholder.svg"} className="h-full w-full object-cover" alt="news cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold leading-tight line-clamp-2">{article.title}</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter">
                      {categories.find(c => c.id === article.category_id)?.name || "Umum"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 italic opacity-70">
                    {article.quote || "Tidak ada kutipan."}
                  </p>
                  
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-full border-primary/20 hover:bg-primary/10" onClick={() => {
                        setEditing(article); 
                        setTitle(article.title); 
                        setContent(article.content);
                        setQuote(article.quote || "");
                        setCategoryId(article.category_id); 
                        setPreview(article.image); 
                        setOpenForm(true);
                    }}>
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Berita Ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Berita akan dihapus permanen dari database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive hover:bg-destructive/90">Hapus Permanen</AlertDialogAction>
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
