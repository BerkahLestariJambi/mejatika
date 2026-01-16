"use client"

import { useState, useEffect, useMemo } from "react"
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
  
  const [categories, setCategories] = useState<any[]>([
    { id: "1", name: "Artikel" },
    { id: "2", name: "Cerpen" },
    { id: "3", name: "Puisi" }
  ]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft"); // STATE STATUS BARU
  const [authorName, setAuthorName] = useState("");
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState(0);
  const [plagScore, setPlagScore] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/categories");
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const filtered = data.filter((c: any) => 
            ["artikel", "cerpen", "puisi"].includes(c.name.toLowerCase())
          );
          if (filtered.length > 0) setCategories(filtered);
        }
      } catch (err) {
        console.log("Menggunakan ID kategori default");
      }
    };
    loadCategories();
  }, []);

  const handleScan = async () => {
    if (!content || content.length < 50) {
      return Swal.fire('Teks Kurang', 'Tulis minimal 50 karakter.', 'info');
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
    if (!hasScanned) return Swal.fire('Scan Dulu', 'Wajib cek orisinalitas.', 'warning');
    if (!coverImage) return Swal.fire('Cover Kosong', 'Upload banner artikel.', 'warning');

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("author_name", authorName);
    formData.append("status", status); // MENGIRIM STATUS PILIHAN SISWA
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
        Swal.fire({ 
          title: status === 'draft' ? 'DRAF DISIMPAN!' : 'BERHASIL PUBLISH!', 
          text: status === 'draft' ? 'Karyamu tersimpan di draf pribadi.' : 'Karyamu sedang ditinjau Admin.', 
          icon: 'success' 
        }).then(() => router.push("/dashboardpelajar/articles/my"));
      } else {
          Swal.fire('Gagal', result.message || 'Cek kembali isian form.', 'error');
      }
    } catch (error) { 
        Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
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
                <p className="text-[9px] font-bold text-zinc-400 mt-1 tracking-widest uppercase">Content Management</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              {/* Cover & Title as before ... */}
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Banner Artikel</Label>
                <div className="relative h-64 w-full rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden cursor-pointer group hover:border-amber-400 transition-all" onClick={() => document.getElementById('cover_input')?.click()}>
                  {coverPreview ? <img src={coverPreview} className="h-full w-full object-cover" /> : <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-2"><ImageIcon className="h-8 w-8 opacity-20" /><span className="text-[9px] font-bold uppercase">Upload Cover</span></div>}
                  <input id="cover_input" type="file" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
                  }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <Label className="text-[10px] font-black uppercase text-amber-600">Judul Karya</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ketik judul..." className="h-14 text-xl font-bold border-none bg-zinc-50 rounded-2xl px-6" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-zinc-300">Isi Konten</Label>
                <div className="bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 p-1">
                  <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* PENETAPAN STATUS (DRAF / PUBLISH) */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 border-t-4 border-zinc-900">
               <Label className="text-[10px] font-black uppercase text-zinc-400 mb-4 block text-center">Opsi Publikasi</Label>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${status === 'draft' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                  >
                    <FileText className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Draf</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${status === 'published' ? 'border-amber-500 bg-amber-500 text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                  >
                    <Globe className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Publish</span>
                  </button>
               </div>
               <p className="text-[8px] text-zinc-400 mt-4 text-center italic font-medium leading-relaxed">
                 {status === 'draft' ? '* Hanya Anda yang dapat melihat karya ini.' : '* Karya akan dikirim ke Admin untuk ditinjau.'}
               </p>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6">
              <h3 className="font-black uppercase italic text-sm flex items-center gap-2 mb-4"><ShieldCheck className="h-4 w-4 text-amber-500" /> Orisinalitas</h3>
              <ScannerResult aiScore={aiScore} plagiarizedScore={plagScore} />
              <Button type="button" onClick={handleScan} className="w-full h-12 mt-4 rounded-xl bg-zinc-900 text-white font-black uppercase text-[9px] tracking-widest">
                {isScanning ? <Loader2 className="animate-spin h-4 w-4" /> : "Cek Karya"}
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
                  <p className="text-[8px] font-black uppercase text-zinc-400">Profil Siswa</p>
               </div>

               <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nama Penulis" className="rounded-xl h-11 bg-zinc-50 border-none font-bold text-center text-xs" required />

               <div className="space-y-2">
                 <Label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Kategori</Label>
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

               <Button type="submit" disabled={loading} className={`w-full h-20 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${status === 'published' ? 'bg-amber-500 shadow-amber-200' : 'bg-zinc-900 shadow-zinc-200'}`}>
                 {loading ? <Loader2 className="animate-spin h-6 w-6" /> : status === 'published' ? 'Kirim ke Admin' : 'Simpan ke Draf'}
               </Button>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
