"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Camera, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner" // Pastikan library sonner terpasang untuk notifikasi

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

  // 1. Ambil data profil yang sudah ada saat halaman dibuka
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentor/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      if (res.ok) {
        toast.success("Profil berhasil diperbarui!")
        router.push("/dashboard/mentor")
      } else {
        toast.error("Gagal memperbarui profil.")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
          Lengkapi <span className="text-amber-500">Profil Mentor</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">Data ini akan tampil pada halaman kursus yang Anda ajar.</p>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Profil */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden bg-zinc-100 border-4 border-zinc-50 shadow-inner group">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Camera size={40} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  <span className="text-white text-[10px] font-bold uppercase">Ganti Foto</span>
                </label>
              </div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Foto Profesional</p>
            </div>

            {/* Spesialisasi */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Keahlian Utama</label>
              <Input 
                placeholder="Contoh: Senior Web Developer, UI/UX Designer" 
                className="rounded-xl border-zinc-100 h-12"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Biografi Singkat</label>
              <Textarea 
                placeholder="Ceritakan pengalaman profesional Anda..." 
                className="rounded-2xl border-zinc-100 min-h-[150px]"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-amber-600 text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Simpan Profil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
