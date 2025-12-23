"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  item_name: string
  item_type: "product" | "service"
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  vehicle_type: string
  plate_number: string
  complaint: string
  total_amount: number
  status: "Diproses" | "Selesai"
  created_at: string
}

export default function InvoicePage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch order")

        const data = await response.json()
        setOrder(data.order)
        setItems(data.items)
      } catch (error) {
        toast.error("Gagal memuat nota")
        router.push("/dashboard/orders")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrderDetails()
    }
  }, [params.id, router])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>
  }

  if (!order) {
    return <div className="text-center text-gray-500">Nota tidak ditemukan</div>
  }

  const statusColor = order.status === "Selesai" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"

  return (
    <div className="min-h-screen bg-white">
      {/* Header - No Print */}
      <div className="no-print bg-white border-b border-gray-200 p-6 flex justify-between items-center">
        <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <ArrowLeft size={16} />
          Kembali ke Riwayat Order
        </Link>
        <Button onClick={handlePrint} className="gap-2">
          <Printer size={16} />
          Cetak Halaman Ini
        </Button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Company Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-4xl font-bold text-gray-900">LANGSPEED MOTOR</h1>
          <p className="text-gray-600 mt-2">Email: langspeedmotor.jaktim@gmail.com | Telp: (021) 1234-5678</p>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">NOTA SERVIS</h2>
        </div>

        {/* Order and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Informasi Order</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">No. Order:</span>
                <span className="font-semibold text-gray-900">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>{order.status}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-semibold text-gray-900">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-semibold text-gray-900">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kendaraan:</span>
                <span className="font-semibold text-gray-900">{order.vehicle_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">No. Polisi:</span>
                <span className="font-semibold text-gray-900">{order.plate_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Keluhan</h3>
          <p className="text-gray-900 text-sm">{order.complaint}</p>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Detail Item</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama Item</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipe</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Jumlah</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Harga Satuan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-900">{item.item_name}</td>
                  <td className="py-3 px-4 text-gray-900 text-sm">
                    {item.item_type === "product" ? "Produk" : "Jasa"}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-900">Rp {item.price.toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4 text-right text-gray-900">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={5} className="py-3 px-4 text-right font-bold text-gray-900">
                  TOTAL:
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  Rp {order.total_amount.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 text-center text-xs text-gray-600">
          <p>Terima kasih atas kepercayaan Anda menggunakan layanan Langspeed Motor</p>
          <p>
            Nota ini dicetak pada: {new Date().toLocaleDateString("id-ID")} pukul{" "}
            {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100%;
          }
          table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
