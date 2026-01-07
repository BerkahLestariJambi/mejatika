"use client"

import { Bell } from "lucide-react"
import { useEffect, useState } from "react"

export function RunningText() {
  const [newsText, setNewsText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mengambil data dari endpoint publik (tanpa token)
    fetch("https://backend.mejatika.com/api/settings/public")
      .then((res) => res.json())
      .then((result) => {
        // Karena endpoint mengembalikan array, kita cari yang key-nya 'running_text'
        const runningTextSetting = result.data.find(
          (s: { key: string; value: string }) => s.key === "running_text"
        )
        if (runningTextSetting) {
          setNewsText(runningTextSetting.value)
        }
      })
      .catch((error) => {
        console.error("Failed to load running text:", error)
      })
      .finally(() => setLoading(false))
  }, [])

  // Jika sedang loading atau teks kosong, jangan tampilkan apa-apa
  if (loading || !newsText) return null

  // Pecah teks berdasarkan karakter "|"
  const newsItems = newsText.split("|").map((item) => item.trim())

  return (
    <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3">
        {/* Label Pengumuman */}
        <div className="flex items-center gap-2 shrink-0 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-bold animate-pulse">
          <Bell className="w-4 h-4" />
          <span>INFO</span>
        </div>

        {/* Area Teks Berjalan */}
        <div className="overflow-hidden relative w-full">
          <div className="animate-marquee whitespace-nowrap py-1">
            {/* Kita render dua kali agar transisi marquee tidak terputus (infinite loop effect) */}
            {[...newsItems, ...newsItems].map((item, index) => (
              <span key={index} className="inline-block mx-10 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
