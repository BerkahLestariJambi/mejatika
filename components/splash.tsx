"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function Splash() {
  const [sliderImages, setSliderImages] = useState<string[]>([])

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/sliders")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const images = json.data.map((item: any) => item.image)
          setSliderImages(images)
        }
      })
      .catch((err) => console.error("Error:", err))
  }, [])

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[99999] overflow-hidden">
      
      {/* BACKGROUND PECAH KOTAK & OVAL DENGAN WARNA ASLI */}
      <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4 opacity-60">
        {[...Array(48)].map((_, i) => {
          const imgUrl = sliderImages.length > 0 
            ? sliderImages[i % sliderImages.length] 
            : null;

          return (
            <div 
              key={i}
              className={`relative w-full h-full overflow-hidden transition-all duration-1000 border border-white/5 ${
                i % 2 === 0 ? "rounded-2xl" : "rounded-full scale-90"
              }`}
              style={{ 
                animation: `float-slow 6s infinite ${i * 0.2}s alternate ease-in-out`,
              }}
            >
              {imgUrl && (
                <img 
                  src={imgUrl} 
                  alt="fragment" 
                  className="w-full h-full object-cover brightness-75 contrast-125" // Brightness dinaikkan ke 75%
                  style={{
                    objectPosition: `${(i * 20) % 100}% ${(i * 30) % 100}%`,
                    scale: '1.2'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* OVERLAY GELAP TIPIS (Hanya di pinggir agar tengah tetap fokus) */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/40 to-zinc-950" />

      {/* KONTEN UTAMA */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative group">
            {/* Logo */}
            <div className="w-36 h-36 relative animate-bounce duration-[3000ms]">
              <Image 
                src="/logo.png" 
                alt="Logo Mejatika"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]"
                priority
              />
            </div>
            {/* Efek Pijar Oranye */}
            <div className="absolute -inset-10 bg-amber-600/30 rounded-full blur-[100px] animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 bg-zinc-950/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
            MEJATIKA
          </h1>
          <div className="h-1 w-40 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
          <p className="text-amber-400 font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs">
            Media Belajar Informatika
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          100% { transform: translateY(-15px) rotate(3deg) scale(1.05); }
        }
        .bg-radial-gradient {
          background: radial-gradient(circle, transparent 20%, #09090b 100%);
        }
      `}</style>
    </div>
  )
}
