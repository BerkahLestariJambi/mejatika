"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, Quote as QuoteIcon, Save, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

// IMPORT DINAMIS UNTUK COMPATIBILITY
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-60 w-full bg-zinc-100 animate-pulse rounded-[2rem]" />
})
import 'react-quill-new/dist/quill.snow.css'

export default function NewsManagementPage() {
  const [news, setNews] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
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

  // 1. AMBIL DATA BERITA (DIPERBAIKI)
  const fetchNews = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch("https://backend.mejatika.com/api/news");
      const json = await res.json();
      
      // Handle struktur Laravel { success: true, data: [...] }
      if (json.success && Array.isArray(json.data)) {
        setNews(json.data);
      } else if (Array.isArray(json)) {
        setNews(json);
      } else {
        setNews([]);
      }
    } catch (err) { 
      console.error("Fetch Error:", err);
      setNews([]);
    } finally {
      setFetching(false)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/categories", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : (data.data || []));
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [fetchNews]);

  // 2. FILTER PENCARIAN
  const filteredNews = useMemo(() => {
    if (!Array.isArray(news)) return [];
    return news.filter((item) =>
      item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        Toast.fire({ icon: 'error', title: 'Maksimal 2MB bos!' });
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
        Toast.fire({ icon: 'success', title: 'Warta Berhasil Disimpan!' });
        resetForm();
        fetchNews();
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal Simpan!' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Warta?',
      text: "Data akan hilang dari peradaban!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
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

  // Pembersih teks untuk excerpt di tabel
  const cleanExcerpt = (html: string) => {
    return html?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 60) + "...";
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans">
      
      <AnimatePresence mode="wait">
        {!isEditorOpen ? (
          /* ============================================================
             LIST VIEW (Full Screen)
             ============================================================ */
          <motion.div 
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white">
                  Warta <span className="text-amber-500">Mejatika</span>
                </h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Pusat Kendali Informasi Digital</p>
              </div>
              <Button onClick={() => setIsEditorOpen(true)} className="bg-zinc-900 hover:bg-amber-600 text-white rounded-[1.5rem] h-16 px-10 font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95">
                <Plus className="mr-3 h-6 w-6" /> Tulis Baru
              </Button>
            </div>

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="Cari berdasarkan judul atau kategori..." 
                className="pl-16 h-20 rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 text-xl font-medium focus:ring-2 focus:ring-amber-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                      <th className="px-10 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Konten Warta</th>
                      <th className="px-10 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Kategori</th>
                      <th className="px-10 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {fetching ? (
                      <tr>
                        <td colSpan={3} className="py-20 text-center">
                          <Loader2 className="h-10 w-10 animate-spin text-amber-500 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Menarik Data...</p>
                        </td>
                      </tr>
                    ) : filteredNews.map((item) => (
                      <tr key={item.id} className="group hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-all">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-8">
                            <div className="h-20 w-32 rounded-[1.5rem] overflow-hidden bg-zinc-100 shadow-md shrink-0 border-4 border-white dark:border-zinc-800">
                              <img src={item.image || "https://placehold.co/200"} className="h-full w-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-black text-xl text-zinc-900 dark:text-white leading-none mb-2 group-hover:text-amber-600 transition-colors uppercase italic tracking-tighter">{item.title}</p>
                              <p className="text-xs text-zinc-400 font-medium">{cleanExcerpt(item.content)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <Badge className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                            {item.category?.name || 'Umum'}
                          </Badge>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-amber-50 text-amber-600" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content); setQuote(item.quote || "");
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image); setIsEditorOpen(true);
                            }}><Edit className="h-6 w-6" /></Button>
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-red-50 text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-6 w-6" /></Button>
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
          /* ============================================================
             EDITOR VIEW (Full Screen)
             ============================================================ */
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <Button variant="ghost" onClick={resetForm} className="rounded-full h-12 px-6 hover:bg-white gap-3 font-black uppercase text-[10px] tracking-widest text-zinc-500">
                <ArrowLeft className="h-5 w-5" /> Batal & Kembali
              </Button>
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Mode <span className="text-amber-500">Penyunting</span></h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 pb-20">
              <Card className="border-none shadow-[0_30px_90px_rgba(0,0,0,0.1)] rounded-[3.5rem] bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="p-10 md:p-16 space-y-12">
                  
                  {/* INPUT JUDUL RAKSASA */}
                  <div className="space-y-4 text-center md:text-left">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600">Headlines Warta</Label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      placeholder="KETIK JUDUL BERITA DI SINI..." 
                      className="h-24 md:h-32 text-3xl md:text-6xl font-black uppercase italic border-none bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] px-10 focus:ring-4 focus:ring-amber-500/20 placeholder:opacity-20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Pilih Kanal Kategori</Label>
                      <select 
                        className="w-full h-16 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800 border-none px-8 font-black uppercase text-[11px] tracking-widest outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        required
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Pesan Intisari (Quote)</Label>
                      <div className="relative">
                        <QuoteIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                        <Input 
                          value={quote} 
                          onChange={(e) => setQuote(e.target.value)} 
                          placeholder="Kutipan penting artikel..." 
                          className="h-16 pl-14 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800 border-none font-bold italic"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AREA GAMBAR COVER */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Visual Utama (Maks 2MB)</Label>
                    <div className="group relative h-[350px] w-full rounded-[3rem] bg-zinc-50 dark:bg-zinc-800 border-4 border-dashed border-zinc-100 dark:border-zinc-700 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-amber-500 hover:bg-amber-50/10">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Button type="button" onClick={() => {setPreviewUrl(null); setImage(null)}} variant="destructive" className="rounded-full h-14 px-10 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl">Ganti Gambar</Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-10 cursor-pointer">
                          <div className="bg-white dark:bg-zinc-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <ImageIcon className="h-10 w-10 text-amber-500" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Klik untuk menyisipkan foto utama</p>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KONTEN EDITOR */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Narasi Berita Lengkap</Label>
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] overflow-hidden p-2 border border-zinc-50 dark:border-zinc-700 shadow-inner">
                      <ReactQuill 
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        className="editor-clean"
                      />
                    </div>
                  </div>

                  {/* TOMBOL AKSI */}
                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                    <Button type="submit" className="flex-1 h-24 bg-zinc-900 hover:bg-amber-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin h-8 w-8" /> : (
                        <div className="flex items-center gap-4">
                          <Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                          {editing ? "SIMPAN PERUBAHAN WARTA" : "TERBITKAN WARTA SEKARANG"}
                        </div>
                      )}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="ghost" className="h-24 px-10 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-red-500">
                      Batalkan
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Style untuk Editor Quill agar Modern */
        .ql-toolbar.ql-snow { border: none !important; padding: 25px !important; background: transparent; border-bottom: 1px solid #f1f1f1 !important; }
        .ql-container.ql-snow { border: none !important; min-height: 500px; font-family: 'Inter', sans-serif !important; font-size: 1.15rem !important; }
        .ql-editor { padding: 40px !important; line-height: 1.8 !important; color: #3f3f46; }
        .dark .ql-editor { color: #d4d4d8; }
        .ql-editor.ql-blank::before { color: #a1a1aa !important; font-style: normal !important; opacity: 0.5; }
        
        /* Custom Table di Editor */
        .ql-editor table { border-collapse: collapse; width: 100%; margin: 20px 0; border: 2px solid #f4f4f5; }
        .ql-editor td { border: 1px solid #f4f4f5; padding: 12px; }

        /* Scrollbar Halus */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 20px; }
        .dark ::-webkit-scrollbar-thumb { background: #27272a; }
      `}</style>
    </div>
  )
}
