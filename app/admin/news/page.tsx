"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Calendar, Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

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
  const [searchQuery, setSearchQuery] = useState("") // State untuk pencarian
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

  const { Toast } = useMemo(() => ({
    Toast: Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })
  }), [])

  // Fungsi Filter Berita berdasarkan Search Query
  const filteredNews = useMemo(() => {
    return news.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [news, searchQuery])

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
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus berita?',
      text: "Data akan hilang permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (res.ok) {
            Toast.fire({ icon: 'success', title: 'Berita dihapus' });
            fetchNews();
          }
        } catch (error) { Toast.fire({ icon: 'error', title: 'Gagal menghapus' }); }
      }
    })
  }

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
        setOpenForm(false);
        setEditing(null);
        setTitle(""); setContent(""); setPreviewUrl(null);
        fetchNews();
        Toast.fire({ icon: 'success', title: 'Data berhasil disimpan' });
      }
    } catch (error) { Toast.fire({ icon: 'error', title: 'Error' });
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight text-foreground">KELOLA BERITA</h1>
          <p className="text-muted-foreground">Publikasikan artikel dan info terbaru MEJATIKA.</p>
        </motion.div>

        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-5 w-5" /> Berita Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Form sama seperti sebelumnya */}
            <DialogHeader><DialogTitle>Editor Berita</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Judul</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <select className="w-full h-10 border rounded-md px-3 bg-background" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Isi Berita</Label>
                  <div className="prose-editor"><ReactQuill theme="snow" value={content} onChange={setContent} /></div>
               </div>
               <div className="space-y-2">
                  <Label>Gambar</Label>
                  {previewUrl && <img src={previewUrl} className="h-40 w-full object-cover rounded-lg border mb-2" />}
                  <Input type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
                  }} />
               </div>
               <Button type="submit" className="w-full h-12" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : "Simpan Berita"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH BAR SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative group max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Cari judul berita atau kategori..." 
          className="pl-10 pr-10 h-11 bg-card border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* TABLE SECTION */}
      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Detail Berita</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Kategori</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredNews.length > 0 ? (
                    filteredNews.map((item, index) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group border-b last:border-0 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={item.image} className="h-12 w-16 object-cover rounded-lg shadow-sm group-hover:rotate-2 transition-transform" />
                            <div className="max-w-[300px]">
                              <p className="font-bold text-sm line-clamp-1">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" /> {new Date().toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-primary/10 text-primary border-none hover:bg-primary hover:text-white transition-all font-medium">
                            {item.category?.name || "Umum"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content);
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image);
                              setOpenForm(true);
                            }}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-muted-foreground italic">
                        Data berita tidak ditemukan...
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
