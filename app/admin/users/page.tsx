"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type User = {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("peserta")
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // 1. Ambil Data User (Client Side)
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/users", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      })
      const result = await res.json()
      setUsers(result.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 2. Simpan atau Update User
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem("token")
    const payload: any = { name, email, role }
    if (password) payload.password = password

    const url = editing 
      ? `https://backend.mejatika.com/api/users/${editing.id}` 
      : `https://backend.mejatika.com/api/users`
    
    const method = editing ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: editing ? "User diperbarui" : "User berhasil ditambah" })
        setOpen(false)
        setEditing(null)
        resetForm()
        fetchUsers()
      } else {
        const errorData = await res.json()
        toast({ 
          title: "Gagal", 
          description: errorData.message || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (err) {
      toast({ title: "Error koneksi", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Hapus User
  const confirmDelete = async (id: number) => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "User berhasil dihapus" })
        fetchUsers()
      }
    } catch (error) {
      toast({ title: "Gagal menghapus", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("peserta")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles from Laravel API</p>
        </div>

        {/* DIALOG TAMBAH/EDIT */}
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if(!val) setEditing(null)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditing(null)
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit User" : "Tambah User Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="kontributor">Kontributor</SelectItem>
                    <SelectItem value="peserta">Peserta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update User" : "Simpan User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Total terdaftar: {users.length} user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "default" : user.role === "kontributor" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                    
                    {/* EDIT */}
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditing(user)
                      setName(user.name)
                      setEmail(user.email)
                      setRole(user.role)
                      setOpen(true)
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* DELETE */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                          <p className="text-sm text-muted-foreground">User <b>{user.name}</b> akan dihapus permanen.</p>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(user.id)} className="bg-red-500">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">Data tidak ditemukan.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
