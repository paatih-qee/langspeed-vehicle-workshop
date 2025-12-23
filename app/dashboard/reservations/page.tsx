"use client"

import { useState } from "react"
import { useOrders } from "@/lib/hooks/use-orders"
import { useProducts } from "@/lib/hooks/use-products"
import { useServices } from "@/lib/hooks/use-services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CheckCircle, XCircle, Eye, Plus, Trash2 } from "lucide-react"

interface OrderItem {
  itemId: string
  itemName: string
  itemType: "product" | "service"
  quantity: number
  price: number
  purchase_price: number
}

export default function ReservationsPage() {
  const { orders, mutate } = useOrders()
  const { products } = useProducts()
  const { services } = useServices()
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedItem, setSelectedItem] = useState("")
  const [selectedType, setSelectedType] = useState<"product" | "service">("product")
  const [quantity, setQuantity] = useState("1")
  const [processing, setProcessing] = useState(false)

  const pendingReservations = orders.filter((order) => order.is_reservation && order.approval_status === "pending")

  const handleReview = (reservation: any) => {
    setSelectedReservation(reservation)
    setItems([])
    setIsReviewModalOpen(true)
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
    toast.success(`${item.name} ditambahkan`)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleApprove = async () => {
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu item untuk menyetujui reservasi")
      return
    }

    setProcessing(true)
    try {
      // Add items to order
      const itemsResponse = await fetch(`/api/orders/${selectedReservation.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      if (!itemsResponse.ok) throw new Error("Failed to add items")

      // Update approval status
      const approvalResponse = await fetch(`/api/orders/${selectedReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_status: "approved" }),
      })

      if (!approvalResponse.ok) throw new Error("Failed to approve reservation")

      toast.success("Reservasi disetujui dan item telah ditambahkan")
      setIsReviewModalOpen(false)
      mutate()
    } catch (error) {
      toast.error("Gagal menyetujui reservasi")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/orders/${selectedReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_status: "rejected" }),
      })

      if (!response.ok) throw new Error("Failed to reject reservation")

      toast.success("Reservasi ditolak")
      setIsReviewModalOpen(false)
      mutate()
    } catch (error) {
      toast.error("Gagal menolak reservasi")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Reservasi</h1>
        <p className="text-gray-600 mt-2">Review dan setujui reservasi dari pelanggan</p>
      </div>

      {pendingReservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Tidak ada reservasi yang menunggu persetujuan
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingReservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {reservation.order_number} • {new Date(reservation.created_at).toLocaleDateString("id-ID")}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Menunggu Persetujuan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{reservation.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kendaraan</p>
                    <p className="font-medium">{reservation.vehicle_type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Keluhan</p>
                    <p className="font-medium">{reservation.complaint}</p>
                  </div>
                </div>
                <Button onClick={() => handleReview(reservation)} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Review & Proses Reservasi
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Reservasi</DialogTitle>
            <DialogDescription>Tambahkan item produk/jasa yang dibutuhkan untuk reservasi ini</DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama</p>
                    <p className="font-medium">{selectedReservation.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{selectedReservation.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kendaraan</p>
                    <p className="font-medium">{selectedReservation.vehicle_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plat Nomor</p>
                    <p className="font-medium">{selectedReservation.plate_number || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Keluhan</p>
                    <p className="font-medium">{selectedReservation.complaint}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Add Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tambahkan Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipe</label>
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
                      <label className="block text-sm font-medium mb-1">Item</label>
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
                                {product.name} - Rp {product.price.toLocaleString("id-ID")} (Stok: {product.stock})
                              </option>
                            ))
                          : services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} - Rp {service.price.toLocaleString("id-ID")}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kuantitas</label>
                      <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                  </div>
                  <Button type="button" onClick={handleAddItem} variant="secondary" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambahkan Item
                  </Button>
                </CardContent>
              </Card>

              {/* Items List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Item yang Ditambahkan ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Belum ada item ditambahkan</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x Rp {item.price.toLocaleString("id-ID")} = Rp{" "}
                              {(item.price * item.quantity).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total</span>
                          <span className="font-semibold text-lg text-blue-600">
                            Rp{" "}
                            {items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
                <Button onClick={handleApprove} disabled={processing || items.length === 0} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui & Proses
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
