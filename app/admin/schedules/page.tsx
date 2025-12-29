"use client" // Ubah ke client component jika ingin interaktif (modal/delete)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Calendar, Users, MapPin, Clock } from "lucide-react"

// Mock data untuk contoh tampilan jika API belum siap
const mockSchedules = [
  {
    id: "1",
    title: "Batch Januari 2024",
    course: { title: "Fullstack Web Development" },
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    time: "19:00 - 21:00 WIB",
    location: "Zoom Meeting",
    currentParticipants: 12,
    maxParticipants: 20,
    status: "ongoing"
  },
  {
    id: "2",
    title: "Batch Intensif Weekend",
    course: { title: "UI/UX Design Masterclass" },
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    time: "09:00 - 15:00 WIB",
    location: "Studio Mejatika",
    currentParticipants: 5,
    maxParticipants: 15,
    status: "upcoming"
  }
];

export default function SchedulesManagementPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
            Jadwal <span className="text-amber-500">Kursus</span>
          </h1>
          <p className="text-zinc-500 font-medium">Atur waktu ketersediaan dan kuota kelas.</p>
        </div>
        <Button className="bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-12 px-6 font-bold uppercase tracking-wider transition-all shadow-lg shadow-zinc-200">
          <Plus className="mr-2 h-5 w-5" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Stats Quick View (Opsional - Bagus untuk Admin) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Kelas Aktif</p>
          <h3 className="text-3xl font-black text-zinc-900">08</h3>
        </div>
        <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Total Peserta</p>
          <h3 className="text-3xl font-black text-zinc-900">142</h3>
        </div>
      </div>

      {/* Main List */}
      <Card className="border-none shadow-xl shadow-zinc-100/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-white border-b border-zinc-50 p-8">
          <CardTitle className="text-xl font-black uppercase tracking-tight">Daftar Jadwal</CardTitle>
          <CardDescription>Manajemen slot waktu dan kapasitas peserta kursus.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-50">
            {mockSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="group flex flex-col lg:flex-row lg:items-center justify-between p-8 hover:bg-zinc-50/50 transition-colors gap-6"
              >
                <div className="flex gap-6">
                  {/* Icon Box */}
                  <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-zinc-900 text-white group-hover:bg-amber-500 transition-colors shadow-lg">
                    <Calendar className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900">
                        {schedule.title}
                      </h3>
                      <Badge
                        className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none ${
                          schedule.status === "upcoming" 
                            ? "bg-blue-100 text-blue-600" 
                            : schedule.status === "ongoing" 
                            ? "bg-emerald-100 text-emerald-600" 
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {schedule.status}
                      </Badge>
                    </div>
                    
                    <p className="text-amber-600 font-bold text-sm uppercase tracking-wide">
                      {schedule.course?.title}
                    </p>

                    {/* Meta Data Info */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-medium text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-zinc-400" />
                        <span>{new Date(schedule.startDate).toLocaleDateString("id-ID")} - {new Date(schedule.endDate).toLocaleDateString("id-ID")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-zinc-400" />
                        <span>{schedule.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-zinc-400" />
                        <span>{schedule.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-zinc-400" />
                        <span className={schedule.currentParticipants >= schedule.maxParticipants ? "text-red-500 font-bold" : ""}>
                          {schedule.currentParticipants} / {schedule.maxParticipants} Peserta
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 hover:border-amber-500 hover:text-amber-500 transition-all">
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 hover:border-red-500 hover:text-red-500 transition-all">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
