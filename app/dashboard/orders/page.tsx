"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState } from "react"
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

interface OrderItem {
  itemId: string
  itemName: string
  itemType: "product" | "service"
  quantity: number
  price: number
  purchase_price: number
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, mutate: mutateOrders } = useOrders()
  const { products } = useProducts()
  const { services } = useServices()
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    plateNumber: "",
    complaint: "",
  })

  const handleAddItem = (item: any, type: "product" | "service") => {
    const newItem: OrderItem = {
      itemId: item.product_id || item.service_id,
      itemName: item.name,
      itemType: type,
      quantity: 1,
      price: item.price,
      purchase_price: item.purchase_price || 0,
    }
    setItems([...items, newItem])
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
      setIsOpen(false)
      mutateOrders()
    } catch (error) {
      toast.error("Gagal membuat pesanan")
    }
  }

  const handleViewDetail = (order: any) => {
    router.push(`/dashboard/orders/${order.id}`)
  }

  const handleViewInvoice = (order: any) => {
    router.push(`/dashboard/orders/${order.id}/invoice`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-600 mt-2">Kelola pesanan servis dan penjualan</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Pesanan Baru</Button>
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

              <div>
                <h3 className="font-semibold mb-2">Produk</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddItem(product, "product")}
                      className="w-full text-left p-2 border rounded hover:bg-blue-50"
                    >
                      {product.name} - Rp {product.price.toLocaleString("id-ID")} (Stok: {product.stock})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Jasa</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleAddItem(service, "service")}
                      className="w-full text-left p-2 border rounded hover:bg-blue-50"
                    >
                      {service.name} - Rp {service.price.toLocaleString("id-ID")}
                    </button>
                  ))}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>Total {orders.length} pesanan</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada pesanan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">No. Pesanan</th>
                    <th className="text-left py-2 px-4 font-semibold">Pelanggan</th>
                    <th className="text-left py-2 px-4 font-semibold">Kendaraan</th>
                    <th className="text-left py-2 px-4 font-semibold">Total</th>
                    <th className="text-left py-2 px-4 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-semibold">{order.order_number}</td>
                      <td className="py-2 px-4">{order.customer_name}</td>
                      <td className="py-2 px-4">{order.vehicle_type}</td>
                      <td className="py-2 px-4">Rp {order.total_amount.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === "Selesai" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetail(order)}>
                            Lihat Detail
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(order)}>
                            Lihat Nota
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">No. Pesanan</p>
                  <p className="font-semibold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nama Pelanggan</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <p className="font-semibold">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipe Kendaraan</p>
                  <p className="font-semibold">{selectedOrder.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plat Nomor</p>
                  <p className="font-semibold">{selectedOrder.plate_number}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Keluhan</p>
                <p className="font-semibold">{selectedOrder.complaint}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{selectedOrder.status}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {selectedOrder.total_amount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
