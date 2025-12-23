"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    image: "/placeholder.jpg?height=400&width=1200&query=online+learning+classroom",
    title: "Belajar Bersama MEJATIKA",
    description: "Platform pembelajaran terpadu untuk mengembangkan keterampilan Anda",
  },
  {
    id: 2,
    image: "/placeholder.jpg?height=400&width=1200&query=digital+course+students",
    title: "Kursus Online Berkualitas",
    description: "Akses materi pembelajaran kapan saja dan dimana saja",
  },
  {
    id: 3,
    image: "/placeholder.jpg?height=400&width=1200&query=certificate+graduation",
    title: "Dapatkan Sertifikat Resmi",
    description: "Tingkatkan kredibilitas dengan sertifikat yang diakui",
  },
]

export function Header() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <header className="relative bg-card">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-balance animate-fade-in">{slide.title}</h2>
                <p className="text-lg md:text-xl text-white/90 text-pretty">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}

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

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
