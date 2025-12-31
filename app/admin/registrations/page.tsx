"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Loader2, 
  CheckCircle2, 
  Search,
  RefreshCcw,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Swal from "sweetalert2"

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem("token")

    if (!token) {
      setError("Sesi Anda berakhir. Silakan login kembali.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("https://backend.mejatika.com/api/admin/registrations", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache"
        }
      })
      
      if (!res.ok) throw new Error(`Server merespons dengan status ${res.status}`)

      const result = await res.json()
      // Adaptasi terhadap format Laravel Resource atau Array Biasa
      const finalData = Array.isArray(result) ? result : (result.data || [])
      setRegistrations(finalData)
    } catch (err: any) {
      console.error("Error fetching registrations:", err)
      setError(err.message || "Gagal mengambil data pendaftaran.")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    const actionText = newStatus === 'success' ? 'Approve' : 'Tolak'
    
    const result = await Swal.fire({
      title: `${actionText} Pendaftaran?`,
      text: `Pastikan bukti pembayaran sudah valid sebelum melakukan ${actionText}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus === 'success' ? "#10b981" : "#ef4444",
      confirmButtonText: `Ya, ${actionText}!`,
      cancelButtonText: "Batal"
    })

    if (!result.isConfirmed) return
    
    setUpdatingId(id)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? { ...reg, status: newStatus } : reg
        ))
        Swal.fire("Berhasil!", `Status pendaftaran telah diperbarui ke ${newStatus}.`, "success")
      } else {
        throw new Error("Gagal memperbarui status di server.")
      }
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Terjadi kesalahan koneksi.", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = registrations.filter((reg) => 
    reg.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    reg.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    reg.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 p-6 bg-zinc-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Course <span className="text-amber-500">Registrations</span>
          </h1>
          <p className="text-zinc-500 font-medium">Verifikasi pembayaran dan aktivasi siswa secara manual.</p>
        </div>
        
        <div className="flex gap-2">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                  placeholder="Cari nama, email, atau kursus..." 
                  className="pl-10 rounded-2xl border-zinc-200 bg-white h-12 shadow-sm focus:ring-amber-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={fetchData} variant="outline" className="h-12 rounded-2xl bg-white border-zinc-200 shadow-sm hover:bg-zinc-50">
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold uppercase italic">{error}</p>
        </div>
      )}

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-zinc-50 bg-white">
          <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Daftar Tunggu Verifikasi</CardTitle>
          <CardDescription>Ditemukan {filteredData.length} data pendaftaran</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-amber-500 h-10 w-10" /></div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm">Data tidak ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest border-zinc-800">Siswa & Kontak</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest border-zinc-800">Kursus & Tanggal</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-center border-zinc-800">Bukti Bayar</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-center border-zinc-800">Status</th>
                    <th className="p-6 font-black uppercase italic text-[10px] tracking-widest text-right border-zinc-800">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredData.map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-zinc-900 leading-none mb-1">{reg.user?.name || "No Name"}</div>
                        <div className="text-[11px] text-zinc-400 font-medium">{reg.user?.email || "-"}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-black text-xs uppercase italic text-amber-600 mb-1 leading-none">{reg.course?.title || "No Course"}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                          {reg.created_at ? new Date(reg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
                        </div>
                      </td>
                      
                      <td className="p-6 text-center">
                        {reg.proof ? (
                          <a 
                            href={`https://backend.mejatika.com/storage/${reg.proof}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase italic bg-zinc-100 hover:bg-zinc-900 hover:text-white transition-all px-3 py-2 rounded-xl text-zinc-600 shadow-sm"
                          >
                            <ImageIcon size={12} /> Lihat Bukti <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-300 uppercase italic">Belum Upload</span>
                        )}
                      </td>

                      <td className="p-6 text-center">
                        <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase border-none shadow-sm ${
                          reg.status === 'success' || reg.status === 'aktif' ? 'bg-emerald-100 text-emerald-600' :
                          reg.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {reg.status}
                        </Badge>
                      </td>

                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          {(reg.status === 'pending') ? (
                            <>
                              <Button 
                                onClick={() => updateStatus(reg.id, 'success')}
                                disabled={updatingId === reg.id}
                                size="sm" 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] px-4 shadow-lg shadow-emerald-100"
                              >
                                {updatingId === reg.id ? <Loader2 className="animate-spin h-3 w-3" /> : "Approve"}
                              </Button>
                              <Button 
                                onClick={() => updateStatus(reg.id, 'failed')}
                                disabled={updatingId === reg.id}
                                size="sm" 
                                variant="destructive"
                                className="rounded-xl font-bold uppercase text-[10px] px-4 shadow-lg shadow-rose-100"
                              >
                                Tolak
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center text-emerald-500 gap-1 font-black italic uppercase text-[10px]">
                              <CheckCircle2 size={14} /> Selesai
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
