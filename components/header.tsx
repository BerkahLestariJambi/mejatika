"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Slider = {
  id: number
  image: string
  title: string
  description?: string
}

export function Header() {
  const [slides, setSlides] = useState<Slider[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Konfigurasi Grid (Pecah-pecah kotak)
  const columns = 10;
  const rows = 6;

  // Generate kepingan kotak secara acak
  const tiles = useMemo(() => {
    return Array.from({ length: columns * rows }).map((_, i) => ({
      id: i,
      x: i % columns,
      y: Math.floor(i / columns),
      delay: Math.random() * 0.5, // Delay acak untuk setiap kotak
    }));
  }, []);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/sliders")
        const data = await res.json()
        setSlides(data)
      } catch (err) {
        console.error("Gagal fetch sliders:", err)
      }
    }
    fetchSliders()
  }, [])

  // Auto-slide logic
  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      handleNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [slides, currentSlide])

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsTransitioning(false)
    }, 600) // Sinkron dengan durasi animasi pecah
  }

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      setIsTransitioning(false)
    }, 600)
  }

  if (slides.length === 0) {
    return (
      <header className="relative bg-card h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Memuat Slider Mejatika...</div>
      </header>
    )
  }

  return (
    <header className="relative group bg-background border-b border-border">
      <div className="relative h-[350px] md:h-[500px] w-full overflow-hidden">
        
        {/* Layer Animasi Pecah Kotak */}
        <div className="pixel-grid-container z-10">
          {tiles.map((tile) => (
            <div
              key={`${currentSlide}-${tile.id}`} // Key berubah saat slide ganti untuk trigger ulang animasi
              className="pixel-tile"
              style={{
                backgroundImage: `url(${slides[currentSlide].image})`,
                backgroundPosition: `${(tile.x / (columns - 1)) * 100}% ${(tile.y / (rows - 1)) * 100}%`,
                animationDelay: `${tile.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Overlay Content (Title & Desc) */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl overflow-hidden">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter animate-scale-in mb-2">
                {slides[currentSlide].title}
              </h2>
              {slides[currentSlide].description && (
                <p className="text-lg md:text-xl text-white/80 animate-fade-in delay-300">
                  {slides[currentSlide].description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigasi */}
        <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Indikator Dot */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentSlide(index)
                  setIsTransitioning(false)
                }, 500)
              }}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                index === currentSlide ? "bg-primary w-12" : "bg-white/30 w-4 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
