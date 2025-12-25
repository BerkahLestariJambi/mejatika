"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login gagal")
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      if (data.user.role === "admin") {
        router.push("/admin")
      } else if (data.user.role === "kontributor") {
        router.push("/kontributor")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold text-center">Masuk ke MEJATIKA</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
      </form>
    </div>
  )
}
