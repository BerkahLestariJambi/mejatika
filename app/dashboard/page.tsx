"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.mejatika.com/api"

export default function DashboardPage() {
  const router = useRouter()
  
  // State Data
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false)

  // State Form Profil
  const [profileName, setProfileName] = useState<string>("")
  const [profileEmail, setProfileEmail] = useState<string>("")
  const [profilePassword, setProfilePassword] = useState<string>("")
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("/placeholder-avatar.png")

  // Fetch Data Pengguna
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const resUser = await fetch(`${API_URL}/me`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      })

      if (!resUser.ok) throw new Error("Sesi telah berakhir")

      const dataUser = await resUser.json()
      const userData = dataUser.data || dataUser

      setUser(userData)
      setProfileName(userData.name || "")
      setProfileEmail(userData.email || "")
      if (userData.avatar_url || userData.photo) {
        setPhotoPreview(userData.avatar_url || userData.photo)
      }
    } catch (err: any) {
      console.error("Fetch Error:", err)
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Preview Foto Profil saat Diunggah
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  // Handler Submit Pembaruan Profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    const token = localStorage.getItem("token")

    try {
      const formData = new FormData()
      
      // Method spoofing untuk Laravel jika mengirim multipart via POST
      formData.append("_method", "PUT") 
      formData.append("name", profileName)
      formData.append("email", profileEmail)
      
      if (profilePassword) {
        formData.append("password", profilePassword)
      }
      if (profilePhoto) {
        formData.append("photo", profilePhoto) // ganti dengan 'avatar' jika backend menggunakannya
      }

      // Endpoint /profile tanpa ID untuk menghindari 403 Forbidden
      const res = await fetch(`${API_URL}/profile`, {
        method: "POST", 
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui profil.")
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil kamu berhasil diperbarui.",
        timer: 2000,
        showConfirmButton: false,
      })

      // Update state lokal
      const updatedUser = data.data || data
      setUser(updatedUser)
      setProfilePassword("")
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Terjadi kesalahan sistem.",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Memuat data...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-sm text-slate-500 mb-6">Kelola data profil dan foto akun milikmu.</p>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-indigo-600">
              <img
                src={photoPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <label className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
              Ubah Foto
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Alamat Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Alamat Email *
            </label>
            <input
              type="email"
              required
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password Baru (Kosongkan jika tidak diganti)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan Profil"}
          </button>
        </form>
      </div>
    </div>
  )
}
