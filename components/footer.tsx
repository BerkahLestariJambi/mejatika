import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    // Warna bg-zinc-950/95 agar sama persis dengan Navigasi di gambar
    <footer className="bg-zinc-950 text-zinc-400 mt-12 border-t border-white/5 relative overflow-hidden">
      
      {/* Efek Garis Emas Halus di bagian paling atas footer */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Texture Carbon Fibre (Sama dengan Navigasi di gambar Anda) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />

      <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          {/* KOLOM 1: BRAND & SLOGAN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="relative p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white italic leading-none">MEJATIKA</span>
                <span className="text-[9px] font-bold text-amber-500 tracking-[0.15em] uppercase mt-1">
                  Media Belajar Informatika
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Platform edukasi digital untuk mengasah logika dan kreativitas di bidang teknologi informasi. Dari Flores untuk masa depan digital Indonesia.
            </p>
          </div>

          {/* KOLOM 2: KONTAK */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Kontak Kami
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-zinc-300 group-hover:text-white transition-colors">info@mejatika.com</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Phone className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-zinc-300 group-hover:text-white transition-colors">+62 812 3702 6025</span>
              </div>
            </div>
          </div>

          {/* KOLOM 3: NAVIGASI DENGAN TITIK EMAS (Sama dengan Style Menu) */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Navigasi
            </h3>
            <div className="grid grid-cols-1 gap-4 text-[11px] font-bold uppercase tracking-wider">
              {["Tentang Kami", "Berita", "Kursus", "Galery", "Kontak"].map((item) => (
                <a 
                  key={item}
                  href={`/${item.toLowerCase()}`} 
                  className="text-zinc-500 hover:text-amber-500 transition-all flex items-center gap-3 group"
                >
                  {/* TITIK EMAS KECIL */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-amber-500/60 group-hover:bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all" />
                  </div>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/5 mt-16 pt-8 text-center md:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            &copy; {new Date().getFullYear()} <span className="text-amber-500/80">MEJATIKA</span>. Crafted in Indonesia.
          </p>
        </div>
      </div>
    </footer>
  )
}
