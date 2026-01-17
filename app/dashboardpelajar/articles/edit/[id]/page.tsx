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

  useEffect(() => {
    const initPage = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Ambil List Kategori
        const catRes = await fetch("https://backend.mejatika.com/api/categories");
        const catJson = await catRes.json();
        // Cek apakah data dibungkus property 'data' atau tidak
        setCategories(catJson.data || catJson);

        // 2. Ambil Data Detail Artikel
        const artRes = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
        });
        const artJson = await artRes.json();
        
        if (artRes.ok && artJson.success) {
            const data = artJson.data;
            setTitle(data.title || "");
            setContent(data.content || "");
            setCategoryId(data.category_id ? data.category_id.toString() : "");
            setStatus(data.status || "draft");
            setAuthorName(data.author_name || "");
            setAiScore(data.ai_score || 0);
            setPlagScore(data.plagiarism_score || 0);

            // Logic Preview Gambar agar tidak pecah
            if (data.cover_image) {
              setCoverPreview(data.cover_image.startsWith('http') ? data.cover_image : `https://backend.mejatika.com/storage/${data.cover_image}`);
            }
            if (data.author_photo) {
              setAuthorPreview(data.author_photo.startsWith('http') ? data.author_photo : `https://backend.mejatika.com/storage/${data.author_photo}`);
            }
        } else {
          Swal.fire("Gagal", "Data tidak ditemukan atau Anda tidak memiliki akses.", "error");
          router.push("/dashboardpelajar/articles/my");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setFetching(false);
      }
    };

    if (id) initPage();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    // Laravel Multipart Form Data via POST butuh spoofing PUT
    formData.append("_method", "POST"); 
    
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("status", status);
    formData.append("ai_score", aiScore.toString());
    formData.append("plagiarism_score", plagScore.toString());
    
    // Hanya kirim file jika user memilih file baru
    if (coverImage) formData.append("cover_image", coverImage);
    if (authorImage) formData.append("author_photo", authorImage);

    try {
      const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
        method: "POST", // Tetap POST karena kirim FormData
        headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        Swal.fire({
          title: 'BERHASIL!',
          text: 'Perubahan telah disimpan.',
          icon: 'success',
          confirmButtonColor: '#f59e0b'
        }).then(() => router.push("/dashboardpelajar/articles/my"));
      } else {
          Swal.fire('Gagal', result.message || 'Terjadi kesalahan validasi.', 'error');
      }
    } catch (error) { 
        Swal.fire('Error', 'Koneksi ke server terputus.', 'error');
    } finally { 
        setLoading(false); 
    }
  };

  if (fetching) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="mt-4 font-black uppercase text-[10px] tracking-widest text-zinc-400 italic">Sinkronisasi Data Database...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <style jsx global>{`
        .ql-container { border-bottom-left-radius: 2rem; border-bottom-right-radius: 2rem; background: #fafafa; font-family: inherit; }
        .ql-toolbar { border-top-left-radius: 2rem; border-top-right-radius: 2rem; background: white; border-color: #f4f4f5 !important; }
        .ql-editor { min-height: 300px; font-size: 1rem; }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex items-center gap-5 mb-10">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm hover:bg-zinc-100">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-black italic uppercase text-zinc-900 leading-none">
                  Edit <span className="text-amber-500">Karya</span>
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">ID Konten: #{id}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Banner Artikel</Label>
                <div 
                  className="relative h-64 w-full rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden cursor-pointer group hover:border-amber-400 transition-all" 
                  onClick={() => document.getElementById('cover_input')?.click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt="Cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                      <span className="text-[9px] font-bold uppercase">Ganti Cover</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Camera className="text-white h-8 w-8" />
                  </div>
                  <input id="cover_input" type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
                  }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <Label className="text-[10px] font-black uppercase text-amber-600">Judul Karya</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="Ketik judul artikel..." 
                  className="h-14 text-xl font-bold border-none bg-zinc-50 rounded-2xl px-6 focus:ring-2 ring-amber-500 shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-zinc-300">Isi Konten Utama</Label>
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Publikasi */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 border-t-4 border-zinc-900">
               <Label className="text-[10px] font-black uppercase text-zinc-400 mb-4 block text-center">Status Publikasi</Label>
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

            {/* AI Result */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6">
              <h3 className="font-black uppercase italic text-sm flex items-center gap-2 mb-4"><ShieldCheck className="h-4 w-4 text-amber-500" /> Skor Orisinalitas</h3>
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />
            </Card>

            {/* Author Info */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 space-y-6">
               <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('author_input')?.click()}>
                    <div className="h-24 w-24 rounded-full border-4 border-zinc-50 overflow-hidden bg-zinc-50 flex items-center justify-center shadow-inner">
                      {authorPreview ? <img src={authorPreview} className="h-full w-full object-cover" alt="Author" /> : <User className="text-zinc-200 h-10 w-10" />}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-amber-500 p-2 rounded-full text-white shadow-lg border-2 border-white"><Camera className="h-3 w-3" /></div>
                    <input id="author_input" type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) { setAuthorImage(file); setAuthorPreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <p className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">Pas Foto Penulis</p>
               </div>

               <div className="space-y-4">
                  <div>
                    <Label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Nama Penulis</Label>
                    <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nama Lengkap" className="rounded-xl h-11 bg-zinc-50 border-none font-bold text-xs" required />
                  </div>

                  <div>
                    <Label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Kategori</Label>
                    <select 
                      className="w-full h-12 rounded-xl bg-zinc-50 px-4 font-bold border-none text-xs outline-none cursor-pointer focus:ring-2 ring-amber-500 transition-all" 
                      value={categoryId} 
                      onChange={(e) => setCategoryId(e.target.value)} 
                      required
                    >
                      <option value="">-- PILIH KATEGORI --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-20 rounded-[1.5rem] bg-amber-500 text-white font-black uppercase italic tracking-widest text-xs shadow-xl shadow-amber-200 hover:bg-zinc-900 hover:scale-[1.02] active:scale-95 transition-all mt-4"
               >
                 {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Update Karya Sekarang'}
               </Button>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
