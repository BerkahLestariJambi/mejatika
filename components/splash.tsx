"use client"

import Image from "next/image"

export function Splash() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {/* Mengganti ikon Lucide dengan logo PNG Anda */}
            <div className="w-32 h-32 relative animate-bounce">
              <Image 
                src="/logo-mejatika.png" // Pastikan file ada di folder public
                alt="Logo Mejatika"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Efek cahaya di belakang logo */}
            <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl animate-pulse -z-10" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-2 text-balance tracking-tight">
          MEJATIKA
        </h1>
        <p className="text-white/90 text-lg font-medium">
          Media Belajar Informatika
        </p>
      </div>
    </div>
  )
}
