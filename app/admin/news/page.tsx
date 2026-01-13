"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, Quote as QuoteIcon, Save, Image as ImageIcon, Table as TableIcon, Eye, EyeOff, Globe, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Swal from 'sweetalert2'

// IMPORT DINAMIS UNTUK REACT QUILL
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill-new");
  // @ts-ignore
  const Quill = RQ.Quill;
  const TableModule = Quill.import('modules/table');
  Quill.register({ 'modules/table': TableModule }, true);
  return RQ;
}, { 
  ssr: false, 
  loading: () => <div className="h-80 w-full bg-zinc-100 animate-pulse rounded-[2rem]" /> 
});

import 'react-quill-new/dist/quill.snow.css';

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
  const [isPublished, setIsPublished] = useState(true) // DEFAULT PUBLISH

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
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['table'],
      ['clean']
    ],
    table: true
  }), [])

  const fetchNews = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch("https://backend.mejatika.com/api/news");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setNews(json.data);
      else if (Array.isArray(json)) setNews(json);
      else setNews([]);
    } catch (err) { setNews([]); }
    finally { setFetching(false); }
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
    setIsPublished(true);
    setIsEditorOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("quote", quote || "");
    formData.append("category_id", categoryId);
    formData.append("status", isPublished ? "published" : "draft"); // KIRIM STATUS KE API
    if (image) formData.append("image", image);
    
    let url = "https://backend.mejatika.com/api/news";
    if (editing) { url = `${url}/${editing.id}`; formData.append("_method", "PUT"); }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (res.ok) {
        Toast.fire({ icon: 'success', title: `Warta berhasil di${isPublished ? 'publikasikan' : 'simpan sebagai draf'}!` });
        resetForm();
        fetchNews();
      }
    } catch (error) { Toast.fire({ icon: 'error', title: 'Gagal Simpan!' }); }
    finally { setLoading(false); }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Warta?',
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
          /* ============================================================
             LIST VIEW
             ============================================================ */
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-900">Portal <span className="text-amber-500">Editor</span></h1>
              <Button onClick={() => setIsEditorOpen(true)} className="bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-16 px-10 font-black uppercase tracking-widest shadow-xl">
                <Plus className="mr-3 h-6 w-6" /> Tulis Warta Baru
              </Button>
            </div>

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="Cari judul atau kategori warta..." 
                className="pl-16 h-20 rounded-[2rem] border-none shadow-xl bg-white text-xl font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-[11px] font-black uppercase text-zinc-400">
                      <th className="px-10 py-6 text-left">Konten & Visual</th>
                      <th className="px-10 py-6 text-left">Status</th>
                      <th className="px-10 py-6 text-left">Kategori</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fetching ? (
                      <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-amber-500" /></td></tr>
                    ) : filteredNews.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                                <img src={item.image} className="h-full w-full object-cover" alt="" />
                            </div>
                            <p className="font-black text-lg uppercase italic line-clamp-1 group-hover:text-amber-500 transition-colors">{item.title}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           {item.status === 'published' ? (
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest flex w-fit gap-1">
                               <Globe className="h-3 w-3" /> Published
                             </Badge>
                           ) : (
                             <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest flex w-fit gap-1">
                               <FileText className="h-3 w-3" /> Draft
                             </Badge>
                           )}
                        </td>
                        <td className="px-10 py-8">
                          <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-2 uppercase text-[10px] font-black tracking-tighter">{item.category?.name || 'Umum'}</Badge>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-amber-50 text-amber-600" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content); setQuote(item.quote || "");
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image); 
                              setIsPublished(item.status === 'published'); // SET STATUS SAAT EDIT
                              setIsEditorOpen(true);
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
          /* ============================================================
             EDITOR VIEW
             ============================================================ */
          <motion.div key="editor" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <Button variant="ghost" onClick={resetForm} className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500 hover:bg-white rounded-full px-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batalkan Perubahan
              </Button>
              <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-3xl shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                    <Label htmlFor="status-mode" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-zinc-400">
                        {isPublished ? "Mode Publikasi" : "Simpan Sebagai Draf"}
                    </Label>
                    <Switch 
                        id="status-mode" 
                        checked={isPublished} 
                        onCheckedChange={setIsPublished}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
                {isPublished ? <Eye className="h-5 w-5 text-emerald-500" /> : <EyeOff className="h-5 w-5 text-zinc-400" />}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 pb-20">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-8 md:p-16 space-y-12 relative overflow-hidden">
                {/* Indikator Status di Pojok Form */}
                <div className={`absolute top-0 right-0 px-10 py-3 rounded-bl-3xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg ${isPublished ? 'bg-emerald-500' : 'bg-zinc-400'}`}>
                    {isPublished ? 'PUBLISH READY' : 'DRAFT MODE'}
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 ml-2">Judul Utama</Label>
                  <Input 
                    value={title} onChange={(e) => setTitle(e.target.value)} required 
                    placeholder="Tulis judul warta yang menarik..." 
                    className="h-28 text-3xl md:text-5xl font-black uppercase italic border-none bg-zinc-50 rounded-[2.5rem] px-10 focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Kanal Berita</Label>
                     <select className="w-full h-16 rounded-[1.5rem] bg-zinc-50 px-8 font-bold border-none outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer shadow-inner" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Highlight Quote</Label>
                     <div className="relative">
                        <QuoteIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                        <Input value={quote} onChange={(e) => setQuote(e.target.value)} className="h-16 pl-14 rounded-[1.5rem] bg-zinc-50 border-none font-bold italic shadow-inner" placeholder="Masukkan kutipan..." />
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Gambar Cover & Data Tabel</Label>
                  <div className="group relative h-[300px] w-full rounded-[3rem] bg-zinc-50 border-4 border-dashed border-zinc-100 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-amber-500 hover:bg-amber-50/20">
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" onClick={() => {setPreviewUrl(null); setImage(null)}} variant="destructive" className="rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest">Ganti Gambar</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center cursor-pointer">
                        <ImageIcon className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pilih Visual Utama</p>
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
                        }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Isi Berita Lengkap</Label>
                  <div className="bg-zinc-50 rounded-[3rem] overflow-hidden p-2 border shadow-inner">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Mulai menulis narasi di sini..." />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <Button type="submit" className={`flex-1 h-24 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95 ${isPublished ? 'bg-zinc-900 hover:bg-emerald-600 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-600'}`} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                            <div className="flex items-center gap-3">
                                {isPublished ? <Globe className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                                {editing ? "Simpan Perubahan" : (isPublished ? "Publikasikan Sekarang" : "Simpan Draf")}
                            </div>
                        )}
                    </Button>
                    {!isPublished && (
                        <Button type="button" onClick={() => { setIsPublished(true); }} className="h-24 px-12 rounded-[2rem] border-2 border-emerald-500 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all">
                           Ubah Ke Publikasi
                        </Button>
                    )}
                </div>
              </Card>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; padding: 25px !important; background: #fafafa; border-radius: 2.5rem 2.5rem 0 0; border-bottom: 1px solid #f1f1f1 !important; }
        .ql-container.ql-snow { border: none !important; min-height: 450px; font-size: 1.1rem; }
        .ql-editor { padding: 40px !important; line-height: 1.8; color: #18181b; }
        .ql-editor table { border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #eee; }
        .ql-editor td { border: 1px solid #eee; padding: 12px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
      `}</style>
    </div>
  )
}
