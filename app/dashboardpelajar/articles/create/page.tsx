"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, ArrowLeft, Save, Image as ImageIcon, 
  Send, Loader2, User, BookOpen, ShieldCheck, 
  AlertCircle, Sparkles 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScannerResult } from "@/components/articles/scanner-result"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"

// IMPORT DINAMIS REACT-QUILL-NEW (Sama dengan News Bos)
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill-new");
  return RQ;
}, { 
  ssr: false, 
  loading: () => <div className="h-80 w-full bg-zinc-100 animate-pulse rounded-[2.5rem]" /> 
});

import 'react-quill-new/dist/quill.snow.css';

export default function CreateArticlePelajarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // States Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // States Scanner (Fitur Tambahan Bos)
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);

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
      ['blockquote', 'link', 'image'],
      ['clean']
    ],
  }), []);

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/categories")
      .then(res => res.json())
      .then(json => setCategories(json.data || []));
  }, []);

  const handleScan = async () => {
    if (!content || content.length < 50) {
      return Toast.fire({ icon: 'warning', title: 'Teks terlalu pendek untuk dianalisis!' });
    }
    setIsScanning(true);
    // Simulasi API Scanner
    setTimeout(() => {
      setAiScore(Math.floor(Math.random() * 20)); // Simulasi skor rendah (bagus)
      setPlagScore(Math.floor(Math.random() * 10));
      setIsScanning(false);
      Toast.fire({ icon: 'success', title: 'Analisis Orisinalitas Selesai!' });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("author_bio", authorBio);
    formData.append("status", "published");
    if (image) formData.append("cover_image", image);

    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (res.ok) {
        Swal.fire({
          title: 'Karya Terbit!',
          text: 'Artikel kamu sudah berhasil dipublikasikan.',
          icon: 'success',
          confirmButtonColor: '#f59e0b'
        });
        router.push("/dashboardpelajar/articles/my");
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal mempublikasikan karya.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 p-0 hover:bg-white shadow-sm">
                <ArrowLeft className="h-5 w-5" />
             </Button>
             <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900">
               Ruang <span className="text-amber-500">Karya XII</span>
             </h1>
          </div>
          <Badge className="bg-white text-zinc-500 border-none shadow-sm px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]">
             Student Author Mode
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SISI KIRI: EDITOR UTAMA */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 md:p-12 space-y-10">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 ml-2">Judul Artikel</Label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)} required 
                  placeholder="Masukkan judul karyamu..." 
                  className="h-24 text-3xl font-black uppercase italic border-none bg-zinc-50 rounded-[2rem] px-8 focus:ring-4 focus:ring-amber-500/10"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-2">Konten Narasi</Label>
                <div className="bg-zinc-50 rounded-[2.5rem] overflow-hidden p-2 border border-zinc-100 shadow-inner">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Tuliskan pemikiranmu di sini..." />
                </div>
              </div>
            </Card>
          </div>

          {/* SISI KANAN: SIDEBAR SCANNER & INFO */}
          <div className="space-y-8">
            
            {/* SCANNER CARD */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
                <h3 className="font-black uppercase italic tracking-tighter text-lg">Orisinalitas</h3>
              </div>
              
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />

              <Button 
                type="button" 
                onClick={handleScan}
                disabled={isScanning}
                className="w-full h-14 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black uppercase text-[10px] tracking-widest transition-all"
              >
                {isScanning ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Scan Artikel Kamu
              </Button>
            </Card>

            {/* CATEGORY & AUTHOR */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 space-y-6">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Kategori</Label>
                  <select 
                    className="w-full h-14 rounded-xl bg-zinc-50 px-6 font-bold border-none outline-none focus:ring-2 focus:ring-amber-500 shadow-inner" 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><User className="h-3 w-3" /> Nama Pena</Label>
                  <Input 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    placeholder="Nama Penulis" 
                    className="rounded-xl bg-zinc-50 border-none font-bold shadow-inner" 
                  />
                  <textarea 
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Biografi singkat..."
                    className="w-full h-24 p-4 rounded-xl bg-zinc-50 border-none text-sm font-medium shadow-inner focus:ring-2 focus:ring-amber-500 outline-none"
                  />
               </div>

               <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-20 rounded-[1.5rem] bg-zinc-900 hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-3 h-5 w-5" /> Terbitkan</>}
               </Button>
            </Card>
          </div>

        </form>
      </motion.div>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; padding: 20px !important; background: #fafafa; border-radius: 2rem 2rem 0 0; border-bottom: 1px solid #f1f1f1 !important; }
        .ql-container.ql-snow { border: none !important; min-height: 400px; font-size: 1rem; }
        .ql-editor { padding: 30px !important; line-height: 1.8; color: #18181b; }
        .ql-editor.ql-blank::before { color: #a1a1aa; font-style: italic; }
      `}</style>
    </div>
  )
}
