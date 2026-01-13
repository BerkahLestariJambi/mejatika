"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Search, ArrowLeft, Quote as QuoteIcon, Save, Image as ImageIcon, Table as TableIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

// IMPORT DINAMIS UNTUK REACT QUILL
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill-new");
  // @ts-ignore
  const Quill = RQ.Quill;
  
  // Daftarkan modul tabel secara manual jika diperlukan oleh library
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

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  // KONFIGURASI MODUL EDITOR LENGKAP DENGAN TABEL
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['table'], // Tombol Utama Tabel
      ['clean']
    ],
    table: true // Mengaktifkan fungsionalitas tabel
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
        Toast.fire({ icon: 'success', title: 'Data Berhasil Disimpan!' });
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans">
      
      <AnimatePresence mode="wait">
        {!isEditorOpen ? (
          /* ============================================================
             LIST VIEW
             ============================================================ */
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">Warta <span className="text-amber-500">Mejatika</span></h1>
              <Button onClick={() => setIsEditorOpen(true)} className="bg-zinc-900 text-white rounded-[1.5rem] h-16 px-10 font-black uppercase tracking-widest">
                <Plus className="mr-3 h-6 w-6" /> Tulis Baru
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400" />
              <Input 
                placeholder="Cari warta..." 
                className="pl-16 h-20 rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 text-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-[11px] font-black uppercase text-zinc-400">
                      <th className="px-10 py-6 text-left">Konten</th>
                      <th className="px-10 py-6 text-left">Kategori</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fetching ? (
                      <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-amber-500" /></td></tr>
                    ) : filteredNews.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-all">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <img src={item.image} className="h-16 w-24 rounded-xl object-cover shadow" alt="" />
                            <p className="font-black text-lg uppercase italic">{item.title}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <Badge className="bg-zinc-100 text-zinc-900 border-none px-4 py-2 uppercase text-[10px] font-black">{item.category?.name || 'Umum'}</Badge>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="text-amber-600" onClick={() => {
                              setEditing(item); setTitle(item.title); setContent(item.content); setQuote(item.quote || "");
                              setCategoryId(String(item.category_id)); setPreviewUrl(item.image); setIsEditorOpen(true);
                            }}><Edit /></Button>
                            <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 /></Button>
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
             EDITOR VIEW (DENGAN FITUR TABEL LENGKAP)
             ============================================================ */
          <motion.div key="editor" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <Button variant="ghost" onClick={resetForm} className="font-black uppercase text-[10px] tracking-widest text-zinc-500">
                <ArrowLeft className="mr-2" /> Kembali
              </Button>
              <div className="flex items-center gap-2 text-amber-500">
                <TableIcon className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Table Support Enabled</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 pb-20">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-10 md:p-16 space-y-10">
                
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600">Headlines</Label>
                  <Input 
                    value={title} onChange={(e) => setTitle(e.target.value)} required 
                    placeholder="JUDUL BERITA..." 
                    className="h-24 text-3xl md:text-5xl font-black uppercase italic border-none bg-zinc-50 rounded-[2rem] px-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase">Kategori</Label>
                     <select className="w-full h-14 rounded-2xl bg-zinc-50 px-6 font-bold" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                        <option value="">Pilih...</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase">Quote Intisari</Label>
                     <Input value={quote} onChange={(e) => setQuote(e.target.value)} className="h-14 rounded-2xl bg-zinc-50 border-none" />
                   </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-zinc-400">Isi Berita & Data Tabel</Label>
                  <div className="bg-zinc-50 rounded-[2.5rem] overflow-hidden p-2 border shadow-inner">
                    <ReactQuill 
                      theme="snow" 
                      value={content} 
                      onChange={setContent} 
                      modules={modules}
                      placeholder="Tulis berita atau masukkan tabel data di sini..."
                    />
                  </div>
                  <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                       <TableIcon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[11px] text-amber-700 leading-tight">
                      <b>Tips Tabel:</b> Klik ikon tabel di toolbar untuk memasukkan baris/kolom. Gunakan klik kanan atau klik pada sel tabel untuk memunculkan menu tambah baris/hapus baris.
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full h-24 bg-zinc-900 hover:bg-amber-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em]" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : (editing ? "SIMPAN PERUBAHAN" : "TERBITKAN SEKARANG")}
                </Button>
              </Card>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* 1. Reset Toolbar Styling */
        .ql-toolbar.ql-snow { border: none !important; padding: 20px !important; background: #f8f8f8; border-radius: 2rem 2rem 0 0; }
        .ql-container.ql-snow { border: none !important; min-height: 450px; font-size: 1.1rem; }
        .ql-editor { padding: 40px !important; line-height: 1.8; }

        /* 2. TABEL CSS (PENTING AGAR TABEL MUNCUL GARISNYA) */
        .ql-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 15px 0;
          table-layout: fixed;
        }
        .ql-editor td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          min-width: 50px;
          height: 30px;
          vertical-align: top;
        }
        .ql-editor th {
          border: 1px solid #ddd;
          background-color: #f4f4f5;
          font-weight: bold;
          padding: 8px 12px;
        }
        
        /* Highlight sel saat dipilih agar mudah diedit */
        .ql-table-cursor {
          background-color: rgba(245, 158, 11, 0.1);
        }

        /* Responsive Tabel agar tidak hancur di HP */
        @media (max-width: 768px) {
          .ql-editor table { display: block; overflow-x: auto; }
        }
      `}</style>
    </div>
  )
}
