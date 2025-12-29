"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search,
  ExternalLink 
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      setRegistrations(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("Error fetching registrations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter pencarian berdasarkan nama user atau judul kursus
  const filteredData = registrations.filter((reg) => 
    reg.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    reg.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Course <span className="text-amber-500">Registrations</span>
          </h1>
          <p className="text-zinc-500 font-medium">Pantau siswa yang mendaftar di kursus Mejatika.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Cari nama atau kursus..." 
            className="pl-10 rounded-2xl border-zinc-100 bg-white h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-zinc-50">
          <CardTitle className="text-xl font-black uppercase italic">Registration List</CardTitle>
          <CardDescription>Total {filteredData.length} pendaftaran ditemukan</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-bold uppercase italic tracking-widest text-sm">Belum ada data pendaftaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="p-6 font-black uppercase italic text-xs tracking-widest">Siswa</th>
                    <th className="p-6 font-black uppercase italic text-xs tracking-widest">Kursus</th>
                    <th className="p-6 font-black uppercase italic text-xs tracking-widest">Tgl Daftar</th>
                    <th className="p-6 font-black uppercase italic text-xs tracking-widest text-center">Status</th>
                    <th className="p-6 font-black uppercase italic text-xs tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredData.map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-zinc-900">{reg.user?.name}</div>
                        <div className="text-xs text-zinc-400">{reg.user?.email}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-black text-xs uppercase italic text-amber-600">{reg.course?.title}</div>
                      </td>
                      <td className="p-6 text-sm font-medium text-zinc-500">
                        {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="p-6 text-center">
                        <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase border-none ${
                          reg.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          reg.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400'
                        }`}>
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="p-6 text-right">
                         <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-900 hover:text-white transition-all">
                            <ExternalLink size={18} />
                         </Button>
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
