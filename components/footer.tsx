import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Globe } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    // Warna bg-zinc-950 (Midnight Black) agar sinkron dengan Navigasi
    <footer className="bg-zinc-950 text-zinc-400 mt-12 border-t border-white/5 relative overflow-hidden">
      
      {/* Efek Garis Emas Halus di bagian paling atas footer */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Texture Carbon Fibre - SAMA PERSIS dengan Navigasi di gambar Anda */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />

      <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          {/* KOLOM 1: BRAND & SLOGAN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="relative p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl transition-transform group-hover:scale-105">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white italic leading-none">MEJATIKA</span>
                <span className="text-[9px] font-bold text-amber-500 tracking-[0.15em] uppercase mt-1">
                  Media Belajar Informatika
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 text-pretty">
              Warta digital dan platform pembelajaran IT terpercaya. Kami berfokus pada pengembangan literasi informatika dari Flores untuk Indonesia.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all duration-300 border border-white/5">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: KONTAK (INFO HUBUNGI) */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Informasi Kontak
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                  <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-zinc-400 group-hover:text-white transition-colors">info@mejatika.com</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                  <Phone className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-zinc-400 group-hover:text-white transition-colors">+62 812 3702 6025</span>
              </div>
            </div>
          </div>

          {/* KOLOM 3: NAVIGASI DENGAN TITIK EMAS (SAMA DENGAN HEADER) */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Navigasi Cepat
            </h3>
            <div className="grid grid-cols-1 gap-4 text-[11px] font-bold uppercase tracking-widest">
              {["Tentang Kami", "Daftar Berita", "Kursus IT", "Galeri Foto", "Hubungi Kami"].map((item) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="text-zinc-500 hover:text-amber-500 transition-all flex items-center gap-3 group"
                >
                  {/* TITIK EMAS DENGAN EFEK GLOW */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- BAGIAN BAWAH (COPYRIGHT + POLICY) --- */}
        <div className="border-t border-white/5 mt-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                &copy; {new Date().getFullYear()} <span className="text-white">MEJATIKA</span>. All Rights Reserved.
              </p>
            </div>
            
            {/* PRIVACY & TERMS (Dah balik lagi, Bos!) */}
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.15em]">
              <Link href="/privacy" className="text-zinc-500 hover:text-amber-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-zinc-500 hover:text-amber-500 transition-colors">
                Terms & Conditions
              </Link>
              <div className="flex items-center gap-2 text-zinc-700">
                <Globe className="w-3 h-3" />
                <span>ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
