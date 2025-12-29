"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData)

    try {
      const res = await fetch("https://backend.mejatika.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (res.ok) {
        // Registrasi sukses, arahkan ke login
        router.push("/login?success=Account created successfully")
      } else {
        // Menampilkan pesan error dari Laravel (misal: email sudah ada)
        setError(result.message || "Registrasi gagal. Silakan periksa data Anda.")
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-zinc-900">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">
            Join <span className="text-amber-500">Mejatika</span>
          </CardTitle>
          <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">
            Daftar untuk mulai belajar kursus modern
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase italic border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input name="name" placeholder="Nama Anda" required className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input name="email" type="email" placeholder="email@example.com" required className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input name="password" type="password" placeholder="••••••••" required className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input name="password_confirmation" type="password" placeholder="••••••••" required className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-zinc-900 hover:bg-amber-600 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2 text-white">Buat Akun Mejatika <ArrowRight size={18} /></span>
              )}
            </Button>

            <p className="mt-8 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-amber-600 hover:text-zinc-900 underline underline-offset-4 decoration-2 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
