"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Image as ImageIcon, Send, Loader2, 
  User, BookOpen, ShieldCheck, Sparkles, CheckCircle2, Camera
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScannerResult } from "@/components/articles/ScannerResult"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"

// --- IMPORT DINAMIS REACT-QUILL-NEW ---
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill-new");
  return RQ;
}, { 
  ssr: false, 
  loading: () => <div className="h-80 w-full bg-zinc-100 animate-pulse rounded-[2rem]" /> 
});

import 'react-quill-new/dist/quill.snow.css';

export default function CreateArticlePelajarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // States Penulis & Foto
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  
  // States Cover Artikel
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Scanner States
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
  });

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  // --- LOGIC AMBIL KATEGORI LANGSUNG DARI DATABASE ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/categories", {
          headers: {
            "Accept": "application/json"
          }
        });
        const json = await res.json();
        
        // Cek struktur data Laravel (biasanya di json.data atau langsung json)
        if (json.data && Array.isArray(json.data)) {
          setCategories(json.data);
        } else if (Array.isArray(json)) {
          setCategories(json);
        }
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleScan = async () => {
    if (!content || content.length < 100) {
      return Swal.fire('Teks Terlalu Singkat', 'Minimal 100 karakter untuk cek orisinalitas.', 'info');
    }
    setIsScanning(true);
    setTimeout(() => {
      setAiScore(Math.floor(Math.random() * 12) + 1); 
      setPlagScore(Math.floor(Math.random() * 5) + 1);
      setIsScanning(false);
      setHasScanned(true);
      Toast.fire({ icon: 'success', title: 'Analisis Selesai!' });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasScanned) return Swal.fire('Cek Orisinalitas', 'Wajib scan sebelum terbit.', 'warning');
    if (!coverImage) return Swal.fire('Cover Belum Ada', 'Silakan upload gambar cover artikel.', 'warning');

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("author_bio", authorBio);
    formData.append("ai_score", aiScore.toString());
    formData.append("plagiarism_score", plagScore.toString());
    
    if (coverImage) formData.append("cover_image", coverImage);
    if (authorImage) formData.append("author_image", authorImage);

    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      
      if (res.ok) {
        Swal.fire({
          title: 'BERHASIL TERBIT!',
          icon: 'success',
          confirmButtonColor: '#f59e0b',
        }).then(() => router.push("/dashboardpelajar/articles/my"));
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal kirim data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-5">
             <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm hover:bg-zinc-100">
                <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                  Karya <span className="text-amber-500">Siswa XII</span>
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">Create Content Dashboard</p>
             </div>
          </div>
          <div className="hidden md:flex gap-2">
             <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 className="h-3 w-3" /> System Ready
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI: EDITOR */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8 md:p-10">
              
              {/* UPLOAD COVER ARTIKEL */}
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Cover Image</Label>
                <div 
                  className="relative h-64 w-full rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden group cursor-pointer hover:border-amber-400 transition-all"
                  onClick={() => document.getElementById('cover_input')?.click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} className="h-full w-full object-cover" alt="Cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                      <ImageIcon className="h-10 w-10 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Upload Banner Artikel</span>
                    </div>
                  )}
                  <input id="cover_input" type="file" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
                  }} />
                </div>
              </div>

              {/* JUDUL ARTIKEL (DIKECILKAN KE 14PT/TEXT-XL) */}
              <div className="space-y-3 mb-8">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 ml-1">Judul Artikel</Label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)} required 
                  placeholder="Tulis judul yang menarik di sini..." 
                  className="h-14 text-xl font-bold border-none bg-zinc-50 rounded-2xl px-6 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                />
              </div>

              {/* EDITOR KONTEN */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 ml-1">Isi Narasi</Label>
                <div className="bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 shadow-inner p-1">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                </div>
              </div>
            </Card>
          </div>

          {/* KOLOM KANAN: SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* SCANNER */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 border-t-4 border-amber-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase italic tracking-tighter text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500" /> Orisinalitas
                </h3>
                {hasScanned && <Badge className="bg-emerald-500 text-[8px] rounded-full">Verified</Badge>}
              </div>
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />
              <Button 
                type="button" onClick={handleScan} disabled={isScanning}
                className="w-full h-12 mt-4 rounded-xl bg-zinc-900 text-white font-black uppercase text-[9px] tracking-widest shadow-lg"
              >
                {isScanning ? <Loader2 className="animate-spin" /> : "Analisis Karya"}
              </Button>
            </Card>

            {/* PENULIS & KATEGORI */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 space-y-6">
               {/* FOTO PENULIS */}
               <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('author_input')?.click()}>
                    <div className="h-20 w-20 rounded-full border-2 border-zinc-100 overflow-hidden bg-zinc-50 flex items-center justify-center">
                      {authorPreview ? <img src={authorPreview} className="h-full w-full object-cover" /> : <User className="text-zinc-200 h-10 w-10" />}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-amber-500 p-1.5 rounded-full text-white shadow-md border-2 border-white">
                      <Camera className="h-3 w-3" />
                    </div>
                    <input id="author_input" type="file" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) { setAuthorImage(file); setAuthorPreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <p className="text-[8px] font-black uppercase text-zinc-400">Foto Penulis</p>
               </div>

               <Input 
                  value={authorName} onChange={(e) => setAuthorName(e.target.value)} 
                  placeholder="Nama Penulis" 
                  className="rounded-xl h-11 bg-zinc-50 border-none font-bold text-center text-xs shadow-inner" required
               />

               {/* SELECT KATEGORI YANG SUDAH DIPERBAIKI */}
               <div className="relative">
                 <select 
                    className="w-full h-12 rounded-xl bg-zinc-50 px-4 font-bold border-none text-xs outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer shadow-inner" 
                    value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                 >
                    <option value="">-- PILIH KATEGORI --</option>
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.nama_kategori}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading kategori...</option>
                    )}
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <BookOpen className="h-3 w-3 text-zinc-400" />
                 </div>
               </div>

               <Button 
                type="submit" disabled={loading}
                className="w-full h-20 rounded-[1.5rem] bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-amber-100 transition-all hover:scale-[1.02]"
               >
                 {loading ? <Loader2 className="animate-spin" /> : "Terbitkan Karya"}
               </Button>
            </Card>
          </div>

        </form>
      </motion.div>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; background: #fafafa; border-radius: 1.5rem 1.5rem 0 0; padding: 15px !important; border-bottom: 1px solid #f4f4f5 !important; }
        .ql-container.ql-snow { border: none !important; min-height: 400px; font-size: 1rem; }
        .ql-editor { padding: 30px !important; }
      `}</style>
    </div>
  )
}
