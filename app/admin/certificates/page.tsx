"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Award, Download, Calendar, Plus, Search, 
  Eye, MoreVertical, Loader2, AlertCircle 
} from "lucide-react"
import Swal from 'sweetalert2' // Pastikan sudah install: npm install sweetalert2

export default function CertificatesAdminPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 1. Fetch Data dari Backend
  const fetchCertificates = useCallback(async () => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("token")
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

  // --- LOGIKA TOMBOL PDF (DOWNLOAD) ---
  const handleDownloadPDF = async (cert: any) => {
    const token = localStorage.getItem("token")
    
    // Tampilkan loading sebentar
    Swal.fire({
      title: 'Menyiapkan Dokumen...',
      html: 'Sedang men-generate file PDF',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    })

    try {
      const res = await fetch(`https://backend.mejatika.com/api/certificates/${cert.id}/download`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Gagal men-download PDF")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Sertifikat-${cert.certificate_number}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      
      Swal.close()
    } catch (err) {
      Swal.fire("Gagal", "Gagal mengunduh file sertifikat dari server", "error")
    }
  }

  // --- LOGIKA TOMBOL DETAIL ---
  const handleShowDetail = (cert: any) => {
    Swal.fire({
      title: `<span class="text-2xl font-black italic uppercase">Detail Sertifikat</span>`,
      html: `
        <div class="text-left space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-slate-400 uppercase">Nama Peserta</span>
            <span class="text-lg font-bold text-slate-800">${cert.user?.name}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-slate-400 uppercase">Materi Kursus</span>
            <span class="text-md font-bold text-indigo-600">${cert.course?.title}</span>
          </div>
          <div class="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase">Nomor Sertifikat</span>
              <p class="font-mono text-sm">${cert.certificate_number}</p>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase">Tanggal Terbit</span>
              <p class="text-sm font-bold">${new Date(cert.issued_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#4f46e5',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-8 font-bold'
      }
    })
  }

  // 2. Filter Search
  const filteredCertificates = certificates.filter(cert => 
    cert.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ... Header & Search Bar tetap sama ... */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Manajemen Sertifikat</h1>
          <p className="text-slate-500 font-medium">Verifikasi dan kelola sertifikat siswa dari database.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95">
          <Plus className="h-5 w-5" /> Terbitkan Manual
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa, nomor sertifikat..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
        </div>
        <Button onClick={fetchCertificates} variant="ghost" className="rounded-2xl h-12 w-12 p-0">
          <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-600" />
              <p>Menghubungkan ke Database...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Award size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-800">{cert.user?.name}</h3>
                      <p className="text-sm font-semibold text-indigo-600">{cert.course?.title}</p>
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        Issued: {new Date(cert.issued_at).toLocaleDateString('id-ID')} | ID: {cert.certificate_number}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* TOMBOL PDF - Sekarang Berfungsi */}
                    <Button 
                      onClick={() => handleDownloadPDF(cert)}
                      variant="outline" 
                      className="h-11 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-xl font-bold px-5"
                    >
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>

                    {/* TOMBOL DETAIL - Sekarang Berfungsi */}
                    <Button 
                      onClick={() => handleShowDetail(cert)}
                      className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-5"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
