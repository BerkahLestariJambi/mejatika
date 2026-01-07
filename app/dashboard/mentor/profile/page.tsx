"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Camera } from "lucide-react"
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

  // URL Base API Mejatika
  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        
        // Pastikan menyesuaikan dengan struktur response API /me Anda
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
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    const data = new FormData()
    data.append("bio", formData.bio)
    data.append("specialization", formData.specialization)
    if (photo) data.append("photo", photo)

    try {
      const res = await fetch(`${API_BASE}/mentor/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data, // FormData secara otomatis mengatur Content-Type menjadi multipart/form-data
      })

      const result = await res.json()

      if (res.ok) {
        toast.success("Profil berhasil diperbarui!")
        router.push("/dashboard/mentor")
      } else {
        toast.error(result.message || "Gagal memperbarui profil.")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Memuat Data...</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
          Lengkapi <span className="text-amber-500">Profil Mentor</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium">Data ini akan tampil pada halaman kursus yang Anda ajar.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Foto Profil Section */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-36 h-36 rounded-[2.5rem] overflow-hidden bg-zinc-100 border-8 border-zinc-50 shadow-inner group">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <Camera size={48} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm">
                  <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  <Camera className="text-white mb-1" size={24} />
                  <span className="text-white text-[10px] font-black uppercase tracking-tighter">Ganti Foto</span>
                </label>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Pas Foto Profesional</p>
                <p className="text-[9px] text-zinc-400 mt-1">Format: JPG, PNG (Maks. 2MB)</p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Spesialisasi */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 ml-1">Bidang Keahlian / Spesialisasi</label>
                <Input 
                  placeholder="Contoh: Fullstack Web Developer, Desainer Grafis" 
                  className="rounded-2xl border-zinc-100 h-14 bg-zinc-50/50 focus:bg-white transition-all shadow-sm"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 ml-1">Biografi & Pengalaman Singkat</label>
                <Textarea 
                  placeholder="Tuliskan ringkasan profil dan pengalaman Anda mengajar atau bekerja di bidang tersebut..." 
                  className="rounded-[2rem] border-zinc-100 min-h-[160px] bg-zinc-50/50 focus:bg-white transition-all shadow-sm p-5"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-zinc-200 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sedang Menyimpan...</span>
                </div>
              ) : "Simpan Profil Mentor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
