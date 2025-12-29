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

  // --- STATE DISESUAIKAN DENGAN KOLOM DATABASE ---
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("") 
  const [slug, setSlug] = useState("") 
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [parentId, setParentId] = useState<number | null>(null)

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  // Mengambil data dari API
  const fetchMenus = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/menus");
      const data = await res.json();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  }

  useEffect(() => { fetchMenus(); }, []);

  // Filter untuk dropdown Parent (hanya menu tingkat atas)
  const mainMenusForSelect = useMemo(() => menus.filter(m => !m.parentId), [menus])

  const resetForm = () => {
    setName(""); setSlug(""); setOrder(0);
    setActive(true); setParentId(null); setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- PAYLOAD DISESUAIKAN DENGAN DB (name, slug, order, active, parentId) ---
    const payload = { 
        name, 
        slug, 
        order: Number(order), 
        active: active ? 1 : 0, 
        parentId: parentId ? Number(parentId) : null 
    };

    let apiUrl = "https://backend.mejatika.com/api/menus";
    let method = "POST";

    if (editing) {
      apiUrl = `${apiUrl}/${editing.id}`;
      method = "PUT"; // Gunakan PUT untuk update sesuai standar API Anda
    }

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json", // Meminta response JSON jika ada error validasi
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        Toast.fire({ icon: 'success', title: editing ? 'Menu diperbarui' : 'Menu dibuat' });
        setOpenForm(false);
        resetForm();
        fetchMenus();
      } else {
        // Menampilkan error validasi spesifik dari Laravel jika ada
        const errorMsg = result.errors ? Object.values(result.errors).flat()[0] : result.message;
        Toast.fire({ icon: 'error', title: errorMsg || 'Gagal menyimpan' });
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Kesalahan jaringan' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus menu?',
      text: "Data akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`https://backend.mejatika.com/api/menus/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        fetchMenus();
      }
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tighter italic text-amber-600 uppercase">STRUKTUR NAVIGASI</h1>
          <p className="text-muted-foreground">Kelola Menu & Link Frontend</p>
        </motion.div>

        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg px-6">
              <Plus className="mr-2 h-5 w-5" /> Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
             <DialogHeader className="sr-only"><DialogTitle>Editor Navigasi</DialogTitle></DialogHeader>
             
             {/* HEADER VISUAL */}
             <div className="relative z-50 w-[90%] mx-auto">
                <div className="w-full h-12 bg-amber-500 rounded-full shadow-xl flex items-center justify-center relative">
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] z-10">EDITOR NAVIGASI</span>
                </div>
             </div>

             {/* FORM BODY */}
             <div className="bg-[#fffdfa] dark:bg-zinc-900 -mt-6 pt-10 pb-8 px-8 rounded-b-2xl shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-amber-600">Nama Menu</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Contoh: Profil" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-amber-600">Slug / URL</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="Contoh: profil" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-amber-600">Urutan</Label>
                        <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-amber-500" />
                        <Label htmlFor="active" className="text-xs font-bold uppercase">Aktif</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-amber-600">Submenu Dari (Parent)</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={parentId || ""} 
                      onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Menu Utama (Tanpa Induk)</option>
                      {mainMenusForSelect.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : editing ? "PERBARUI" : "SIMPAN"}
                  </Button>
                </form>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* RENDER LIST MENU */}
      <div className="grid gap-4">
        {menus.filter(m => !m.parentId).map((menu) => (
          <div key={menu.id} className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-amber-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-amber-200" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">{menu.name}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">{menu.slug}</p>
                </div>
                {menu.active === 0 && <Badge variant="secondary" className="text-[9px]">Draf</Badge>}
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="text-blue-500" onClick={() => {
                  setEditing(menu); setName(menu.name); setSlug(menu.slug);
                  setOrder(menu.order); setActive(menu.active === 1); setParentId(menu.parentId);
                  setOpenForm(true);
                }}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Render Submenu */}
            <div className="ml-12 space-y-2 border-l-2 border-amber-100 pl-6">
              {menus.filter(s => s.parentId === menu.id).map(submenu => (
                <div key={submenu.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-transparent hover:border-amber-200">
                  <div className="flex items-center gap-3">
                     <ChevronRight className="h-3 w-3 text-amber-400" />
                     <div>
                        <p className="text-xs font-bold uppercase">{submenu.name}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{submenu.slug}</p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-400" onClick={() => {
                        setEditing(submenu); setName(submenu.name); setSlug(submenu.slug);
                        setOrder(submenu.order); setActive(submenu.active === 1); setParentId(submenu.parentId);
                        setOpenForm(true);
                     }}><Edit className="h-3.5 w-3.5" /></Button>
                     <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => handleDelete(submenu.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
