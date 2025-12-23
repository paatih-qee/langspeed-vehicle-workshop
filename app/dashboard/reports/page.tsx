"use client"

import { useState, useEffect } from "react"
import { useProfitLoss } from "@/lib/hooks/use-profit-loss"
import { useUserRole } from "@/lib/hooks/use-user-role"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Printer } from "lucide-react"

export default function ReportsPage() {
  const { role, isLoading: roleLoading } = useUserRole()
  const router = useRouter()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { report, isLoading } = useProfitLoss(startDate, endDate)

  useEffect(() => {
    if (!roleLoading && role !== "super_admin") {
      router.push("/dashboard")
    }
  }, [role, roleLoading, router])

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
  }

  const handlePrint = () => {
    window.print()
  }

  const isDateFilterComplete = startDate && endDate

  if (roleLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  }

  if (role !== "super_admin") {
    return null
  }

  const chartData = report
    ? [
        {
          name: "Pendapatan",
          value: report.totalRevenue,
        },
        {
          name: "Biaya",
          value: report.totalCost,
        },
        {
          name: "Laba",
          value: report.totalProfit,
        },
      ]
    : []

  const revenueBreakdown = report
    ? [
        {
          name: "Produk",
          value: report.productRevenue,
        },
        {
          name: "Jasa",
          value: report.serviceRevenue,
        },
      ]
    : []

  const COLORS = ["#3b82f6", "#ef4444", "#10b981"]
  const REVENUE_COLORS = ["#8b5cf6", "#f59e0b"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-600 mt-2">Analisis laba dan rugi bisnis Anda</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
              <Button onClick={handlePrint} disabled={!isDateFilterComplete} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Rp {report.totalRevenue.toLocaleString("id-ID")}</div>
              <p className="text-xs text-gray-500 mt-1">{report.itemsSold} item terjual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rp {report.totalCost.toLocaleString("id-ID")}</div>
              <p className="text-xs text-gray-500 mt-1">Harga pokok penjualan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Laba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${report.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                Rp {report.totalProfit.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-gray-500 mt-1">Keuntungan bersih</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Margin Laba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${report.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                {report.profitMargin.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Persentase keuntungan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Perbandingan Pendapatan, Biaya, dan Laba</CardTitle>
              <CardDescription>Visualisasi ringkas keuangan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Keuangan</CardTitle>
              <CardDescription>Proporsi pendapatan, biaya, dan laba</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: Rp ${value.toLocaleString("id-ID")}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pendapatan Produk vs Jasa</CardTitle>
              <CardDescription>Perbandingan sumber pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: Rp ${value.toLocaleString("id-ID")}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {REVENUE_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Section */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Laporan</CardTitle>
            <CardDescription>Periode: {report.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Pendapatan:</span>
                <span className="font-semibold">Rp {report.totalRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Pendapatan dari Produk:</span>
                <span className="font-semibold">Rp {report.productRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Pendapatan dari Jasa:</span>
                <span className="font-semibold">Rp {report.serviceRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Biaya (HPP):</span>
                <span className="font-semibold">Rp {report.totalCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Laba Kotor:</span>
                <span className="font-semibold text-green-600">
                  Rp {(report.totalRevenue - report.totalCost).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jumlah Pesanan:</span>
                <span className="font-semibold">{report.orderCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="text-center text-gray-500">Memuat laporan...</div>}
    </div>
  )
}
