"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function CourseModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    instructor: "",
    price: "",
    image: "",
    status: "active"
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://backend.mejatika.com/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Jika backend butuh token, tambahkan di bawah ini
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) // Konversi ke angka agar DB tidak error
        })
      })

      if (response.ok) {
        alert("Data Kursus Berhasil Disimpan!")
        onSuccess() // Memanggil fungsi fetch ulang di halaman utama
        onClose()
      } else {
        const error = await response.json()
        alert(`Gagal: ${error.message || "Terjadi kesalahan pada server"}`)
      }
    } catch (err) {
      alert("Koneksi ke backend gagal. Pastikan API menyala.")
    } finally {
      setLoading(false)
    }
  }

  // Render Form UI...
}
