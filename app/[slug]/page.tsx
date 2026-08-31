import { notFound } from "next/navigation";

// Fungsi untuk mengambil data detail menu berdasarkan slug
async function getMenuData(slug: string) {
  try {
    // Pastikan endpoint ini mengembalikan detail menu berdasarkan slug
    const res = await fetch(`https://backend.mejatika.com/api/menus`, {
      cache: 'no-store' // Agar data selalu fresh
    });
    
    if (!res.ok) return null;
    
    const menus = await res.json();
    // Cari data yang slug-nya cocok dengan parameter URL
    return menus.find((m: any) => m.slug === slug);
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const menuData = await getMenuData(slug);

  // Jika slug tidak ditemukan di database, tampilkan halaman 404
  if (!menuData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header Halaman */}
      <div className="bg-amber-500 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            {menuData.name}
          </h1>
          <p className="text-amber-100 mt-4 font-medium uppercase tracking-widest text-sm">
            Halaman {menuData.name} Mejatika
          </p>
        </div>
      </div>

      {/* Konten Halaman */}
      <div className="container mx-auto max-w-4xl -mt-10 px-4 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-amber-100">
          <div className="prose prose-amber max-w-none">
            {/* Di sini Anda bisa menampilkan deskripsi atau konten dari DB jika ada */}
            <p className="text-zinc-600 leading-relaxed text-lg">
              Selamat datang di halaman <strong>{menuData.name}</strong>. 
              Konten untuk halaman ini sedang dalam proses pengembangan atau dapat diatur melalui dashboard admin.
            </p>
            
            {/* Info tambahan jika ini adalah submenu */}
            {menuData.parentId && (
              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-amber-700 text-sm font-bold">
                  Bagian dari: {menuData.parentId === 2 ? "Profil" : "Kategori Induk"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
