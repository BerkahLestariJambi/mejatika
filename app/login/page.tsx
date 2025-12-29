"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Import Link untuk navigasi internal
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, Loader2, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://backend.mejatika.com/api/login", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.message || "Login gagal")
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      // Redirect berdasarkan role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else if (data.user.role === "kontributor") {
        router.push("/kontributor")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-10 pb-6">
          <div className="mx-auto h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-zinc-200">
            <ShieldCheck className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            Welcome <span className="text-amber-500">Back</span>
          </CardTitle>
          <CardDescription className="font-bold text-xs uppercase tracking-widest text-zinc-400">
            Masuk untuk mengakses materi kursus Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-100 text-red-600 rounded-xl">
                <AlertDescription className="font-bold uppercase italic text-[10px] tracking-wider">
                    {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 ml-1">Secret Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 rounded-xl h-12 border-zinc-100 bg-zinc-50/50 focus:ring-amber-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase tracking-[0.1em] transition-all mt-4 shadow-lg" 
                disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">Login Mejatika <ArrowRight size={18} /></span>
              )}
            </Button>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                Belum punya akun?{" "}
                <Link href="/register" className="text-amber-600 hover:text-zinc-900 underline underline-offset-4">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
