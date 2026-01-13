import { BookOpen, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 mt-12 border-t border-amber-500/20 relative overflow-hidden">
      {/* Efek Gradasi Halus di Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Kolom Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">MEJATIKA</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 text-pretty">
              Warta Digital & Pembelajaran terpercaya dari jantung Flores untuk mengembangkan wawasan dan karakter Anda.
            </p>
          </div>

          {/* Kolom Kontak */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-amber-500"></span> Kontak Kami
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-200 transition-colors">info@mejatika.com</span>
              </div>
              <div className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-200 transition-colors">+62 812 3702 6025</span>
              </div>
              <div className="flex items-start gap-3 group">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-200 transition-colors">
                  Kisol, Kel. Tanah Rata, Kec. Kota Komba, <br /> 
                  Kab. Manggarai Timur, Flores, NTT
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Tautan */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-amber-500"></span> Navigasi
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {["Tentang Kami", "Hubungi Kami", "FAQ"].map((item) => (
                <a 
                  key={item}
                  href={`/${item.toLowerCase().replace(/\s+/g, '')}`} 
                  className="hover:text-amber-500 transition-all flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-amber-500 transition-colors"></span>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Garis Pemisah Bawah */}
        <div className="border-t border-zinc-900 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              &copy; {new Date().getFullYear()} <span className="text-zinc-400">MEJATIKA</span>. Handcrafted in Flores.
            </p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
              <a href="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-amber-500 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
