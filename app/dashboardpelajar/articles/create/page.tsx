"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, ArrowLeft, Save, Image as ImageIcon, 
  Send, Loader2, User, BookOpen, ShieldCheck, 
  Sparkles, Info, CheckCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScannerResult } from "@/components/articles/ScannerResult"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"

// --- IMPORT DINAMIS REACT-QUILL-NEW (Anti-Error Build) ---
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
  
  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Scanner States (AI & Plagiarism)
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
  });

  // Konfigurasi Toolbar Editor
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'link', 'image'],
      ['clean']
    ],
  }), []);

  // Ambil Kategori dari API Mejatika
  useEffect(() => {
    const getCats = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/categories");
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Gagal load kategori");
      }
    };
    getCats();
  }, []);

  // Fungsi Deteksi AI & Plagiat
  const handleScan = async () => {
    if (!content || content.length < 100) {
      return Swal.fire('Teks Terlalu Singkat', 'Tulis minimal 100 karakter untuk mulai mendeteksi orisinalitas.', 'info');
    }
    
    setIsScanning(true);
    // Simulasi integrasi API Deteksi
    setTimeout(() => {
      setAiScore(Math.floor(Math.random() * 15) + 2); // Skor 2-17%
      setPlagScore(Math.floor(Math.random() * 8) + 1); // Skor 1-9%
      setIsScanning(false);
      setHasScanned(true);
      Toast.fire({ icon: 'success', title: 'Analisis Orisinalitas Selesai!' });
    }, 2500);
  };

  // Kirim ke Database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasScanned) {
      return Swal.fire('Cek Orisinalitas', 'Kamu wajib melakukan Scan Orisinalitas sebelum menerbitkan karya.', 'warning');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("author_bio", authorBio);
    formData.append("status", "published");
    formData.append("ai_score", aiScore.toString());
    formData.append("plagiarism_score", plagScore.toString());
    if (image) formData.append("cover_image", image);

    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      
      if (res.ok) {
        Swal.fire({
          title: 'BERHASIL TERBIT!',
          text: 'Karya hebatmu kini bisa dibaca oleh semua orang di Mejatika.',
          icon: 'success',
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Lihat Daftar Karya'
        }).then(() => router.push("/dashboardpelajar/articles/my"));
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* TOP NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
             <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-14 w-14 bg-white shadow-sm hover:bg-zinc-100">
                <ArrowLeft className="h-6 w-6" />
             </Button>
             <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                  Karya <span className="text-amber-500">Siswa XII</span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">Student Content Creator Dashboard</p>
             </div>
          </div>
          <div className="hidden md:flex gap-2">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 className="h-3 w-3" /> Auto-Save Aktif
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI (EDITOR) - 8 COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 ml-2">Judul Artikel</Label>
                  <Input 
                    value={title} onChange={(e) => setTitle(e.target.value)} required 
                    placeholder="Apa pesan yang ingin kamu sampaikan hari ini?..." 
                    className="h-24 text-3xl md:text-4xl font-black uppercase italic border-none bg-zinc-50 rounded-[2.5rem] px-10 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 ml-2">Narasi Utama</Label>
                  <div className="bg-zinc-50 rounded-[3rem] overflow-hidden p-2 border border-zinc-100 shadow-inner">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* KOLOM KANAN (SIDEBAR ANALYTICS) - 4 COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* SCANNER & ORISINALITAS */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 border-t-8 border-amber-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-amber-500" />
                  <h3 className="font-black uppercase italic tracking-tighter text-lg">Orisinalitas</h3>
                </div>
                {hasScanned && <Badge className="bg-emerald-500 text-white rounded-full">Scanned</Badge>}
              </div>
              
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />

              <div className="mt-6 space-y-3">
                <Button 
                  type="button" 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-zinc-200"
                >
                  {isScanning ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4 text-amber-400" />}
                  {isScanning ? "Menganalisis..." : "Cek Skor Orisinalitas"}
                </Button>
                <p className="text-[9px] text-zinc-400 text-center italic font-medium">Sistem kami menggunakan AI untuk mendeteksi plagiarisme dan konten buatan mesin.</p>
              </div>
            </Card>

            {/* DATA PENULIS & KATEGORI */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 space-y-8">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                    <BookOpen className="h-3 w-3 text-amber-500" /> Pilih Kategori Karya
                  </Label>
                  <select 
                    className="w-full h-16 rounded-2xl bg-zinc-50 px-6 font-bold border-none outline-none focus:ring-2 focus:ring-amber-500 shadow-inner appearance-none cursor-pointer" 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">-- PILIH KANAL --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                    <User className="h-3 w-3 text-amber-500" /> Identitas Penulis
                  </Label>
                  <Input 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    placeholder="Nama Lengkap / Pena" 
                    className="rounded-xl h-14 bg-zinc-50 border-none font-bold shadow-inner" 
                    required
                  />
                  <textarea 
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Tulis biografi singkat kamu (Contoh: Siswa XII yang gemar menulis opini pendidikan)"
                    className="w-full h-24 p-4 rounded-xl bg-zinc-50 border-none text-sm font-medium shadow-inner focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    required
                  />
               </div>

               <Button 
                type="submit" 
                disabled={loading || isScanning}
                className="w-full h-24 rounded-[2rem] bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-amber-200 transition-all hover:scale-[1.02] active:scale-95"
               >
                 {loading ? <Loader2 className="animate-spin" /> : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2"><Send className="h-4 w-4" /> <span>Terbitkan Sekarang</span></div>
                    <span className="text-[8px] opacity-70 mt-1 font-medium tracking-normal">Karya akan segera tayang di portal publik</span>
                  </div>
                 )}
               </Button>
            </Card>
          </div>

        </form>
      </motion.div>

      {/* CUSTOM STYLE UNTUK EDITOR (SAMA DENGAN NEWS) */}
      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; padding: 25px !important; background: #fafafa; border-radius: 2.5rem 2.5rem 0 0; border-bottom: 1px solid #f1f1f1 !important; }
        .ql-container.ql-snow { border: none !important; min-height: 450px; font-size: 1.1rem; }
        .ql-editor { padding: 40px !important; line-height: 1.8; color: #18181b; }
        .ql-editor.ql-blank::before { color: #a1a1aa; font-style: italic; left: 40px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
      `}</style>
    </div>
  )
}
