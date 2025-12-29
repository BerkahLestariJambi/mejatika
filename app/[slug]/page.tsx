import { notFound } from "next/navigation";
import { Metadata } from "next";

// Fungsi untuk SEO dinamis
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const menu = await getMenuData(params.slug);
  return {
    title: menu ? `${menu.name} | MEJATIKA` : "Halaman Tidak Ditemukan",
    description: `Informasi mengenai ${menu?.name} di Mejatika`,
  };
}

// Fungsi Fetch spesifik per slug
async function getMenuData(slug: string) {
  try {
    // Mengambil data langsung dari endpoint detail per slug
    const res = await fetch(`https://backend.mejatika.com/api/menus/${slug}`, {
      cache: 'no-store' 
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const menuData = await getMenuData(slug);

  // Jika slug tidak ada di DB, arahkan ke 404
  if (!menuData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header Halaman dengan Desain Konsisten */}
      <div className="bg-amber-500 pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Dekorasi Batik Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
            {menuData.name}
          </h1>
          <div className="h-1 w-20 bg-white mx-auto mt-4 rounded-full" />
        </div>
      </div>

      {/* Konten Halaman */}
      <div className="container mx-auto max-w-4xl -mt-12 px-4 pb-20 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-14 border border-amber-100">
          <div className="prose prose-amber max-w-none">
            {/* Tampilan Konten Utama */}
            <div className="space-y-6">
              <p className="text-zinc-700 leading-relaxed text-lg first-letter:text-5xl first-letter:font-black first-letter:text-amber-500 first-letter:mr-3 first-letter:float-left">
                Selamat datang di halaman resmi <strong>{menuData.name}</strong> Mejatika. 
                Saat ini kami sedang menyiapkan konten informatif yang lengkap untuk bagian ini.
              </p>
              
              <p className="text-zinc-600 leading-relaxed">
                Anda dapat memantau pembaruan konten secara berkala melalui platform kami. 
                Jika Anda adalah pengelola, Anda dapat mengisi konten ini melalui Dashboard Admin pada menu Manajemen Navigasi.
              </p>
            </div>
            
            {/* Info Hierarki */}
            {menuData.parentId && (
              <div className="mt-12 flex items-center gap-4 p-5 bg-zinc-50 rounded-2xl border-l-4 border-amber-500">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600 font-bold text-xs uppercase">
                  Info Parent
                </div>
                <p className="text-zinc-500 text-sm font-medium m-0">
                  Halaman ini merupakan bagian dari menu <strong>{menuData.parentId === 2 ? "Profil" : "Induk"}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
