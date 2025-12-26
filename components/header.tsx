"use client"

import { useState, useEffect } from "react"
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

  // Ambil data slider dari backend
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/sliders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // kalau butuh auth
          },
        })
        const data = await res.json()
        setSlides(data)
      } catch (err) {
        console.error("Gagal fetch sliders:", err)
      }
    }
    fetchSliders()
  }, [])

  // Auto-slide setiap 5 detik
  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return (
      <header className="relative bg-card h-[300px] md:h-[400px] flex items-center justify-center text-white">
        <p>Loading slider...</p>
      </header>
    )
  }

  return (
    <header className="relative bg-card">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0 z-10"
                : "opacity-0 -translate-x-full z-0"
            }`}
          >
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="text-lg md:text-xl text-white/90">{slide.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* tombol navigasi */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* indikator dot */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-6" : "bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
