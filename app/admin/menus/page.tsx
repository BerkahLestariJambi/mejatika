"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, GripVertical, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)

  // --- UPDATE: State menggunakan nama kolom baru ---
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("") // Sebelumnya 'title'
  const [slug, setSlug] = useState("") // Sebelumnya 'url'
  const [parentId, setParentId] = useState<number | null>(null)
  const [active, setActive] = useState(true) // Sebelumnya 'isActive'
  const [order, setOrder] = useState(0)

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  const fetchMenus = async () => {
    try {
      // Mengambil semua data untuk management (tanpa filter nested dari API)
      const res = await fetch("https://backend.mejatika.com/api/menus");
      const data = await res.json();
      // Pastikan API mengembalikan array datar atau array nested
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  }

  useEffect(() => { fetchMenus(); }, []);

  // Filter menu utama untuk pilihan Parent (yang tidak punya parentId)
  const mainMenus = useMemo(() => menus.filter(m => !m.parentId), [menus])

  const resetForm = () => {
    setName(""); 
    setSlug(""); 
    setParentId(null); 
    setActive(true); 
    setOrder(0);
    setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- UPDATE: Payload sesuai struktur tabel PHP ---
    const payload = { 
        name, 
        slug, 
        parentId: parentId ? Number(parentId) : null, 
        active: active ? 1 : 0, 
        order 
    };

    let apiUrl = "https://backend.mejatika.com/api/menus";
    let method = "POST";

    if (editing) {
      apiUrl = `${apiUrl}/${editing.id}`;
      method = "PUT";
    }

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Toast.fire({ icon: 'success', title: editing ? 'Menu diperbarui' : 'Menu berhasil dibuat' });
        setOpenForm(false);
        resetForm();
        fetchMenus();
      } else {
        const errData = await res.json();
        Toast.fire({ icon: 'error', title: errData.message || 'Gagal menyimpan' });
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Terjadi kesalahan jaringan' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus menu?',
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await fetch(`https://backend.mejatika.com/api/menus/${id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            fetchMenus();
            Toast.fire({ icon: 'success', title: 'Menu dihapus' });
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
        }
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tighter italic text-amber-600 uppercase">STRUKTUR NAVIGASI</h1>
          <p className="text-muted-foreground">Kelola Menu & Link Frontend Mejatika</p>
        </motion.div>

        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg px-6">
              <Plus className="mr-2 h-5 w-5" /> Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
             <DialogHeader className="sr-only">
               <DialogTitle>Editor Navigasi</DialogTitle>
             </DialogHeader>

             {/* HEADER GULUNGAN */}
             <div className="relative z-50 w-[90%] mx-auto">
                <div className="w-full h-12 bg-amber-500 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">EDITOR NAVIGASI</span>
                </div>
             </div>

             {/* BODY FORM */}
             <div className="bg-[#fffdfa] dark:bg-zinc-900 -mt-6 pt-10 pb-8 px-8 rounded-b-2xl shadow-2xl border-x border-amber-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Label Menu (Name)</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Contoh: Nasional" className="border-amber-200" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">URL / Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="nasional atau /category/nasional" className="border-amber-200" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Urutan (Order)</Label>
                        <Input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value))} className="border-amber-200" />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-amber-500 h-4 w-4" />
                        <Label htmlFor="active" className="text-xs font-bold uppercase">Aktif</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Parent Menu</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={parentId || ""} 
                      onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Menu Utama (Tanpa Induk)</option>
                      {mainMenus.filter(m => m.id !== editing?.id).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : editing ? "PERBARUI MENU" : "SIMPAN MENU"}
                  </Button>
                </form>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* LIST VIEW */}
      <div className="grid gap-4">
        {mainMenus.length > 0 ? (
          mainMenus.map((menu) => (
            <div key={menu.id} className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-amber-100 rounded-2xl shadow-sm group hover:border-amber-400 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-zinc-800 dark:text-zinc-200">{menu.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{menu.slug}</p>
                  </div>
                  {!menu.active && <Badge variant="secondary" className="text-[9px] bg-zinc-100">Non-Aktif</Badge>}
                </div>
                
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => {
                    setEditing(menu); 
                    setName(menu.name); 
                    setSlug(menu.slug); 
                    setParentId(menu.parentId); 
                    setActive(menu.active === 1 || menu.active === true);
                    setOrder(menu.order);
                    setOpenForm(true);
                  }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Tampilan Submenus - Filter dari state menus */}
              <div className="ml-12 space-y-2 border-l-2 border-amber-100 pl-6">
                {menus.filter(sub => sub.parentId === menu.id).map(submenu => (
                  <div key={submenu.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border border-transparent rounded-xl hover:border-amber-200 transition-all">
                    <div className="flex items-center gap-3">
                       <ChevronRight className="h-3 w-3 text-amber-400" />
                       <div>
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">{submenu.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{submenu.slug}</p>
                       </div>
                    </div>
                    <div className="flex gap-1">
                       <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-400" onClick={() => {
                          setEditing(submenu); 
                          setName(submenu.name); 
                          setSlug(submenu.slug); 
                          setParentId(submenu.parentId); 
                          setActive(submenu.active === 1 || submenu.active === true);
                          setOrder(submenu.order);
                          setOpenForm(true);
                       }}><Edit className="h-3.5 w-3.5" /></Button>
                       <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => handleDelete(submenu.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-amber-50/20 rounded-3xl border-2 border-dashed border-amber-100">
            <p className="italic text-muted-foreground text-sm">Belum ada menu navigasi yang dibuat.</p>
          </div>
        )}
      </div>
    </div>
  )
}
