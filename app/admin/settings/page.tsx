"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
// Import SweetAlert2
import Swal from "sweetalert2"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  // 1. Ambil data dari Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("https://backend.mejatika.com/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await res.json()
        
        const settingsMap = Object.fromEntries(
          result.data.map((s: { key: string; value: string }) => [s.key, s.value])
        )
        setFormData(settingsMap)
      } catch (error) {
        console.error("Gagal load settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // 2. Simpan data dengan SweetAlert
  const handleSave = async () => {
    // Tampilkan konfirmasi sebelum simpan (Opsional)
    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      text: "Pastikan data yang Anda masukkan sudah benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal"
    })

    if (!confirm.isConfirmed) return

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/settings/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Gagal menyimpan ke server")

      // Notifikasi Sukses SweetAlert
      Swal.fire({
        title: "Berhasil!",
        text: "Pengaturan aplikasi telah diperbarui.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })

    } catch (error: any) {
      // Notifikasi Error SweetAlert
      Swal.fire({
        title: "Gagal!",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage application settings</p>
        </div>
        <Button size="lg" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input 
                id="site_name" 
                value={formData.site_name || ""} 
                onChange={(e) => handleChange("site_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea 
                id="site_description" 
                value={formData.site_description || ""} 
                onChange={(e) => handleChange("site_description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input 
                id="contact_email" 
                type="email" 
                value={formData.contact_email || ""} 
                onChange={(e) => handleChange("contact_email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Settings</CardTitle>
            <CardDescription>Configure homepage elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="running_text">Running Text</Label>
              <Textarea 
                id="running_text" 
                value={formData.running_text || ""} 
                rows={4} 
                onChange={(e) => handleChange("running_text", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label>Enable Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new user registrations</p>
              </div>
              <Switch 
                checked={formData.enable_registration === "true"} 
                onCheckedChange={(val) => handleChange("enable_registration", val ? "true" : "false")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
