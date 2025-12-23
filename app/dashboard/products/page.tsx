"use client"

import type React from "react"

import { useState } from "react"
import { useProducts } from "@/lib/hooks/use-products"
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

export default function ProductsPage() {
  const { products, isLoading, mutate } = useProducts()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    purchase_price: "",
    stock: "",
  })

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseFloat(formData.price),
          purchase_price: Number.parseFloat(formData.purchase_price),
          stock: Number.parseInt(formData.stock),
        }),
      })

      if (!response.ok) throw new Error("Failed to save product")

      toast.success(editingId ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan")
      setFormData({ name: "", price: "", purchase_price: "", stock: "" })
      setEditingId(null)
      setIsOpen(false)
      mutate()
    } catch (error) {
      toast.error(editingId ? "Gagal memperbarui produk" : "Gagal menambahkan produk")
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingId) return

    try {
      const response = await fetch(`/api/products/${deletingId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete product")

      toast.success("Produk berhasil dihapus")
      setDeletingId(null)
      setIsDeleteOpen(false)
      mutate()
    } catch (error) {
      toast.error("Gagal menghapus produk")
    }
  }

  const handleEditClick = (product: any) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      purchase_price: product.purchase_price.toString(),
      stock: product.stock.toString(),
    })
    setIsOpen(true)
  }

  const handleDeleteClick = (productId: string) => {
    setDeletingId(productId)
    setIsDeleteOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditingId(null)
    setFormData({ name: "", price: "", purchase_price: "", stock: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-2">Kelola daftar produk dan stok</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleCloseModal())}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui detail produk" : "Masukkan detail produk baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Perbarui Produk" : "Simpan Produk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>Total {products.length} produk</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-500">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada produk</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">Nama</th>
                    <th className="text-left py-2 px-4 font-semibold">Harga Jual</th>
                    <th className="text-left py-2 px-4 font-semibold">Harga Beli</th>
                    <th className="text-left py-2 px-4 font-semibold">Stok</th>
                    <th className="text-left py-2 px-4 font-semibold">Margin</th>
                    <th className="text-left py-2 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td
                        className={`py-2 px-4 ${
                          product.stock === 0 ? "text-gray-400" : product.stock < 5 ? "text-red-600 font-semibold" : ""
                        }`}
                      >
                        {product.name}
                      </td>
                      <td className="py-2 px-4">Rp {product.price.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-4">Rp {product.purchase_price.toLocaleString("id-ID")}</td>
                      <td
                        className={`py-2 px-4 ${
                          product.stock === 0 ? "text-gray-400" : product.stock < 5 ? "text-red-600 font-semibold" : ""
                        }`}
                      >
                        {product.stock}
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-green-600 font-semibold">
                          {(((product.price - product.purchase_price) / product.price) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(product.id)}
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
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
