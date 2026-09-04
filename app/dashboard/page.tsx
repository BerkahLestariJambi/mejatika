"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
// Sesuaikan import komponen UI/Layout sesuai struktur proyekmu
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.mejatika.com/api"

export default function DashboardPage() {
  const router = useRouter()

  // State Utama
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false)

  // State Form Profil
  const [profileName, setProfileName] = useState<string>("")
  const [profileEmail, setProfileEmail] = useState<string>("")
  const [profilePassword, setProfilePassword] = useState<string>("")
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")

  // Fetch Data Dashboard & Profil
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
          "Accept": "application/json",
        },
      })

      if (!resUser.ok) throw new Error("Sesi tidak valid")

      const dataUser = await resUser.json()
      const userData = dataUser.data || dataUser

      setUser(userData)
      setProfileName(userData.name || "")
      setProfileEmail(userData.email || "")
      setPhotoPreview(userData.avatar_url || userData.photo || "")
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

  // Handle Pilih Foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  // Handle Simpan Profil (Fix Error 403 & 405)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    const token = localStorage.getItem("token")

    try {
      const formData = new FormData()
      formData.append("name", profileName)
      formData.append("email", profileEmail)

      if (profilePassword) {
        formData.append("password", profilePassword)
      }
      if (profilePhoto) {
        formData.append("photo", profilePhoto)
      }

      // Kirim via POST langsung ke /profile tanpa ID dan tanpa _method PUT
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
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-slate-600">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* 1. Sidebar Navigasi */}
      <Sidebar user={user} />

      <div className="flex flex-1 flex-col">
        {/* 2. Header Atas */}
        <Header user={user} />

        {/* 3. Konten Utama Dashboard */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
            <p className="mb-6 text-sm text-slate-500">
              Kelola data profil dan foto akun milikmu.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {/* Avatar Preview & Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-indigo-600 bg-slate-200">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                      NO PHOTO
                    </div>
                  )}
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

              {/* Input Nama */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-700">
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

              {/* Input Email */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-700">
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

              {/* Input Password */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-700">
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
        </main>
      </div>
    </div>
  )
}
