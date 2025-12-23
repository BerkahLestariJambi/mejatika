"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

interface SubMenu {
  id: string
  title: string
  url: string
}

interface MenuItem {
  id: string
  title: string
  url: string
  subMenus: SubMenu[]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load menus:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="font-bold text-lg">MEJATIKA</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-lg">MEJATIKA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) =>
              item.subMenus && item.subMenus.length > 0 ? (
                <div key={item.id} className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
                    {item.title}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 top-full mt-1 w-48 bg-card text-card-foreground rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {item.subMenus.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.url}
                        className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  className="px-3 py-2 hover:bg-primary-foreground/10 rounded-md transition-colors"
                >
                  {item.title}
                </Link>
              ),
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <div className="flex flex-col gap-2 mt-8">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    <Link
                      href={item.url}
                      className="block px-3 py-2 text-lg hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      onClick={() => !item.subMenus?.length && setIsOpen(false)}
                    >
                      {item.title}
                    </Link>
                    {item.subMenus && item.subMenus.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subMenus.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.url}
                            className="block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
