"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function Splash() {
  const [bgImage, setBgImage] = useState<string>("")

  useEffect(() => {
    // Ambil gambar pertama dari API Slider untuk jadi background splash
    fetch("https://backend.mejatika.com/api/sliders")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setBgImage(json.data[0].image) // Ambil gambar pertama
        }
      })
      .catch((err) => console.error("Error fetching splash bg:", err))
  }, [])

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[99999] overflow-hidden">
      
      {/* BACKGROUND EFEK PECAH KOTAK & OVAL */}
      <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2 opacity-40">
        {[...Array(48)].map((_, i) => (
          <div 
            key={i}
            className={`relative w-full h-full overflow-hidden transition-all duration-1000 ${
              i % 2 === 0 ? "rounded-2xl" : "rounded-full scale-90"
            }`}
            style={{ 
              animation: `pulse-fade 3s infinite ${i * 0.1}s`,
              backgroundColor: '#18181b'
            }}
          >
            {bgImage && (
              <img 
                src={bgImage} 
                alt="bg-fragment" 
                className="w-full h-full object-cover grayscale brightness-50"
                style={{
                  // Memberikan efek koordinat yang berbeda di setiap kotak
                  objectPosition: `${(i % 8) * 14}% ${Math.floor(i / 8) * 20}%`,
                  scale: '2'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* GRADIENT OVERLAY SUPAYA TEKS TETAP JELAS */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950" />

      {/* KONTEN UTAMA */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Logo dengan Animasi Bounce & Glow */}
            <div className="w-32 h-32 relative animate-bounce duration-[2000ms]">
              <Image 
                src="/logo.png" 
                alt="Logo Mejatika"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                priority
              />
            </div>
            {/* Cahaya Pijar di belakang logo */}
            <div className="absolute -inset-10 bg-amber-500/20 rounded-full blur-[60px] animate-pulse" />
          </div>
        </div>

        {/* TEKS BRAND */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic animate-pulse">
            MEJATIKA
          </h1>
          <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full" />
          <p className="text-amber-500/90 text-sm md:text-lg font-bold uppercase tracking-[0.3em] mt-4">
            Media Belajar Informatika
          </p>
        </div>

        {/* LOADING INDICATOR HALUS */}
        <div className="mt-12 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-white rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s` }} 
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
