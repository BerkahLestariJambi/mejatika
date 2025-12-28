"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react"
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // State untuk Preview
  const [categoryId, setCategoryId] = useState("")
  
  const { toast } = useToast()

  // Handle Image Change & Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setQuote("")
    setImage(null)
    setPreviewUrl(null)
    setCategoryId("")
    setEditing(null)
  }

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

    let url = "https://backend.mejatika.com/api/news";
    if (editing) {
      url = `https://backend.mejatika.com/api/news/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
        body: formData,
      });

      if (res.ok) {
        toast({ title: editing ? "Berhasil diperbarui!" : "Berhasil disimpan!" });
        resetForm(); 
        setOpenForm(false); 
        fetchNews();
      } else {
        const result = await res.json();
        toast({ title: "Gagal", description: result.message, variant: "destructive" });
      }
    } catch (error) { 
      toast({ title: "Error", description: "Terjadi kesalahan sistem", variant: "destructive" }); 
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
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Konten Utama</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-[150px]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring" 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Kutipan (Optional)</Label>
                  <Input value={quote} onChange={(e) => setQuote(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Gambar Unggulan</Label>
                
                {/* PREVIEW BOX */}
                <div className="relative mt-2 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted/30 min-h-[200px]">
                  {previewUrl ? (
                    <div className="relative w-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-[250px] w-full object-contain rounded-md" 
                      />
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg"
                        onClick={() => { setImage(null); setPreviewUrl(editing?.image || null); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground italic">Belum ada gambar dipilih</p>
                    </div>
                  )}
                </div>

                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="cursor-pointer"
                />
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
                {news.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <img 
                        src={article.image || "/placeholder.svg"} 
                        className="h-16 w-16 object-cover rounded-md border" 
                      />
                    </td>
                    <td className="p-4 font-medium">
                        {article.title}
                        <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {categories.find(c => c.id === Number(article.category_id))?.name || "News"}
                        </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(article);
                            setTitle(article.title);
                            setContent(article.content);
                            setQuote(article.quote || "");
                            setCategoryId(String(article.category_id));
                            setPreviewUrl(article.image); // Set preview ke gambar lama saat edit
                            setOpenForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Hapus?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>Ya</AlertDialogAction>
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
