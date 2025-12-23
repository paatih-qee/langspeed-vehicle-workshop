"use client"

import type React from "react"

import { useState } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function ServicesPage() {
  const { services, isLoading, mutate } = useServices()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  })

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/services/${editingId}` : "/api/services"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseFloat(formData.price),
        }),
      })

      if (!response.ok) throw new Error("Failed to save service")

      toast.success(editingId ? "Jasa berhasil diperbarui" : "Jasa berhasil ditambahkan")
      setFormData({ name: "", price: "" })
      setEditingId(null)
      setIsOpen(false)
      mutate()
    } catch (error) {
      toast.error(editingId ? "Gagal memperbarui jasa" : "Gagal menambahkan jasa")
    }
  }

  const handleDeleteService = async () => {
    if (!deletingId) return

    try {
      const response = await fetch(`/api/services/${deletingId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete service")

      toast.success("Jasa berhasil dihapus")
      setDeletingId(null)
      setIsDeleteOpen(false)
      mutate()
    } catch (error) {
      toast.error("Gagal menghapus jasa")
    }
  }

  const handleEditClick = (service: any) => {
    setEditingId(service.id)
    setFormData({
      name: service.name,
      price: service.price.toString(),
    })
    setIsOpen(true)
  }

  const handleDeleteClick = (serviceId: string) => {
    setDeletingId(serviceId)
    setIsDeleteOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditingId(null)
    setFormData({ name: "", price: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jasa</h1>
          <p className="text-gray-600 mt-2">Kelola daftar jasa yang ditawarkan</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleCloseModal())}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>Tambah Jasa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Jasa" : "Tambah Jasa Baru"}</DialogTitle>
              <DialogDescription>{editingId ? "Perbarui detail jasa" : "Masukkan detail jasa baru"}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jasa</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ganti Oli, Servis Rem, dll"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jasa</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Masukkan harga jasa"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Perbarui Jasa" : "Simpan Jasa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jasa</CardTitle>
          <CardDescription>Total {services.length} jasa</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-500">Memuat jasa...</div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada jasa</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">Nama Jasa</th>
                    <th className="text-left py-2 px-4 font-semibold">Harga Jasa</th>
                    <th className="text-left py-2 px-4 font-semibold">Tanggal Dibuat</th>
                    <th className="text-left py-2 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{service.name}</td>
                      <td className="py-2 px-4 font-semibold">Rp {service.price.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {new Date(service.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(service)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(service.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
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

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jasa</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jasa ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
