"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Calendar, Search, X, Image as ImageIcon, Quote as QuoteIcon } from "lucide-react"
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

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
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
      title: 'Hapus berita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (res.ok) { fetchNews(); }
        } catch (error) { console.error(error); }
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-amber-600">MANAGEMENT BERITA</h1>
          <p className="text-muted-foreground">Arsip Warta Digital Mejatika</p>
        </motion.div>

        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Terbitkan Warta
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none overflow-visible">
            {/* GULUNGAN ATAS FORM (BATIK CERAH) */}
            <div className="relative z-50 w-[95%] mx-auto">
              <div className="w-full h-14 bg-amber-500 rounded-full shadow-xl flex items-center justify-between px-10 relative overflow-hidden border-b-4 border-amber-700/30">
                <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">EDITOR WARTA</span>
                <span className="text-[10px] font-black text-amber-900/50 uppercase tracking-[0.4em] z-10 italic">MEJATIKA</span>
              </div>
            </div>

            {/* BODY FORM (KERTAS GULUNG) */}
            <div className="bg-[#fffdfa] dark:bg-zinc-950 -mt-6 pt-12 pb-10 px-8 md:px-12 rounded-b-xl shadow-2xl relative border-x border-black/5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul 14pt */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Judul Berita (Maksimal 14pt tampilan)</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    placeholder="Masukkan judul utama..." 
                    className="text-[18px] font-black uppercase tracking-wider border-amber-200 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Kategori</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={categoryId} 
                      onChange={(e) => setCategoryId(e.target.value)} 
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                       <QuoteIcon className="w-3 h-3" /> Quote Highlight
                    </Label>
                    <Input 
                      value={quote} 
                      onChange={(e) => setQuote(e.target.value)} 
                      placeholder="Kutipan penting artikel..." 
                      className="border-amber-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Gambar Utama</Label>
                  {previewUrl && <img src={previewUrl} className="h-40 w-full object-cover rounded-lg mb-2 shadow-inner border border-amber-100" alt="Preview" />}
                  <Input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
                  }} className="cursor-pointer file:bg-amber-50 file:text-amber-700 file:border-none" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Isi Berita</Label>
                  <div className="bg-white rounded-md border border-amber-200 overflow-hidden">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest h-12" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "SIMPAN PERUBAHAN" : "TERBITKAN SEKARANG"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
        <Input 
          placeholder="Cari warta..." 
          className="pl-10 rounded-full border-amber-100 bg-white shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100 text-[10px] font-black uppercase tracking-widest text-amber-700">
                <th className="px-6 py-4 text-left">Warta</th>
                <th className="px-6 py-4 text-left">Kategori</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((item) => (
                <tr key={item.id} className="border-b border-zinc-50 hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} className="h-10 w-14 object-cover rounded shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-sm text-zinc-800 line-clamp-1 group-hover:text-amber-600">{item.title}</p>
                        <p className="text-[9px] uppercase tracking-tighter text-muted-foreground italic">Update: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-amber-100 text-amber-700 text-[9px] border-none">{item.category?.name}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => {
                        setEditing(item); setTitle(item.title); setContent(item.content); setQuote(item.quote || "");
                        setCategoryId(String(item.category_id)); setPreviewUrl(item.image); setOpenForm(true);
                      }}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
