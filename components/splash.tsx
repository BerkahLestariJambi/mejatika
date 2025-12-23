"use client"

import { BookOpen } from "lucide-react"

export function Splash() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <BookOpen className="w-20 h-20 text-white animate-bounce" />
            <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-2 text-balance">MEJATIKA</h1>
        <p className="text-white/90 text-lg">Platform Pembelajaran Digital</p>
      </div>
    </div>
  )
}
