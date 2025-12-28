"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Calendar, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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

// IMPORT DINAMIS UNTUK REACT 19
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-md" />
})
import 'react-quill-new/dist/quill.snow.css'

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState("")
  
  const { toast } = useToast()

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), [])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setQuote("")
    setImage(null)
    setPreviewUrl(null)
    setCategoryId("")
    setEditing(null)
  }

  const fetchNews = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://backend.mejatika.com/api/categories", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
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
    if (image) formData.append("image", image);

    let url = "https://backend.mejatika.com/api/news";
    if (editing) {
      url = `${url}/${editing.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Berhasil!", description: "Data berita telah diperbarui." });
        setOpenForm(false);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      toast({ title: "Gagal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast({ title: "Terhapus", description: "Berita telah dihapus." });
        fetchNews();
      }
    } catch (error) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Berita</h1>
          <p className="text-muted-foreground">Atur publikasi berita dan artikel Anda di sini.</p>
        </div>
        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Tambah Berita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editing ? "Edit Berita" : "Buat Berita Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Judul Berita</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Masukkan judul..." className="focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Kategori</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-primary"
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
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Isi Berita</Label>
                <div className="prose-editor">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Kutipan Singkat (Quote)</Label>
                <div className="prose-editor h-28">
                  <ReactQuill theme="snow" value={quote} onChange={setQuote} className="h-20" modules={{ toolbar: [['bold', 'italic']] }} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Gambar Utama</Label>
                {previewUrl && <img src={previewUrl} className="h-48 w-full object-cover rounded-xl border shadow-sm mb-2" alt="Preview" />}
                <Input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }} className="cursor-pointer" />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full text-lg h-12 shadow-lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Perbarui Berita" : "Publikasikan Berita"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CARD LAYOUT UNTUK DAFTAR BERITA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card border rounded-xl border-dashed">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">Belum ada berita yang dipublikasikan.</p>
          </div>
        ) : (
          news.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={item.title} 
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm border-primary/20">
                    <Tag className="w-3 h-3 mr-1" />
                    {item.category?.name || "Uncategorized"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 space-y-2">
                <CardTitle className="line-clamp-2 text-lg leading-snug group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground gap-3">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between gap-2 border-t mt-auto bg-muted/20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => {
                    setEditing(item);
                    setTitle(item.title);
                    setContent(item.content);
                    setQuote(item.quote || "");
                    setCategoryId(String(item.category_id));
                    setPreviewUrl(item.image);
                    setOpenForm(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 hover:bg-red-50 hover:text-red-600 transition-colors text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan dan akan menghapus data berita secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(item.id)} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus Permanen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
