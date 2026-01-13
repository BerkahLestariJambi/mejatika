import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 mt-12 border-t border-white/5 relative overflow-hidden">
      {/* Efek Garis Emas Halus di bagian paling atas footer (seperti di Navigasi) */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Texture Overlay (Carbon Fibre) agar sama dengan Navigasi */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />

      <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          {/* KOLOM 1: BRAND & SLOGAN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-zinc-900 border border-white/10 rounded-xl">
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
              Platform edukasi digital terdepan untuk mengasah logika dan kreativitas di bidang teknologi informasi. Dari Flores untuk masa depan digital Indonesia.
            </p>
            {/* Social Media Mini Icons */}
            <div className="flex gap-4 pt-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: KONTAK & ALAMAT */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Kontak
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Email</span>
                  <span className="text-zinc-300 hover:text-white transition-colors">info@mejatika.com</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <Phone className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">WhatsApp</span>
                  <span className="text-zinc-300 hover:text-white transition-colors">+62 812 3702 6025</span>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Lokasi</span>
                  <span className="text-zinc-300 leading-relaxed">
                    Kisol, Kel. Tanah Rata, Kec. Kota Komba, <br />
                    Manggarai Timur, Flores, NTT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM 3: TAUTAN CEPAT */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500"></span> Navigasi
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm font-medium">
              {["Tentang Kami", "Hubungi Kami", "FAQ", "Arsip Warta"].map((item) => (
                <a 
                  key={item}
                  href={`/${item.toLowerCase().replace(/\s+/g, '')}`} 
                  className="text-zinc-500 hover:text-amber-500 transition-all flex items-center gap-3 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            &copy; {new Date().getFullYear()} <span className="text-amber-500/80">MEJATIKA</span>. Crafted for Excellence.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
