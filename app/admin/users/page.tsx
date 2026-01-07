import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { cookies } from "next/headers"

// 1. Fungsi untuk ambil data dari Laravel
async function getUsers() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value; // Ambil token dari cookie

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      next: { revalidate: 0 }, // Agar data selalu terbaru (tidak di-cache)
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data user");
    }

    const result = await response.json();
    return result.data || []; // Karena controller kita membungkusnya dalam 'data'
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function UsersPage() {
  // 2. Panggil fungsi getUsers
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles from Laravel API</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Total terdaftar: {users.length} user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {/* Avatar bisa dikosongkan jika belum ada logic upload foto */}
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        user.role === "admin" 
                          ? "default" 
                          : user.role === "kontributor" 
                          ? "secondary" 
                          : "outline"
                      }
                    >
                      {user.role}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Data user tidak ditemukan atau Anda bukan Admin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
