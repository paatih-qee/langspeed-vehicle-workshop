"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useOrders } from "@/lib/hooks/use-orders"
import { useProducts } from "@/lib/hooks/use-products"
import { useServices } from "@/lib/hooks/use-services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"

interface OrderItem {
  itemId: string
  itemName: string
  itemType: "product" | "service"
  quantity: number
  price: number
  purchase_price: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { orders, mutate: mutateOrders } = useOrders()
  const { products } = useProducts()
  const { services } = useServices()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedItem, setSelectedItem] = useState("")
  const [selectedType, setSelectedType] = useState<"product" | "service">("product")
  const [quantity, setQuantity] = useState("1")
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    plateNumber: "",
    complaint: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>
  }

  const handleAddItem = () => {
    if (!selectedItem || !quantity) {
      toast.error("Pilih item dan masukkan kuantitas")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0) {
      toast.error("Kuantitas harus lebih dari 0")
      return
    }

    let item: any
    if (selectedType === "product") {
      item = products.find((p) => p.id === selectedItem)
      if (!item || item.stock === 0) {
        toast.error("Produk tidak tersedia")
        return
      }
      if (qty > item.stock) {
        toast.error(`Stok tidak cukup. Stok tersedia: ${item.stock}`)
        return
      }
    } else {
      item = services.find((s) => s.id === selectedItem)
    }

    if (!item) {
      toast.error("Item tidak ditemukan")
      return
    }

    const newItem: OrderItem = {
      itemId: item.id,
      itemName: item.name,
      itemType: selectedType,
      quantity: qty,
      price: item.price,
      purchase_price: item.purchase_price || 0,
    }

    setItems([...items, newItem])
    setSelectedItem("")
    setQuantity("1")
    toast.success(`${item.name} ditambahkan ke pesanan`)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error("Tambahkan minimal satu item")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      toast.success("Pesanan berhasil dibuat")
      setFormData({
        customerName: "",
        customerPhone: "",
        vehicleType: "",
        plateNumber: "",
        complaint: "",
      })
      setItems([])
      setIsModalOpen(false)
      mutateOrders()
    } catch (error) {
      toast.error("Gagal membuat pesanan")
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const completedOrders = orders.filter((o) => o.status === "Selesai").length
  const lowStockProducts = products.filter((p) => p.stock < 5).length
  const pendingReservations = orders.filter((o) => o.is_reservation && o.approval_status === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang kembali, {user?.email}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-gray-500 mt-1">Dari semua pesanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orders.length}</div>
            <p className="text-xs text-gray-500 mt-1">{completedOrders} selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{products.length}</div>
            <p className="text-xs text-gray-500 mt-1">{lowStockProducts} stok rendah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reservasi Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReservations}</div>
            <p className="text-xs text-gray-500 mt-1">Menunggu persetujuan</p>
          </CardContent>
        </Card>
      </div>

      {pendingReservations > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-orange-900">
                  Ada {pendingReservations} reservasi menunggu persetujuan
                </p>
                <p className="text-sm text-orange-700 mt-1">Segera review dan proses reservasi dari pelanggan</p>
              </div>
              <Link href="/dashboard/reservations">
                <Button className="bg-orange-600 hover:bg-orange-700">Lihat Reservasi</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
          <CardDescription>Navigasi ke fitur utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  Pesanan Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Pesanan Baru</DialogTitle>
                  <DialogDescription>Masukkan detail pesanan dan pilih item</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrder} className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kendaraan</label>
                      <Input
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                      <Input
                        value={formData.plateNumber}
                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan</label>
                    <textarea
                      value={formData.complaint}
                      onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Tambahkan Item</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                          <select
                            value={selectedType}
                            onChange={(e) => {
                              setSelectedType(e.target.value as "product" | "service")
                              setSelectedItem("")
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="product">Produk</option>
                            <option value="service">Jasa</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                          <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Pilih item</option>
                            {selectedType === "product"
                              ? products.map((product) => (
                                  <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={product.stock === 0}
                                    className={product.stock === 0 ? "text-gray-400" : ""}
                                  >
                                    {product.name} (Stok: {product.stock})
                                  </option>
                                ))
                              : services.map((service) => (
                                  <option key={service.id} value={service.id}>
                                    {service.name}
                                  </option>
                                ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kuantitas</label>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={handleAddItem} variant="secondary" className="w-full">
                        Tambahkan Item
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Item Pesanan ({items.length})</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>
                            {item.itemName} x{item.quantity} = Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Buat Pesanan
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Link href="/dashboard/reservations">
              <Button variant="outline" className="w-full bg-transparent">
                Kelola Reservasi
              </Button>
            </Link>
            <Link href="/dashboard/products">
              <Button variant="outline" className="w-full bg-transparent">
                Kelola Produk
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full bg-transparent">
                Laporan Keuangan
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full bg-transparent">
                Riwayat Pesanan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
          <CardDescription>5 pesanan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada pesanan</div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp {order.total_amount.toLocaleString("id-ID")}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === "Selesai" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
