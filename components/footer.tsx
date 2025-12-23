import { BookOpen, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6" />
              <span className="font-bold text-xl">MEJATIKA</span>
            </div>
            <p className="text-sm text-primary-foreground/80 text-pretty">
              Platform pembelajaran digital terpercaya untuk mengembangkan keterampilan dan karir Anda.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kontak</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@mejatika.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+62 123 4567 890</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tautan</h3>
            <div className="space-y-2 text-sm">
              <a href="/tentang" className="block hover:text-accent-foreground transition-colors">
                Tentang Kami
              </a>
              <a href="/kontak" className="block hover:text-accent-foreground transition-colors">
                Hubungi Kami
              </a>
              <a href="/faq" className="block hover:text-accent-foreground transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p>&copy; 2025 MEJATIKA. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-accent-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-accent-foreground transition-colors">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
