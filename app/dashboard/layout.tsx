"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks/use-auth"
import { useUserRole } from "@/lib/hooks/use-user-role"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  Package,
  Wrench,
  FileText,
  Users,
  ShieldCheck,
  Shield,
  UserIcon,
  ClipboardList,
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { role, isLoading: roleLoading } = useUserRole()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!roleLoading && role === "guest") {
      router.push("/reservasi")
    }
  }, [role, roleLoading, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading || roleLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  }

  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", href: "/dashboard", icon: Home, roles: ["super_admin", "admin"] },
      {
        label: "Kelola Reservasi",
        href: "/dashboard/reservations",
        icon: ClipboardList,
        roles: ["super_admin", "admin"],
      },
      { label: "Pesanan", href: "/dashboard/orders", icon: ShoppingCart, roles: ["super_admin", "admin"] },
      { label: "Produk", href: "/dashboard/products", icon: Package, roles: ["super_admin", "admin"] },
      { label: "Jasa", href: "/dashboard/services", icon: Wrench, roles: ["super_admin", "admin"] },
      { label: "Laporan Keuangan", href: "/dashboard/reports", icon: FileText, roles: ["super_admin"] },
      { label: "Kelola User", href: "/dashboard/users", icon: Users, roles: ["super_admin"] },
    ]

    return baseItems.filter((item) => item.roles.includes(role || ""))
  }

  const menuItems = getMenuItems()

  const getRoleBadge = () => {
    if (role === "super_admin") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 rounded-lg">
          <ShieldCheck className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-300">Super Admin</span>
        </div>
      )
    }
    if (role === "admin") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 rounded-lg">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300">Admin</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
        <UserIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-300">Guest</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 md:translate-x-0 md:static`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Langspeed</h1>
          <p className="text-gray-400 text-sm">Motor Service</p>
          <div className="mt-4">{getRoleBadge()}</div>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
