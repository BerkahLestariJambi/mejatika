"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function Splash() {
  const [sliderImages, setSliderImages] = useState<string[]>([])

  useEffect(() => {
    // Ambil SEMUA gambar dari API Slider
    fetch("https://backend.mejatika.com/api/sliders")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          // Simpan semua URL gambar ke dalam array
          const images = json.data.map((item: any) => item.image)
          setSliderImages(images)
        }
      })
      .catch((err) => console.error("Error fetching splash bgs:", err))
  }, [])

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[99999] overflow-hidden">
      
      {/* BACKGROUND EFEK PECAH KOTAK & OVAL (GANTI-GANTI GAMBAR) */}
      <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2 opacity-30">
        {[...Array(48)].map((_, i) => {
          // Pilih gambar secara acak dari array sliderImages untuk setiap kotak
          const randomImg = sliderImages.length > 0 
            ? sliderImages[i % sliderImages.length] 
            : null;

          return (
            <div 
              key={i}
              className={`relative w-full h-full overflow-hidden transition-all duration-1000 ${
                i % 2 === 0 ? "rounded-2xl" : "rounded-full scale-90"
              }`}
              style={{ 
                animation: `pulse-fade 4s infinite ${i * 0.15}s`,
                backgroundColor: '#09090b'
              }}
            >
              {randomImg && (
                <img 
                  src={randomImg} 
                  alt="bg-fragment" 
                  className="w-full h-full object-cover grayscale brightness-[0.4] hover:brightness-100 transition-all duration-700"
                  style={{
                    // Koordinat acak supaya gambar tidak kelihatan sama persis posisinya
                    objectPosition: `${(i * 17) % 100}% ${(i * 23) % 100}%`,
                    scale: '1.5'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* GRADIENT OVERLAY HITAM PEKAT */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950" />

      {/* KONTEN UTAMA */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Logo Bounce */}
            <div className="w-32 h-32 relative animate-bounce duration-[2500ms]">
              <Image 
                src="/logo.png" 
                alt="Logo Mejatika"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                priority
              />
            </div>
            <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-[80px] animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic drop-shadow-2xl">
            MEJATIKA
          </h1>
          <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full" />
          <p className="text-amber-500 font-bold uppercase tracking-[0.4em] mt-4 text-[10px] md:text-sm">
            Media Belajar Informatika
          </p>
        </div>

        {/* Loading dots */}
        <div className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s` }} 
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.2; transform: scale(0.95) rotate(-2deg); }
          50% { opacity: 0.5; transform: scale(1.05) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
