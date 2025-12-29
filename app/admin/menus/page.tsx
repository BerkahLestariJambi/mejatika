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

  // State Form
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("") 
  const [slug, setSlug] = useState("") 
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [parentId, setParentId] = useState<number | null>(null)

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
  })

  const fetchMenus = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/menus");
      const data = await res.json();
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  }

  useEffect(() => { fetchMenus(); }, []);

  // Filter Menu Utama (Tanpa Parent)
  const mainMenus = useMemo(() => menus.filter(m => m.parentId === null || m.parentId === undefined), [menus])

  const resetForm = () => {
    setName(""); setSlug(""); setOrder(0); setActive(true); setParentId(null); setEditing(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { 
      name, slug, order: Number(order), 
      active: active ? 1 : 0, 
      parentId: parentId ? Number(parentId) : null 
    };

    let apiUrl = "https://backend.mejatika.com/api/menus";
    let method = editing ? "PUT" : "POST";
    if (editing) apiUrl += `/${editing.id}`;

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
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        setOpenForm(false); resetForm(); fetchMenus();
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Gagal memproses data' });
    } finally { setLoading(false); }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Menu?',
      text: "Submenu di dalamnya juga akan terhapus.",
      icon: 'warning',
      showCancelButton: true,
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic text-amber-600 uppercase">STRUKTUR NAVIGASI</h1>
          <p className="text-muted-foreground">Kelola hierarki menu Mejatika</p>
        </div>

        <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">
              <Plus className="mr-2 h-5 w-5" /> Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl">
            <DialogHeader><DialogTitle className="text-amber-600 uppercase font-black">Editor Menu</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">Nama Menu</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">Slug / Link</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Urutan</Label>
                  <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-amber-500" />
                  <Label className="text-xs font-bold uppercase">Aktif</Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">Induk (Parent)</Label>
                <select 
                  className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm"
                  value={parentId || ""} 
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Menu Utama</option>
                  {mainMenus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "SIMPAN MENU"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {mainMenus.map((menu) => (
          <div key={menu.id} className="space-y-2">
            {/* Parent Card */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-amber-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <GripVertical className="text-amber-200" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">{menu.name}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">{menu.slug}</p>
                </div>
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

            {/* Submenu List */}
            <div className="ml-12 space-y-2 border-l-2 border-amber-100 pl-6">
              {menus.filter(s => Number(s.parentId) === menu.id).map(submenu => (
                <div key={submenu.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
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
