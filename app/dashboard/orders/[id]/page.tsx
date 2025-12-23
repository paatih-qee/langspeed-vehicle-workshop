"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Calendar, User, Phone, Car, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Order = {
  id: string
  customer_name: string
  customer_phone: string
  vehicle_type?: string
  plate_number?: string
  complaint?: string
  status: string
  total_amount: number
  created_at: string
}

type OrderItem = {
  id: string
  item_name: string
  item_type: string
  quantity: number
  price: number
  subtotal: number
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      const data = await response.json()
      setOrder(data.order)
      setItems(data.items)
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Pesanan tidak ditemukan</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu Persetujuan":
        return "bg-yellow-100 text-yellow-800"
      case "Diproses":
        return "bg-blue-100 text-blue-800"
      case "Selesai":
        return "bg-green-100 text-green-800"
      case "Ditolak":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupedItems = items.reduce(
    (acc, item) => {
      if (item.item_type === "product") {
        acc.products.push(item)
      } else {
        acc.services.push(item)
      }
      return acc
    },
    { products: [] as OrderItem[], services: [] as OrderItem[] },
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={20} />
            Kembali
          </Button>
        </div>

        {/* Order Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Pesanan</CardTitle>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Nama Pelanggan</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
              </div>
              {order.vehicle_type && (
                <div className="flex items-center gap-3">
                  <Car className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Jenis Kendaraan</p>
                    <p className="font-medium text-gray-900">{order.vehicle_type}</p>
                  </div>
                </div>
              )}
              {order.plate_number && (
                <div className="flex items-center gap-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">No. Polisi</p>
                    <p className="font-medium text-gray-900">{order.plate_number}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {order.complaint && (
              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <FileText className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Keluhan</p>
                    <p className="font-medium text-gray-900 mt-1">{order.complaint}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedItems.products.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Produk</h3>
                <div className="space-y-2">
                  {groupedItems.products.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">Rp {item.subtotal.toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedItems.services.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Jasa</h3>
                <div className="space-y-2">
                  {groupedItems.services.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">Rp {item.subtotal.toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-lg font-semibold text-gray-900">Total</p>
              <p className="text-2xl font-bold text-blue-600">Rp {order.total_amount.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ubah Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Menunggu Persetujuan">Menunggu Persetujuan</SelectItem>
                  <SelectItem value="Diproses">Diproses</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
