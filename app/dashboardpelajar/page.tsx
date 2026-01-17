"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, BookText, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DashboardPelajarHome() {
  return (
    <div className="min-h-screen bg-[#fafafa] p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="bg-amber-500 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-200">
          <BookText className="text-white h-10 w-10" />
        </div>
        
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Halo, <span className="text-amber-500">Penulis Muda!</span>
        </h1>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto">
          Siap untuk membagikan pemikiranmu hari ini? Gunakan editor AI kami untuk hasil terbaik.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link href="/dashboardpelajar/articles/create">
            <Button className="h-16 px-10 rounded-2xl bg-zinc-900 hover:bg-amber-600 text-white font-black uppercase tracking-widest transition-all">
              <Plus className="mr-2 h-5 w-5" /> Tulis Artikel Baru
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
