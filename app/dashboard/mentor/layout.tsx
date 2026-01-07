import DashboardSidebar from "@/components/dashboard/Sidebar"

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar tetap di kiri */}
      <DashboardSidebar />
      
      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-zinc-100 flex items-center justify-end px-10 sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase text-zinc-900">Status Akun</p>
                 <p className="text-[9px] font-bold text-green-500 uppercase">Terverifikasi</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-white shadow-sm flex items-center justify-center text-amber-600 font-bold">
                 M
              </div>
           </div>
        </header>
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
