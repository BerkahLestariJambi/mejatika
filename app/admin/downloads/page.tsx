"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Download, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

type DownloadFile = {
  id: number
  title: string
  description: string
  file_path: string
  file_type: string
  file_size: string
  download_count: number
}

export default function DownloadsManagementPage() {
  const [downloads, setDownloads] = useState<DownloadFile[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DownloadFile | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // 1. Fetch Data
  const fetchDownloads = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/downloads", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      setDownloads(result.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDownloads()
  }, [])

  // 2. Handle Submit (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    if (file) formData.append("file", file)

    let url = "https://backend.mejatika.com/api/downloads"
    if (editing) {
      url = `https://backend.mejatika.com/api/downloads/${editing.id}`
      formData.append("_method", "PUT") // Trick Laravel untuk Update dengan File
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Selalu POST jika ada upload file
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        toast({ title: editing ? "File diperbarui" : "File berhasil ditambah" })
        setOpen(false)
        fetchDownloads()
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Delete File
  const confirmDelete = async (id: number) => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`https://backend.mejatika.com/api/downloads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast({ title: "File dihapus" })
        fetchDownloads()
      }
    } catch (error) {
      toast({ title: "Gagal hapus", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Downloads Management</h1>
          <p className="text-muted-foreground">Manage downloadable files</p>
        </div>

        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if(!val) setEditing(null)
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setTitle("")
              setDescription("")
              setFile(null)
              setEditing(null)
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit File" : "Upload File Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Judul File</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>File {editing && "(Kosongkan jika tidak ganti)"}</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editing} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update File" : "Upload Sekarang"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Downloads</CardTitle>
          <CardDescription>Daftar resource yang dapat diunduh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
            ) : downloads.length > 0 ? (
              downloads.map((file) => (
                <div key={file.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Download className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{file.title}</h3>
                      <p className="text-sm text-muted-foreground">{file.description}</p>
                      <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline">{file.file_type || 'PDF'}</Badge>
                        <span>{file.file_size || '0 KB'}</span>
                        <span>•</span>
                        <span>{file.download_count || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditing(file)
                      setTitle(file.title)
                      setDescription(file.description)
                      setOpen(true)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus file ini?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(file.id)} className="bg-red-500">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">Belum ada file.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
