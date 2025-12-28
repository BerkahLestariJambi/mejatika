"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Calendar, Search, X, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

// IMPORT DINAMIS UNTUK REACT 19 COMPATIBILITY
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-md" />
})
import 'react-quill-new/dist/quill.snow.css'

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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

  // SweetAlert Toast Configuration
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'oklch(var(--card))',
    color: 'oklch(var(--foreground))'
  })

  // Toolbar Quill
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), [])

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

  // Filter Berita
  const filteredNews = useMemo(() => {
    return news.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [news, searchQuery])

  const resetForm = () => {
    setTitle(""); setContent(""); setQuote(""); 
    setImage(null); setPreviewUrl(null); 
    setCategoryId(""); setEditing(null);
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
        Toast.fire({ icon: 'success', title: editing ? 'Berita diperbarui' : 'Berita berhasil terbit' });
        setOpenForm(false);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal menyimpan data' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus berita ini?',
      text: "Data yang dihapus tidak dapat dipulihkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (res.ok) {
            Toast.fire({ icon: 'success', title: 'Berita telah dihapus' });
            fetchNews();
          }
        } catch (error) {
          Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
        }
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight">MANAGEMENT BERITA</h1>
          <p className="text-muted-foreground">Kelola semua artikel publikasi MEJATIKA.</p>
        </motion.div>

        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-xl shadow-lg hover:scale-105 transition-transform">
              <Plus className="mr-2 h-5 w-5" /> Tambah Berita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editing ? "Edit Berita" : "Buat Berita Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Judul Berita</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ketik judul..." />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Konten Utama</Label>
                <div className="prose-editor">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gambar Utama</Label>
                {previewUrl && <img src={previewUrl} className="h-44 w-full object-cover rounded-xl border mb-2 shadow-sm" alt="Preview" />}
                <Input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
                }} />
              </div>

              <Button type="submit" className="w-full h-12 text-lg shadow-md" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Perbarui" : "Posting Sekarang"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH BAR */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari judul atau kategori..." 
          className="pl-10 h-11 rounded-xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </motion.div>

      {/* TABLE SECTION */}
      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b text-xs font-bold uppercase text-muted-foreground">
                  <th className="px-6 py-4 text-left w-[60px]">No</th>
                  <th className="px-6 py-4 text-left">Detail Berita</th>
                  <th className="px-6 py-4 text-left">Kategori</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="relative">
                <AnimatePresence mode="popLayout">
                  {filteredNews.length > 0 ? (
                    filteredNews.map((item, index) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: index * 0.05 }}
                        className="group border-b last:border-0 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm border">
                              <img src={item.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            </div>
                            <div>
                              <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center mt-1 uppercase tracking-wider">
                                <Calendar className="h-3 w-3 mr-1" /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5">
                            {item.category?.name || "Umum"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-blue-200 hover:bg-blue-50" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content);
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image);
                              setOpenForm(true);
                            }}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-red-200 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10 opacity-20 mb-2" />
                          <p className="italic">Data berita tidak ditemukan...</p>
                        </div>
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
