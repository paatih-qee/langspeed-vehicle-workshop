"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Car, Phone, UserIcon, MessageSquare, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReservasiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    plateNumber: "",
    complaint: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerPhone || !formData.vehicleType || !formData.complaint) {
      toast.error("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: [],
          totalAmount: 0,
          isReservation: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat reservasi")
      }

      setShowSuccessModal(true)
      setFormData({
        customerName: "",
        customerPhone: "",
        vehicleType: "",
        plateNumber: "",
        complaint: "",
      })
    } catch (error: any) {
      setErrorMessage(error.message)
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/img/logo langspeed.png"
              alt="Langspeed Motor"
              width={60}
              height={60}
              className="object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Langspeed Motor</h1>
              <p className="text-gray-600 mt-2">Reservasi Servis Motor</p>
            </div>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Reservasi</h2>
              <p className="text-gray-600">Isi form di bawah untuk membuat reservasi servis motor Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <UserIcon className="h-4 w-4" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="08XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Car className="h-4 w-4" />
                  Jenis Kendaraan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  placeholder="Contoh: Honda Beat 2020"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Car className="h-4 w-4" />
                  Nomor Plat (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="Contoh: B 1234 XYZ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4" />
                  Keluhan / Keperluan Servis <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  placeholder="Jelaskan keluhan atau keperluan servis motor Anda..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full py-6 text-lg">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Mengirim Reservasi...
                  </>
                ) : (
                  "Kirim Reservasi"
                )}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center text-gray-600">
            <p className="text-xs mt-2">
              Butuh bantuan? Hubungi kami di WhatsApp: <strong>(021) 1234-5678</strong>
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Reservasi Berhasil!</DialogTitle>
            <DialogDescription className="text-center text-base pt-4">
              Terima kasih! Reservasi Anda telah diterima. Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal
              dan estimasi biaya servis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => setShowSuccessModal(false)} className="flex-1">
              Tutup
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              Kembali ke Beranda
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Reservasi Gagal</DialogTitle>
            <DialogDescription className="text-center text-base pt-4">
              Maaf, terjadi kesalahan saat memproses reservasi Anda. Silakan coba lagi atau hubungi kami langsung.
            </DialogDescription>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-red-800 text-center">{errorMessage}</p>
              </div>
            )}
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => setShowErrorModal(false)} className="flex-1">
              Coba Lagi
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              Kembali ke Beranda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
