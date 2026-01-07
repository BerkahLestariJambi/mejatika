"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Award, Download, Calendar, Plus, Search, 
  Eye, MoreVertical, Loader2, AlertCircle 
} from "lucide-react"

export default function CertificatesAdminPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 1. Fungsi Fetch Data dari Backend Laravel
  const fetchCertificates = useCallback(async () => {
    const token = localStorage.getItem("token") // Pastikan token admin tersimpan
    setLoading(true)
    try {
      const response = await fetch("https://backend.mejatika.com/api/certificates", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      
      if (!response.ok) throw new Error("Gagal mengambil data sertifikat")
      
      const data = await response.json()
      // Sesuaikan jika Laravel mengembalikan data di dalam object 'data'
      setCertificates(Array.isArray(data) ? data : data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  // 2. Filter data berdasarkan search bar
  const filteredCertificates = certificates.filter(cert => 
    cert.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Manajemen Sertifikat</h1>
          <p className="text-slate-500 font-medium">Verifikasi dan kelola sertifikat siswa dari database.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Terbitkan Manual
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa, nomor sertifikat, atau judul kursus..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        <Button onClick={fetchCertificates} variant="ghost" className="rounded-2xl h-12 w-12 p-0">
          <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* TABLE CARD */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Sertifikat Terbit</CardTitle>
            <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-bold">
              {filteredCertificates.length} Data Ditemukan
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-600" />
              <p className="font-bold animate-pulse">Menghubungkan ke Backend...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="font-bold">{error}</p>
              <Button onClick={fetchCertificates} variant="outline" className="mt-4 rounded-xl">Coba Lagi</Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between hover:bg-slate-50/50 transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Award size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-800">{cert.user?.name || "Nama Tidak Tersedia"}</h3>
                      <p className="text-sm font-semibold text-indigo-600">{cert.course?.title || "Kursus Terhapus"}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Issued: {new Date(cert.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <span className="text-slate-200">|</span>
                        <span>ID: {cert.certificate_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-xl font-bold px-5">
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-5">
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </Button>
                    <Button variant="ghost" className="h-11 w-11 p-0 rounded-xl text-slate-300">
                      <MoreVertical size={20} />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredCertificates.length === 0 && (
                <div className="py-20 text-center">
                   <p className="text-slate-400 font-bold italic">Tidak ada data yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
