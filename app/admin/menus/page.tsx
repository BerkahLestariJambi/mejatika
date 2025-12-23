import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GripVertical } from "lucide-react"
import { db } from "@/lib/db"

export default async function MenusPage() {
  const menus = await db.getMenus()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Menus</h1>
          <p className="text-muted-foreground">Manage navigation menus</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Drag to reorder menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menus.map((menu) => (
              <div key={menu.id}>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{menu.title}</p>
                      <p className="text-sm text-muted-foreground">{menu.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {menu.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                {menu.parentId === null && (
                  <div className="ml-8 mt-2 space-y-2">
                    {menus
                      .filter((sub) => sub.parentId === menu.id)
                      .map((submenu) => (
                        <div key={submenu.id} className="flex items-center justify-between rounded-lg border p-2">
                          <div className="flex items-center gap-3">
                            <div className="h-px w-4 bg-border" />
                            <div>
                              <p className="text-sm font-medium">{submenu.title}</p>
                              <p className="text-xs text-muted-foreground">{submenu.url}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
