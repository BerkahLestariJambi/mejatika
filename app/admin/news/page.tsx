"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react"
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

// --- IMPORT REACT QUILL DINAMIS ---
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-md" />
})
import 'react-quill/dist/quill.snow.css'

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form States
  const [editing, setEditing] = useState<any | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("") // Akan berisi HTML string
  const [quote, setQuote] = useState("")     // Akan berisi HTML string
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState("")
  
  const { toast } = useToast()

  // Konfigurasi Toolbar Editor
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'clean']
    ],
  }), [])

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
      const res = await fetch("https://backend.mejatika.com/api/categories", { headers: getAuthHeader() });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content); // Mengirim HTML string
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
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Accept": "application/json" },
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
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Artikel Berita" : "Buat Artikel Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              
              <div className="space-y-2">
                <Label className="text-base">Judul Berita</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul utama..." required />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Konten Utama</Label>
                <div className="prose-editor">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
                    modules={modules}
                    className="h-64 mb-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                  <Label>Kutipan Singkat (Optional)</Label>
                  <div className="h-24">
                     <ReactQuill 
                        theme="snow" 
                        value={quote} 
                        onChange={setQuote}
                        modules={{ toolbar: [['bold', 'italic', 'underline']] }}
                        className="h-16"
                     />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-base">Gambar Unggulan</Label>
                <div className="relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 min-h-[200px]">
                  {previewUrl ? (
                    <div className="relative w-full flex justify-center">
                      <img src={previewUrl} className="max-h-[300px] rounded-lg shadow-md" alt="Preview" />
                      <Button 
                        type="button" variant="destructive" size="icon" 
                        className="absolute -top-3 -right-3 rounded-full"
                        onClick={() => { setImage(null); setPreviewUrl(editing?.image || null); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Klik input di bawah untuk pilih gambar</p>
                    </div>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Update Berita" : "Terbitkan Berita Sekarang"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-4 w-24">Gambar</th>
                  <th className="p-4">Informasi Berita</th>
                  <th className="p-4 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <img src={article.image || "/placeholder.svg"} className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-base text-slate-800">{article.title}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">
                          {categories.find(c => c.id === Number(article.category_id))?.name || "General"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline" size="icon" className="text-blue-600 border-blue-200 bg-blue-50/50"
                          onClick={() => {
                            setEditing(article);
                            setTitle(article.title);
                            setContent(article.content);
                            setQuote(article.quote || "");
                            setCategoryId(String(article.category_id));
                            setPreviewUrl(article.image);
                            setOpenForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-600 border-red-200 bg-red-50/50"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Hapus Berita?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-red-600">Ya, Hapus</AlertDialogAction>
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
