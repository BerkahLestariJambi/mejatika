"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Search, X, ArrowLeft, Quote as QuoteIcon, Save, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

// IMPORT DINAMIS UNTUK REACT 19 COMPATIBILITY
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-60 w-full bg-muted animate-pulse rounded-xl" />
})
import 'react-quill-new/dist/quill.snow.css'

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditorOpen, setIsEditorOpen] = useState(false) // Toggle antara List dan Form
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
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'table': [] }],
      ['link', 'blockquote'],
      ['clean']
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
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [news, searchQuery])

  const resetForm = () => {
    setTitle(""); setContent(""); setQuote(""); 
    setImage(null); setPreviewUrl(null); 
    setCategoryId(""); setEditing(null);
    setIsEditorOpen(false);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Toast.fire({ icon: 'error', title: 'File Terlalu Besar (Maks 2MB)' });
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
        resetForm();
        fetchNews();
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Kesalahan server' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus berita?',
      text: "Data akan hilang permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`https://backend.mejatika.com/api/news/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) { fetchNews(); Toast.fire({ icon: 'success', title: 'Terhapus!' }); }
      }
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      
      <AnimatePresence mode="wait">
        {!isEditorOpen ? (
          /* TAMPILAN LIST BERITA (FULL SCREEN) */
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white">Management <span className="text-amber-500">Warta</span></h1>
                <p className="text-zinc-500 text-sm font-medium">Total {news.length} Artikel Terbit</p>
              </div>
              <Button onClick={() => setIsEditorOpen(true)} className="bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest transition-all">
                <Plus className="mr-2 h-5 w-5" /> Tulis Berita Baru
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input 
                placeholder="Cari judul berita atau kategori..." 
                className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Info Warta</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Kategori</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {filteredNews.map((item) => (
                      <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-16 w-24 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm shrink-0">
                              <img src={item.image || "https://placehold.co/200"} className="h-full w-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-black text-zinc-900 dark:text-white leading-tight mb-1 group-hover:text-amber-600 transition-colors uppercase italic">{item.title}</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase">
                            {item.category?.name || 'Umum'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 text-blue-600" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content); setQuote(item.quote || "");
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image); setIsEditorOpen(true);
                            }}><Edit className="h-5 w-5" /></Button>
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* TAMPILAN EDITOR FORM (FULL SCREEN) */
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" onClick={resetForm} className="rounded-full hover:bg-white gap-2 font-bold text-zinc-500">
                <ArrowLeft className="h-5 w-5" /> Batal & Kembali
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Mode Editor Aktif</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="p-8 md:p-12 space-y-10">
                  
                  {/* Judul Berita */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 ml-1">Judul Utama Warta</Label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      placeholder="Tulis judul yang provokatif dan menarik..." 
                      className="h-20 text-2xl md:text-4xl font-black uppercase italic border-none bg-zinc-50 dark:bg-zinc-800 rounded-[1.5rem] px-8 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Kategori Berita</Label>
                      <select 
                        className="w-full h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Quote / Highlight</Label>
                      <div className="relative">
                        <QuoteIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                        <Input 
                          value={quote} 
                          onChange={(e) => setQuote(e.target.value)} 
                          placeholder="Kutipan penting untuk slider..." 
                          className="h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gambar Cover */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Gambar Cover (Maks 2MB)</Label>
                    <div className="group relative h-64 w-full rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-amber-500">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" onClick={() => setPreviewUrl(null)} variant="destructive" className="rounded-full font-black uppercase text-[10px] tracking-widest">Ganti Gambar</Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Klik untuk upload foto utama</p>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Konten Editor */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Narasi Lengkap</Label>
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] overflow-hidden p-2 border-none">
                      <ReactQuill 
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        modules={modules} 
                        className="bg-transparent"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-20 bg-zinc-900 hover:bg-amber-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl transition-all" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                      <div className="flex items-center gap-3">
                        <Save className="h-5 w-5" />
                        {editing ? "Perbarui Warta Ini" : "Terbitkan Warta Sekarang"}
                      </div>
                    )}
                  </Button>
                </div>
              </Card>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; padding: 20px !important; background: #f4f4f5; border-radius: 1.5rem 1.5rem 0 0; }
        .ql-container.ql-snow { border: none !important; min-height: 400px; font-family: inherit !important; font-size: 1.1rem !important; }
        .dark .ql-toolbar.ql-snow { background: #27272a; }
        .ql-editor { padding: 30px !important; line-height: 1.8 !important; }
        .ql-editor table { border-collapse: collapse; width: 100%; border: 1px solid #ddd; }
        .ql-editor td { border: 1px solid #ddd; padding: 10px; }
      `}</style>
    </div>
  )
}
