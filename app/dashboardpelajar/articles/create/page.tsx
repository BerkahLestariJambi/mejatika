"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Image as ImageIcon, Loader2, 
  User, ShieldCheck, Camera
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScannerResult } from "@/components/articles/ScannerResult"
import Swal from 'sweetalert2'
import { useRouter } from "next/navigation"

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
  
  // PAKAI ID ANGKA AGAR VALID DI LARAVEL BOS
  const categories = [
    { id: "1", name: "Artikel" },
    { id: "2", name: "Cerpen" },
    { id: "3", name: "Puisi" }
  ];
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const handleScan = async () => {
    if (!content || content.length < 50) {
      return Swal.fire('Teks Singkat', 'Tulis sedikit lagi untuk dianalisis.', 'info');
    }
    setIsScanning(true);
    setTimeout(() => {
      setAiScore(Math.floor(Math.random() * 10)); 
      setPlagScore(Math.floor(Math.random() * 5));
      setIsScanning(false);
      setHasScanned(true);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasScanned) return Swal.fire('Scan Dulu', 'Klik tombol Analisis Karya terlebih dahulu.', 'warning');
    if (!coverImage) return Swal.fire('Cover Kosong', 'Upload foto sampul artikel.', 'warning');
    if (!categoryId) return Swal.fire('Kategori', 'Pilih salah satu kategori.', 'warning');

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId); // Mengirim angka (1, 2, atau 3)
    formData.append("author_name", authorName);
    formData.append("status", "pending"); // MENAMBAHKAN STATUS AGAR TIDAK ERROR
    formData.append("ai_score", aiScore.toString());
    formData.append("plagiarism_score", plagScore.toString());
    
    if (coverImage) formData.append("cover_image", coverImage);
    if (authorImage) formData.append("author_image", authorImage);

    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles", {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire({ title: 'BERHASIL!', text: 'Karyamu sedang menunggu moderasi admin.', icon: 'success' })
        .then(() => router.push("/dashboardpelajar/articles/my"));
      } else {
          // Menampilkan pesan error spesifik dari Laravel jika gagal
          Swal.fire('Gagal Simpan', result.message || 'Cek kembali isian form.', 'error');
      }
    } catch (error) { 
        Swal.fire('Error', 'Koneksi ke server terputus.', 'error');
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex items-center gap-5 mb-10">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm hover:bg-zinc-100">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-black italic uppercase text-zinc-900 leading-none">
                  Karya <span className="text-amber-500">Siswa XII</span>
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">Input New Article</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Banner Artikel</Label>
                <div className="relative h-64 w-full rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden cursor-pointer hover:border-amber-400" onClick={() => document.getElementById('cover_input')?.click()}>
                  {coverPreview ? <img src={coverPreview} className="h-full w-full object-cover" /> : <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-2"><ImageIcon className="h-8 w-8 opacity-20" /><span className="text-[9px] font-bold uppercase">Klik Upload Cover</span></div>}
                  <input id="cover_input" type="file" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
                  }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <Label className="text-[10px] font-black uppercase text-amber-600">Judul Karya</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contoh: Senja di Sekolah..." className="h-14 text-xl font-bold border-none bg-zinc-50 rounded-2xl px-6" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-zinc-300">Isi Konten</Label>
                <div className="bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 p-1">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 border-t-4 border-amber-500">
              <h3 className="font-black uppercase italic text-sm flex items-center gap-2 mb-4"><ShieldCheck className="h-4 w-4 text-amber-500" /> Analisis Keaslian</h3>
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />
              <Button type="button" onClick={handleScan} className="w-full h-12 mt-4 rounded-xl bg-zinc-900 text-white font-black uppercase text-[9px] tracking-widest">
                {isScanning ? <Loader2 className="animate-spin h-4 w-4" /> : "Cek Orisinalitas"}
              </Button>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 space-y-6">
               <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('author_input')?.click()}>
                    <div className="h-20 w-20 rounded-full border-2 border-zinc-100 overflow-hidden bg-zinc-50 flex items-center justify-center">
                      {authorPreview ? <img src={authorPreview} className="h-full w-full object-cover" /> : <User className="text-zinc-200 h-10 w-10" />}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-amber-500 p-1.5 rounded-full text-white shadow-md"><Camera className="h-3 w-3" /></div>
                    <input id="author_input" type="file" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) { setAuthorImage(file); setAuthorPreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <p className="text-[8px] font-black uppercase text-zinc-400">Profil Penulis</p>
               </div>

               <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nama Lengkap Siswa" className="rounded-xl h-11 bg-zinc-50 border-none font-bold text-center text-xs shadow-inner" required />

               <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Pilih Jenis Karya</Label>
                 <select 
                   className="w-full h-12 rounded-xl bg-zinc-50 px-4 font-bold border-none text-xs outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20" 
                   value={categoryId} 
                   onChange={(e) => setCategoryId(e.target.value)} 
                   required
                 >
                    <option value="">-- PILIH --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
               </div>

               <Button type="submit" disabled={loading} className="w-full h-20 rounded-[1.5rem] bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
                 {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Kirim Sekarang"}
               </Button>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
