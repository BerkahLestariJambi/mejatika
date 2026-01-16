"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Image as ImageIcon, Loader2, 
  User, ShieldCheck, Camera, FileText, Globe 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScannerResult } from "@/components/articles/ScannerResult"
import Swal from 'sweetalert2'
import { useRouter, useParams } from "next/navigation"

import dynamic from 'next/dynamic'
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill-new");
  return RQ;
}, { 
  ssr: false, 
  loading: () => <div className="h-80 w-full bg-zinc-100 animate-pulse rounded-[2rem]" /> 
});

import 'react-quill-new/dist/quill.snow.css';

export default function EditArticlePelajarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; 

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [authorName, setAuthorName] = useState("");
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);

  // 1. FUNGSI AMBIL DATA (SANGAT PENTING)
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Ambil Kategori Dulu
        const resCat = await fetch("https://backend.mejatika.com/api/categories");
        const jsonCat = await resCat.json();
        setCategories(jsonCat.data || jsonCat);

        // Ambil Detail Artikel (Gunakan endpoint show-id yang biasanya lebih stabil)
        const resArt = await fetch(`https://backend.mejatika.com/api/articles/show-id/${id}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const jsonArt = await resArt.json();

        if (jsonArt.success) {
          const item = jsonArt.data;
          setTitle(item.title || "");
          setContent(item.content || "");
          setCategoryId(item.category_id?.toString() || "");
          setStatus(item.status || "draft");
          setAuthorName(item.author_name || "");
          setAiScore(item.ai_score || 0);
          setPlagScore(item.plagiarism_score || 0);

          // Preview Gambar
          if (item.cover_image) {
            setCoverPreview(item.cover_image.startsWith('http') ? item.cover_image : `https://backend.mejatika.com/storage/${item.cover_image}`);
          }
          if (item.author_photo) {
            setAuthorPreview(item.author_photo.startsWith('http') ? item.author_photo : `https://backend.mejatika.com/storage/${item.author_photo}`);
          }
        } else {
          Swal.fire("Data Kosong", "Gagal menarik data dari server.", "error");
        }
      } catch (error) {
        console.error("Error Load:", error);
      } finally {
        setFetching(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // 2. FUNGSI SIMPAN PERUBAHAN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("_method", "PUT"); // Spoofing Laravel
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("status", status);
    formData.append("ai_score", aiScore.toString());
    formData.append("plagiarism_score", plagScore.toString());

    if (coverImage) formData.append("cover_image", coverImage);
    if (authorImage) formData.append("author_photo", authorImage);

    try {
      const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
        method: "POST", // Tetap POST karena bawa file
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
        body: formData,
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Karya diperbarui!", "success").then(() => router.push("/dashboardpelajar/articles/my"));
      } else {
        const errJson = await res.json();
        Swal.fire("Gagal", errJson.message || "Cek inputan Anda", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Koneksi server terputus", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. TAMPILAN LOADING
  if (fetching) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      <p className="mt-4 font-black uppercase text-[10px] tracking-widest text-zinc-400">Loading Data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black italic uppercase text-zinc-900 leading-none">Edit <span className="text-amber-500">Karya</span></h1>
            <p className="text-[9px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">ID Konten: #{id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SISI KIRI (KONTEN) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block text-center">Banner Artikel</Label>
                <div className="relative h-64 w-full rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden cursor-pointer" onClick={() => document.getElementById('cover_input')?.click()}>
                  {coverPreview ? <img src={coverPreview} className="h-full w-full object-cover" /> : <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-2"><ImageIcon /><span className="text-[9px] font-bold uppercase">Ganti Cover</span></div>}
                  <input id="cover_input" type="file" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
                  }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <Label className="text-[10px] font-black uppercase text-amber-600">Judul Karya</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-14 text-xl font-bold border-none bg-zinc-50 rounded-2xl px-6" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-zinc-300">Konten Utama</Label>
                <div className="bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 p-1">
                  <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>
              </div>
            </Card>
          </div>

          {/* SISI KANAN (OPTIONS) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 border-t-4 border-zinc-900">
               <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setStatus("draft")} className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${status === 'draft' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}>
                    <FileText className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Draf</span>
                  </button>
                  <button type="button" onClick={() => setStatus("published")} className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${status === 'published' ? 'border-amber-500 bg-amber-500 text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}>
                    <Globe className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Publish</span>
                  </button>
               </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 space-y-6">
               <div className="relative w-20 h-20 mx-auto group cursor-pointer" onClick={() => document.getElementById('author_input')?.click()}>
                  <div className="w-full h-full rounded-full border-2 border-zinc-100 overflow-hidden bg-zinc-50 flex items-center justify-center">
                    {authorPreview ? <img src={authorPreview} className="h-full w-full object-cover" /> : <User className="text-zinc-200 h-10 w-10" />}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-amber-500 p-1.5 rounded-full text-white"><Camera className="h-3 w-3" /></div>
                  <input id="author_input" type="file" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setAuthorImage(file); setAuthorPreview(URL.createObjectURL(file)); }
                  }} />
               </div>

               <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nama Penulis" className="rounded-xl h-11 bg-zinc-50 border-none font-bold text-center text-xs" required />

               <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Kategori</Label>
                 <select className="w-full h-12 rounded-xl bg-zinc-50 px-4 font-bold border-none text-xs outline-none" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">-- PILIH --</option>
                    {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>

               <Button type="submit" disabled={loading} className="w-full h-20 rounded-[1.5rem] bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-200">
                 {loading ? <Loader2 className="animate-spin" /> : 'Update Karya'}
               </Button>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
