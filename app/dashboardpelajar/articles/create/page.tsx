"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Send, 
  ImageIcon, 
  UserCircle, 
  Type, 
  LayoutGrid, 
  Info,
  ArrowLeft
} from "lucide-react"
import 'react-quill/dist/quill.snow.css'
import { toast } from "sonner"

// Import Quill secara dinamis agar tidak error di Server Side Rendering (SSR)
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-zinc-50 animate-pulse rounded-2xl flex items-center justify-center text-zinc-400">Memuat Editor...</div>
})

export default function CreateArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  // States untuk Form
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorBio, setAuthorBio] = useState("")
  
  // States untuk File & Preview
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [authorPhoto, setAuthorPhoto] = useState<File | null>(null)
  const [authorPreview, setAuthorPreview] = useState<string | null>(null)

  // 1. Ambil Kategori dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/categories")
        const json = await res.json()
        if (json.success) setCategories(json.data)
      } catch (err) {
        console.error("Gagal mengambil kategori")
      }
    }
    fetchCategories()
  }, [])

  // 2. Handle Preview Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'author') => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (type === 'cover') {
        setCoverImage(file)
        setCoverPreview(url)
      } else {
        setAuthorPhoto(file)
        setAuthorPreview(url)
      }
    }
  }

  // 3. Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content || content === "<p><br></p>") return toast.error("Isi artikel tidak boleh kosong!")

    setLoading(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("category_id", categoryId)
    formData.append("author_name", authorName)
    formData.append("author_bio", authorBio)
    formData.append("status", "published") // Langsung publish
    
    if (coverImage) formData.append("cover_image", coverImage)
    if (authorPhoto) formData.append("author_photo", authorPhoto)

    try {
      const response = await fetch("https://backend.mejatika.com/api/student/articles", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Pastikan token tersimpan
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Karya kamu berhasil diterbitkan!")
        router.push("/dashboardpelajar/articles/my")
      } else {
        toast.error(result.message || "Gagal menerbitkan artikel")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      {/* Header & Tombol Kembali */}
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="rounded-full hover:bg-amber-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Tulis Karya Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* INPUT JUDUL & KATEGORI */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-950 p-4">
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-3">
              <Label className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-zinc-500">
                <Type className="w-4 h-4" /> Judul Artikel
              </Label>
              <Input 
                placeholder="Apa judul menarik untuk karyamu hari ini?" 
                className="h-14 rounded-2xl text-lg font-bold border-zinc-100 focus:ring-amber-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-3">
              <Label className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-zinc-500">
                <LayoutGrid className="w-4 h-4" /> Pilih Kategori
              </Label>
              <select 
                className="h-14 w-full rounded-2xl border border-zinc-100 bg-background px-4 font-medium focus:ring-2 ring-amber-500 outline-none appearance-none cursor-pointer"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori Artikel --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* EDITOR RICH TEXT (RE-QUILL) */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-amber-500 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span className="font-black uppercase italic tracking-widest text-sm">Ruang Menulis</span>
            </div>
            <span className="text-[10px] font-bold opacity-80 uppercase">Mendukung Tabel & Gambar</span>
          </div>
          <div className="p-2 min-h-[450px]">
            <ReactQuill 
              theme="snow" 
              value={content}
              onChange={setContent}
              placeholder="Mulailah mengetik keajaiban di sini..."
              className="h-full border-none"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link', 'image', 'video'],
                  ['clean']
                ],
              }}
            />
          </div>
        </Card>

        {/* MEDIA & PENULIS */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* UPLOAD COVER */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl p-6 space-y-4">
            <Label className="font-black uppercase text-sm italic flex items-center gap-2">
              <ImageIcon className="text-amber-500" /> Sampul Artikel
            </Label>
            <div className="relative h-48 w-full bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-400 text-xs font-bold uppercase">Belum ada foto</span>
              )}
              <Input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => handleFileChange(e, 'cover')}
              />
            </div>
            <p className="text-[10px] text-zinc-400 text-center font-bold italic">Klik area di atas untuk upload sampul (.jpg, .png, max 2MB)</p>
          </Card>

          {/* INFO PENULIS (SISWA) */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl p-6 space-y-4">
            <Label className="font-black uppercase text-sm italic flex items-center gap-2">
              <UserCircle className="text-amber-500" /> Profil Penulis
            </Label>
            <div className="space-y-3">
              <Input 
                placeholder="Nama Lengkap / Nama Pena" 
                className="rounded-xl"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden border">
                  {authorPreview ? <img src={authorPreview} className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-zinc-300" />}
                </div>
                <Input 
                  type="file" 
                  className="rounded-xl text-xs" 
                  onChange={(e) => handleFileChange(e, 'author')}
                />
              </div>
              <textarea 
                className="w-full p-4 rounded-2xl border border-zinc-100 text-sm focus:ring-2 ring-amber-500 outline-none h-24"
                placeholder="Biografi singkat (Contoh: Siswa XII RPL yang suka menulis kode dan puisi)"
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto min-w-[300px] h-16 rounded-full bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-sm shadow-2xl transition-all group"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            )}
            {loading ? "Sedang Menerbitkan..." : "Terbitkan Karya Saya"}
          </Button>
        </div>
      </form>
    </div>
  )
}
