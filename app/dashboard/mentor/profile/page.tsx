"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Camera, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function MentorProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    bio: "",
    specialization: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API_BASE}/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Accept": "application/json"
          },
        })
        const data = await res.json()
        
        // Load data mentor_profile jika sudah ada
        if (data.mentor_profile) {
          setFormData({
            bio: data.mentor_profile.bio || "",
            specialization: data.mentor_profile.specialization || "",
          })
          setPreview(data.mentor_profile.photo)
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error)
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 2MB")
        return
      }
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const data = new FormData()
      
      data.append("bio", formData.bio)
      data.append("specialization", formData.specialization)
      
      // SOLUSI UTAMA: Laravel butuh _method POST/PUT di FormData jika mengunggah file
      data.append("_method", "POST") 

      if (photo) {
        data.append("photo", photo)
      }

      const res = await fetch(`${API_BASE}/mentor/profile`, {
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
          // JANGAN tambahkan Content-Type di sini, biarkan fetch yang mengaturnya otomatis
        },
        body: data,
      })

      const result = await res.json()

      if (res.ok) {
        toast.success("Profil berhasil diperbarui!")
        router.refresh() // Memperbarui cache data
        setTimeout(() => router.push("/dashboard/mentor"), 1500)
      } else {
        // Tangkap pesan error dari Laravel (Validation atau Exception)
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join(", ") 
          : result.message
        toast.error(errorMsg || "Gagal menyimpan data.")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Sinkronisasi Data...</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
          Lengkapi <span className="text-amber-500 text-5xl">Profil</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-widest">
          Panel Kontributor Mejatika • Informasi Publik
        </p>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white border-t-8 border-t-amber-500">
        <CardContent className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-zinc-100 border-[10px] border-zinc-50 shadow-2xl relative">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <Camera size={50} />
                    </div>
                  )}
                </div>
                
                <label className="absolute -bottom-2 -right-2 bg-zinc-900 text-white p-4 rounded-2xl cursor-pointer hover:bg-amber-500 transition-all shadow-xl hover:scale-110 active:scale-95">
                  <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  <Camera size={20} />
                </label>
              </div>
              <div className="text-center italic text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Unggah Foto Profesional (Maks 2MB)
              </div>
            </div>

            <div className="grid gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Keahlian Utama</label>
                <Input 
                  placeholder="Misal: Senior Laravel Developer" 
                  className="rounded-2xl border-zinc-100 h-16 bg-zinc-50/50 focus:bg-white text-sm font-bold"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Biografi Profesional</label>
                <Textarea 
                  placeholder="Ceritakan pengalaman Anda..." 
                  className="rounded-[2.5rem] border-zinc-100 min-h-[180px] bg-zinc-50/50 focus:bg-white p-6 text-sm font-medium leading-relaxed"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-amber-600 text-white h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.97]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Sedang Menyimpan...</span>
                </div>
              ) : "Update Profil Mentor"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-zinc-400">
        <AlertCircle size={14} />
        <p className="text-[10px] font-bold uppercase italic">Data ini akan melalui proses verifikasi tim Mejatika</p>
      </div>
    </div>
  )
}
